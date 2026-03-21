import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import beachWeddingBrideImage from "@/assets/beach-wedding-bride.jpg";
import spiritualRetreatImage from "@/assets/spiritual-retreat.jpg";
import exoticTravelImage from "@/assets/exotic-travel.jpg";
import romanticEscapeImage from "@/assets/romantic-escape-new.jpg";
import ServiceUploadDialog from "./ServiceUploadDialog";

// --- OPTIMIZACIJA ZA HITRO NALAGANJE ---
const OptimizedImage = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  return (
    <div className={`overflow-hidden bg-muted w-full h-full ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy" 
        decoding="async"
        className="w-full h-full object-cover transition-opacity duration-700 ease-in-out"
        onLoad={(e) => {
          (e.currentTarget as HTMLImageElement).style.opacity = "1";
        }}
        style={{ opacity: 0 }}
      />
    </div>
  );
};

const services = [
  {
    title: "Dream Beach Weddings",
    description:
      "Say 'I do' with your toes in the sand and the sunset as your backdrop. We craft intimate ceremonies and grand celebrations in the world's most breathtaking coastal destinations.",
    image: beachWeddingBrideImage,
  },
  {
    title: "Spiritual Retreats",
    description:
      "Reconnect with your inner self through carefully curated wellness journeys. From yoga sanctuaries to meditation havens, find peace in paradise.",
    image: spiritualRetreatImage,
  },
  {
    title: "Exotic Travel",
    description:
      "Discover hidden gems and iconic destinations with our bespoke luxury travel packages. Every journey is tailored to your desires and sense of adventure.",
    image: exoticTravelImage,
  },
  {
    title: "Romantic Escapes",
    description:
      "Whether it's a honeymoon, anniversary, or simply celebrating love, we design intimate getaways that kindle romance and create lasting memories.",
    image: romanticEscapeImage,
  },
];

const ServicesSection = () => {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  return (
    <section id="services" className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-primary tracking-[0.2em] uppercase text-sm font-medium mb-4">
            What We Offer
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground leading-tight">
            Curated Experiences for the{" "}
            <span className="italic font-normal">Soul</span>
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Click "Learn More" on each experience to discover photos from my personal travels over the last 10 years.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service) => (
            <article
              key={service.title}
              className="group relative overflow-hidden bg-card rounded-sm shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                <OptimizedImage
                  src={service.image}
                  alt={service.title}
                  className="transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent pointer-events-none" />
              </div>

              {/* Content */}
              <div className="p-8">
                <h3 className="font-display text-2xl font-semibold text-foreground mb-4">
                  {service.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {service.description}
                </p>
                <Button
                  variant="luxury-outline"
                  size="sm"
                  className="group/btn"
                  onClick={() => setSelectedService(service.title)}
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </div>

              {/* Decorative line */}
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-primary transition-all duration-500 group-hover:w-full" />
            </article>
          ))}
        </div>
      </div>

      {/* Upload Dialog */}
      <ServiceUploadDialog
        open={selectedService !== null}
        onOpenChange={(open) => !open && setSelectedService(null)}
        serviceTitle={selectedService || ""}
      />
    </section>
  );
};

export default ServicesSection;
