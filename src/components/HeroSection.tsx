import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import heroImage from "@/assets/hero-wedding.jpg";

const HeroSection = () => {
  const scrollToServices = () => {
    document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/30 via-foreground/20 to-foreground/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <p
          className="text-gold-light tracking-[0.3em] uppercase text-sm md:text-base mb-6 animate-fade-in-up font-medium"
          style={{ animationDelay: "0.2s" }}
        >
          Luxury Destinations & Experiences
        </p>

        <h1
          className="font-display text-5xl md:text-7xl lg:text-8xl text-card font-semibold mb-6 animate-fade-in-up leading-tight"
          style={{ animationDelay: "0.4s" }}
        >
          Sacred Escapes.
          <br />
          <span className="italic font-normal">Soulful Moments.</span>
        </h1>

        <p
          className="text-card/90 text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-fade-in-up font-light leading-relaxed"
          style={{ animationDelay: "0.6s" }}
        >
          Create unforgettable memories with our bespoke beach weddings,
          transformative spiritual retreats, and curated luxury travel
          experiences.
        </p>

        <div
          className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up"
          style={{ animationDelay: "0.8s" }}
        >
          <Button
            variant="luxury"
            size="xl"
            onClick={() =>
              document
                .getElementById("contact")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Start Your Journey
          </Button>
          <Button
            variant="luxury-white"
            size="xl"
            onClick={scrollToServices}
          >
            Explore Services
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToServices}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-card/80 hover:text-card transition-colors animate-bounce cursor-pointer"
        aria-label="Scroll down"
      >
        <ChevronDown size={32} />
      </button>
    </section>
  );
};

export default HeroSection;
