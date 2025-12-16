import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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

function sanitizeFileName(fileName: string): string {
  // Remove path traversal attempts and special characters
  const sanitized = fileName
    .replace(/\.\./g, "")
    .replace(/[\/\\]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .toLowerCase();
  return sanitized;
}

function getExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify user is authenticated
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("No authorization header");
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's JWT to verify auth
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
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

    console.log(`Authenticated user: ${user.id}`);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const serviceType = formData.get("serviceType") as string | null;

    console.log(`Upload request received for service: ${serviceType}`);

    if (!file) {
      console.error("No file provided");
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!serviceType) {
      console.error("No service type provided");
      return new Response(
        JSON.stringify({ error: "No service type provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      console.error(`File too large: ${file.size} bytes`);
      return new Response(
        JSON.stringify({ error: "File size exceeds 10MB limit" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate file extension
    const extension = getExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      console.error(`Invalid extension: ${extension}`);
      return new Response(
        JSON.stringify({ error: "Invalid file type. Only JPG, PNG, and WEBP are allowed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate MIME type
    const declaredType = file.type;
    if (!Object.keys(ALLOWED_TYPES).includes(declaredType)) {
      console.error(`Invalid MIME type: ${declaredType}`);
      return new Response(
        JSON.stringify({ error: "Invalid file type. Only images are allowed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Read file bytes and validate magic bytes
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    const expectedPatterns = ALLOWED_TYPES[declaredType];
    if (!validateMagicBytes(bytes, expectedPatterns)) {
      console.error("Magic bytes validation failed - file type spoofing detected");
      return new Response(
        JSON.stringify({ error: "File content does not match declared type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`File validation passed: ${file.name}, size: ${file.size}, type: ${declaredType}`);

    // Create Supabase client with service role for storage operations
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate safe filename
    const sanitizedService = serviceType.replace(/\s+/g, "-").toLowerCase();
    const timestamp = Date.now();
    const randomId = crypto.randomUUID().split("-")[0];
    const safeFileName = `${sanitizedService}-${timestamp}-${randomId}.${extension}`;

    console.log(`Uploading file as: ${safeFileName}`);

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("service-images")
      .upload(safeFileName, bytes, {
        contentType: declaredType,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return new Response(
        JSON.stringify({ error: "Failed to upload file" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("service-images")
      .getPublicUrl(safeFileName);

    // Save to database
    const { data: dbData, error: dbError } = await supabase
      .from("service_images")
      .insert({
        service_type: serviceType,
        image_url: urlData.publicUrl,
      })
      .select("id, image_url")
      .single();

    if (dbError) {
      console.error("Database insert error:", dbError);
      // Clean up the uploaded file
      await supabase.storage.from("service-images").remove([safeFileName]);
      return new Response(
        JSON.stringify({ error: "Failed to save image reference" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Upload successful: ${dbData.id}`);

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
