import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const ALLOWED_EXTENSIONS = ["mp4", "webm", "mov"];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

function getExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
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
    const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userSupabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const sectionKey = formData.get("sectionKey") as string | null;

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!sectionKey) {
      return new Response(
        JSON.stringify({ error: "No section key provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: "File size exceeds 100MB limit" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate extension
    const extension = getExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return new Response(
        JSON.stringify({ error: "Invalid file type. Only MP4, WEBM, and MOV are allowed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate MIME type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: "Invalid file type. Only video files are allowed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Create Supabase client with service role
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate safe filename
    const sanitizedSection = sectionKey.replace(/\s+/g, "-").toLowerCase();
    const timestamp = Date.now();
    const randomId = crypto.randomUUID().split("-")[0];
    const safeFileName = `${sanitizedSection}-${timestamp}-${randomId}.${extension}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("videos")
      .upload(safeFileName, bytes, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return new Response(
        JSON.stringify({ error: "Failed to upload video" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("videos")
      .getPublicUrl(safeFileName);

    // Save to database
    const { data: dbData, error: dbError } = await supabase
      .from("section_videos")
      .insert({
        section_key: sectionKey,
        video_url: urlData.publicUrl,
      })
      .select("id, video_url")
      .single();

    if (dbError) {
      console.error("Database insert error:", dbError);
      await supabase.storage.from("videos").remove([safeFileName]);
      return new Response(
        JSON.stringify({ error: "Failed to save video reference" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
