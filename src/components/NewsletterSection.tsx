import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.string().trim().email({ message: "Please enter a valid email address" });

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate email
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: functionError } = await supabase.functions.invoke("subscribe-newsletter", {
        body: { email: result.data },
      });

      if (functionError) {
        throw new Error(functionError.message || "Subscription failed");
      }

      setIsSubscribed(true);
      setEmail("");
      toast({
        title: "Successfully subscribed!",
        description: "Thank you for subscribing to our newsletter.",
      });
    } catch (err: any) {
      console.error("Newsletter subscription error:", err);
      const message = err.message || "Subscription failed. Please try again.";
      
      if (message.includes("already subscribed") || message.includes("duplicate")) {
        setError("This email address is already subscribed.");
      } else if (message.includes("rate limit")) {
        setError("Too many attempts. Please try again in a few minutes.");
      } else {
        setError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-primary/5">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
        </div>

        <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
          Subscribe to Our Newsletter
        </h2>

        <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
          Stay informed about our latest experiences, exclusive offers, and inspiring journeys. 
          Receive updates directly in your inbox.
        </p>

        {isSubscribed ? (
          <div className="flex items-center justify-center gap-3 text-primary animate-fade-in">
            <CheckCircle className="w-6 h-6" />
            <span className="text-lg font-medium">Thank you for subscribing!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className="h-12"
                  disabled={isSubmitting}
                  aria-label="Email address"
                />
              </div>
              <Button
                type="submit"
                variant="luxury"
                className="h-12 px-8"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  "Subscribe"
                )}
              </Button>
            </div>
            {error && (
              <p className="text-destructive text-sm mt-2 animate-fade-in">{error}</p>
            )}
            <p className="text-muted-foreground text-xs mt-4">
              By subscribing, you agree to receive our newsletter. You can unsubscribe at any time.
            </p>
          </form>
        )}
      </div>
    </section>
  );
};

export default NewsletterSection;
