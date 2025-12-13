import { Button } from "@/components/ui/button";
import { Mail, ArrowRight } from "lucide-react";

const ContactSection = () => {
  return (
    <section className="py-24 px-4 bg-foreground text-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-24 h-24 rounded-full border-4 border-primary/30 animate-spin-slow" />
      <div className="absolute bottom-10 right-10 w-32 h-32 rounded-2xl bg-secondary/20 rotate-12 animate-float" />
      <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full bg-accent/20 animate-bounce-soft" />
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-8">
          <Mail className="w-10 h-10 text-primary" />
        </div>
        
        <h2 className="text-4xl md:text-6xl font-bold font-display mb-6">
          Let's create something <span className="text-primary">amazing</span> together
        </h2>
        
        <p className="text-xl text-background/70 mb-10 max-w-2xl mx-auto">
          Got a project in mind? I'd love to hear about it. Drop me a message and 
          let's make magic happen!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="playful" size="xl" className="group">
            Say Hello
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
        
        <p className="mt-8 text-background/50">
          or email me at{" "}
          <a href="mailto:hello@alexcreative.com" className="text-primary hover:underline font-medium">
            hello@alexcreative.com
          </a>
        </p>
      </div>
    </section>
  );
};

export default ContactSection;
