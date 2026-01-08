import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscribeRequest {
  email: string;
}

const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("x-real-ip") || 
                     "unknown";

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Rate limiting: max 3 signups per hour per IP
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentAttempts } = await supabase
      .from("newsletter_rate_limit")
      .select("*", { count: "exact", head: true })
      .eq("ip_address", clientIP)
      .gte("created_at", oneHourAgo);

    if (recentAttempts && recentAttempts >= 3) {
      return new Response(
        JSON.stringify({ error: "rate limit exceeded" }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { email }: SubscribeRequest = await req.json();

    // Validate email
    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 255) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const sanitizedEmail = email.trim().toLowerCase();

    // Check if already subscribed
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id, is_active")
      .eq("email", sanitizedEmail)
      .maybeSingle();

    if (existing) {
      if (existing.is_active) {
        return new Response(
          JSON.stringify({ error: "already subscribed" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      } else {
        // Reactivate subscription
        await supabase
          .from("newsletter_subscribers")
          .update({ is_active: true, unsubscribed_at: null })
          .eq("id", existing.id);
      }
    } else {
      // Insert new subscriber
      const { error: insertError } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: sanitizedEmail });

      if (insertError) {
        console.error("Insert error:", insertError);
        throw new Error("Failed to subscribe");
      }
    }

    // Record rate limit entry
    await supabase.from("newsletter_rate_limit").insert({ ip_address: clientIP });

    // Send confirmation email using Resend API directly
    try {
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Sacred Escapes <onboarding@resend.dev>",
          to: [sanitizedEmail],
          subject: "Dobrodošli med naročniki Sacred Escapes!",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Georgia, serif; background-color: #f9f7f4; margin: 0; padding: 40px 20px;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <div style="background-color: #1a1a2e; padding: 40px; text-align: center;">
                  <h1 style="color: #d4af37; margin: 0; font-size: 28px; letter-spacing: 2px;">Sacred Escapes</h1>
                </div>
                <div style="padding: 40px;">
                  <h2 style="color: #1a1a2e; margin-top: 0;">Dobrodošli! 🌟</h2>
                  <p style="color: #444; line-height: 1.8; font-size: 16px;">
                    Hvala za prijavo na naše novičke! Od zdaj naprej boste med prvimi obveščeni o:
                  </p>
                  <ul style="color: #444; line-height: 2; font-size: 16px;">
                    <li>Novih ekskluzivnih destinacijah</li>
                    <li>Posebnih ponudbah in ugodnostih</li>
                    <li>Navdihujočih potovalnih zgodbah</li>
                    <li>Praktičnih nasvetih za nepozabna potovanja</li>
                  </ul>
                  <p style="color: #444; line-height: 1.8; font-size: 16px;">
                    Veselimo se, da vas lahko popeljemo na pot do nepozabnih izkušenj.
                  </p>
                  <p style="color: #666; font-style: italic; margin-top: 30px;">
                    S spoštovanjem,<br>
                    Ekipa Sacred Escapes
                  </p>
                </div>
                <div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
                  <p style="color: #888; font-size: 12px; margin: 0;">
                    To sporočilo ste prejeli, ker ste se prijavili na novičke Sacred Escapes.
                  </p>
                </div>
              </div>
            </body>
            </html>
          `,
        }),
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.text();
        console.error("Resend API error:", errorData);
      }
    } catch (emailError) {
      // Log but don't fail the subscription if email fails
      console.error("Failed to send confirmation email:", emailError);
    }

    // Clean up old rate limit entries
    const cleanupTime = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    await supabase.from("newsletter_rate_limit").delete().lt("created_at", cleanupTime);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Newsletter subscription error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
