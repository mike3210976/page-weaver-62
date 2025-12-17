import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InquiryRequest {
  name: string;
  email: string;
  service?: string;
  destination?: string;
  date?: string;
  message: string;
}

// HTML escape function to prevent injection
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const RATE_LIMIT_MAX = 5; // Max submissions per hour
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
               req.headers.get("x-real-ip") || 
               "unknown";

    // Initialize Supabase client with service role
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Check rate limit
    const oneHourAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { data: recentSubmissions, error: rateLimitError } = await supabase
      .from("inquiry_rate_limit")
      .select("id")
      .eq("ip_address", ip)
      .gte("created_at", oneHourAgo);

    if (rateLimitError) {
      console.error("Rate limit check error:", rateLimitError);
    }

    if (recentSubmissions && recentSubmissions.length >= RATE_LIMIT_MAX) {
      console.log(`Rate limit exceeded for IP: ${ip}`);
      return new Response(
        JSON.stringify({ error: "Too many submissions. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { name, email, service, destination, date, message }: InquiryRequest = await req.json();

    console.log(`Inquiry received from: ${name} (${email})`);

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Name, email, and message are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Format service name for display
    const serviceNames: Record<string, string> = {
      "beach-wedding": "Beach Wedding",
      "spiritual-retreat": "Spiritual Retreat",
      "exotic-travel": "Exotic Travel",
      "romantic-escape": "Romantic Escape",
    };

    const serviceName = service ? serviceNames[service] || escapeHtml(service) : "Not specified";

    // Escape all user inputs for HTML email
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeDestination = destination ? escapeHtml(destination) : "Not specified";
    const safeDate = date ? escapeHtml(date) : "Not specified";
    const safeMessage = escapeHtml(message);

    // Send email to business owner using Resend API directly
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Sacred Escapes <onboarding@resend.dev>",
        to: ["pisarna321@gmail.com"],
        reply_to: email,
        subject: `New Inquiry from ${safeName} - Sacred Escapes`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #b8860b; border-bottom: 2px solid #b8860b; padding-bottom: 10px;">
              New Inquiry Received
            </h1>
            
            <div style="background-color: #faf8f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #333; margin-top: 0;">Contact Details</h2>
              <p><strong>Name:</strong> ${safeName}</p>
              <p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
            </div>

            <div style="background-color: #faf8f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #333; margin-top: 0;">Inquiry Details</h2>
              <p><strong>Service:</strong> ${serviceName}</p>
              <p><strong>Destination:</strong> ${safeDestination}</p>
              <p><strong>Preferred Date:</strong> ${safeDate}</p>
            </div>

            <div style="background-color: #faf8f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #333; margin-top: 0;">Message</h2>
              <p style="white-space: pre-wrap;">${safeMessage}</p>
            </div>

            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              This inquiry was submitted through the Sacred Escapes website.
            </p>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error("Resend API error:", errorData);
      throw new Error(errorData.message || "Failed to send email");
    }

    // Record submission for rate limiting
    const { error: insertError } = await supabase
      .from("inquiry_rate_limit")
      .insert({ ip_address: ip });

    if (insertError) {
      console.error("Failed to record rate limit:", insertError);
    }

    console.log("Email sent successfully");

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-inquiry function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
