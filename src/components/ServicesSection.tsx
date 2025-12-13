import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroWedding from "@/assets/hero-wedding.jpg";
import retreatImage from "@/assets/retreat.jpg";
import maldivesImage from "@/assets/maldives.jpg";
import romanticImage from "@/assets/romantic-escape.jpg";

const services = [
  {
    title: "Dream Beach Weddings",
    description:
      "Say 'I do' with your toes in the sand and the sunset as your backdrop. We craft intimate ceremonies and grand celebrations in the world's most breathtaking coastal destinations.",
    image: heroWedding,
  },
  {
    title: "Spiritual Retreats",
    description:
      "Reconnect with your inner self through carefully curated wellness journeys. From yoga sanctuaries to meditation havens, find peace in paradise.",
    image: retreatImage,
  },
  {
    title: "Exotic Travel",
    description:
      "Discover hidden gems and iconic destinations with our bespoke luxury travel packages. Every journey is tailored to your desires and sense of adventure.",
    image: maldivesImage,
  },
  {
    title: "Romantic Escapes",
    description:
      "Whether it's a honeymoon, anniversary, or simply celebrating love, we design intimate getaways that kindle romance and create lasting memories.",
    image: romanticImage,
  },
];

const ServicesSection = () => {
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
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <article
              key={service.title}
              className="group relative overflow-hidden bg-card rounded-sm shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
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
    </section>
  );
};

export default ServicesSection;
