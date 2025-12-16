import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, service, destination, date, message }: InquiryRequest = await req.json();

    console.log(`Inquiry received from: ${name} (${email})`);

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Name, email, and message are required" }),
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

    const serviceName = service ? serviceNames[service] || service : "Not specified";

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
        subject: `New Inquiry from ${name} - Sacred Escapes`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #b8860b; border-bottom: 2px solid #b8860b; padding-bottom: 10px;">
              New Inquiry Received
            </h1>
            
            <div style="background-color: #faf8f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #333; margin-top: 0;">Contact Details</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            </div>

            <div style="background-color: #faf8f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #333; margin-top: 0;">Inquiry Details</h2>
              <p><strong>Service:</strong> ${serviceName}</p>
              <p><strong>Destination:</strong> ${destination || "Not specified"}</p>
              <p><strong>Preferred Date:</strong> ${date || "Not specified"}</p>
            </div>

            <div style="background-color: #faf8f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #333; margin-top: 0;">Message</h2>
              <p style="white-space: pre-wrap;">${message}</p>
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
