import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Allowed MIME types and their magic bytes
const ALLOWED_TYPES: Record<string, Uint8Array[]> = {
  "image/jpeg": [new Uint8Array([0xff, 0xd8, 0xff])],
  "image/png": [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
  "image/webp": [new Uint8Array([0x52, 0x49, 0x46, 0x46])], // RIFF header
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

function validateMagicBytes(bytes: Uint8Array, expectedPatterns: Uint8Array[]): boolean {
  return expectedPatterns.some((pattern) => {
    if (bytes.length < pattern.length) return false;
    for (let i = 0; i < pattern.length; i++) {
      if (bytes[i] !== pattern[i]) return false;
    }
    return true;
  });
}

function getExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify auth using user's JWT
    const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userSupabase.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const destinationId = formData.get("destinationId") as string | null;

    if (!file || !destinationId) {
      return new Response(
        JSON.stringify({ error: "File and destinationId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!isUuid(destinationId)) {
      return new Response(
        JSON.stringify({ error: "Invalid destinationId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: "File size exceeds 10MB limit" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const extension = getExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return new Response(
        JSON.stringify({ error: "Invalid file type. Only JPG, PNG, and WEBP allowed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!Object.keys(ALLOWED_TYPES).includes(file.type)) {
      return new Response(
        JSON.stringify({ error: "Invalid file type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const expected = ALLOWED_TYPES[file.type];
    if (!validateMagicBytes(bytes, expected)) {
      return new Response(
        JSON.stringify({ error: "File content does not match declared type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Service role client for storage + DB writes
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // determine next display order
    const { data: maxRow, error: maxErr } = await supabase
      .from("destination_images")
      .select("display_order")
      .eq("destination_id", destinationId)
      .order("display_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (maxErr) {
      console.error("Failed to fetch max display_order:", maxErr);
      return new Response(
        JSON.stringify({ error: "Failed to prepare upload" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const nextOrder = (maxRow?.display_order ?? -1) + 1;

    // safe filename
    const timestamp = Date.now();
    const randomId = crypto.randomUUID().split("-")[0];
    const objectPath = `${destinationId}/${timestamp}-${randomId}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("destination-images")
      .upload(objectPath, bytes, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return new Response(
        JSON.stringify({ error: "Failed to upload file" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: urlData } = supabase.storage.from("destination-images").getPublicUrl(objectPath);

    const { data: dbData, error: dbError } = await supabase
      .from("destination_images")
      .insert({
        destination_id: destinationId,
        image_url: urlData.publicUrl,
        display_order: nextOrder,
      })
      .select("id, image_url, display_order")
      .single();

    if (dbError) {
      console.error("DB insert error:", dbError);
      await supabase.storage.from("destination-images").remove([objectPath]);
      return new Response(
        JSON.stringify({ error: "Failed to save image reference" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Destination image uploaded by ${user.id}: ${dbData.id}`);

    return new Response(
      JSON.stringify({ success: true, data: dbData }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
