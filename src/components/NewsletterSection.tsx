import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.string().trim().email({ message: "Vnesite veljaven e-poštni naslov" });

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
        throw new Error(functionError.message || "Napaka pri prijavi");
      }

      setIsSubscribed(true);
      setEmail("");
      toast({
        title: "Uspešna prijava!",
        description: "Hvala za prijavo na naše novičke.",
      });
    } catch (err: any) {
      console.error("Newsletter subscription error:", err);
      const message = err.message || "Napaka pri prijavi. Poskusite znova.";
      
      if (message.includes("already subscribed") || message.includes("duplicate")) {
        setError("Ta e-poštni naslov je že prijavljen.");
      } else if (message.includes("rate limit")) {
        setError("Preveč poskusov. Poskusite znova čez nekaj minut.");
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
          Prijavite se na novičke
        </h2>

        <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
          Bodite obveščeni o najnovejših izkušnjah, ekskluzivnih ponudbah in navdihujočih potovanjih. 
          Prejmite novosti neposredno v vaš e-poštni nabiralnik.
        </p>

        {isSubscribed ? (
          <div className="flex items-center justify-center gap-3 text-primary animate-fade-in">
            <CheckCircle className="w-6 h-6" />
            <span className="text-lg font-medium">Hvala za prijavo!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Vaš e-poštni naslov"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className="h-12"
                  disabled={isSubmitting}
                  aria-label="E-poštni naslov"
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
                    Pošiljam...
                  </>
                ) : (
                  "Prijava"
                )}
              </Button>
            </div>
            {error && (
              <p className="text-destructive text-sm mt-2 animate-fade-in">{error}</p>
            )}
            <p className="text-muted-foreground text-xs mt-4">
              S prijavo se strinjate s prejemanjem naših novičk. Lahko se kadarkoli odjavite.
            </p>
          </form>
        )}
      </div>
    </section>
  );
};

export default NewsletterSection;
