import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { id, imageUrl } = await req.json();

    console.log(`Delete request received for image ID: ${id}`);

    if (!id || !imageUrl) {
      console.error("Missing required parameters");
      return new Response(
        JSON.stringify({ error: "Missing image ID or URL" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate UUID format to prevent injection
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      console.error("Invalid UUID format");
      return new Response(
        JSON.stringify({ error: "Invalid image ID format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the image exists before deleting
    const { data: existingImage, error: fetchError } = await supabase
      .from("service_images")
      .select("id, image_url")
      .eq("id", id)
      .single();

    if (fetchError || !existingImage) {
      console.error("Image not found:", fetchError);
      return new Response(
        JSON.stringify({ error: "Image not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract filename from URL safely
    const urlParts = imageUrl.split("/");
    const fileName = urlParts[urlParts.length - 1];
    
    // Validate filename doesn't contain path traversal
    if (fileName.includes("..") || fileName.includes("/") || fileName.includes("\\")) {
      console.error("Invalid filename detected");
      return new Response(
        JSON.stringify({ error: "Invalid filename" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Delete from storage
    if (fileName) {
      const { error: storageError } = await supabase.storage
        .from("service-images")
        .remove([fileName]);
      
      if (storageError) {
        console.error("Storage delete error:", storageError);
        // Continue to delete from database even if storage fails
      }
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from("service_images")
      .delete()
      .eq("id", id);

    if (dbError) {
      console.error("Database delete error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to delete image" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully deleted image: ${id}`);

    return new Response(
      JSON.stringify({ success: true }),
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
