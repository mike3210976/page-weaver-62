import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function extractObjectPathFromPublicUrl(imageUrl: string): string | null {
  try {
    const marker = "/destination-images/";
    const idx = imageUrl.indexOf(marker);
    if (idx === -1) return null;
    const raw = imageUrl.slice(idx + marker.length);
    const path = decodeURIComponent(raw);

    // basic traversal protection
    if (!path || path.includes("..") || path.startsWith("/") || path.includes("\\")) return null;

    return path;
  } catch {
    return null;
  }
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

    const { id } = await req.json();
    if (!id || typeof id !== "string" || !isUuid(id)) {
      return new Response(
        JSON.stringify({ error: "Invalid image id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: row, error: fetchError } = await supabase
      .from("destination_images")
      .select("id, image_url")
      .eq("id", id)
      .single();

    if (fetchError || !row) {
      return new Response(
        JSON.stringify({ error: "Image not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const objectPath = extractObjectPathFromPublicUrl(row.image_url);
    if (objectPath) {
      const { error: storageError } = await supabase.storage
        .from("destination-images")
        .remove([objectPath]);
      if (storageError) {
        console.error("Storage delete error:", storageError);
        // Continue: DB delete still removes from gallery
      }
    }

    const { error: dbError } = await supabase
      .from("destination_images")
      .delete()
      .eq("id", id);

    if (dbError) {
      console.error("DB delete error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to delete image" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Destination image deleted by ${user.id}: ${id}`);

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
