import { MapPin } from "lucide-react";

const destinations = [
  {
    name: "Maldives",
    description: "Crystal waters & overwater villas",
    tagline: "Perfect for luxury seekers and honeymooners.",
  },
  {
    name: "Dominican Republic",
    description: "Caribbean charm & vibrant culture",
    tagline: "Ideal for beach lovers and adventure enthusiasts.",
  },
  {
    name: "Mexico",
    description: "Sun-kissed beaches & rich heritage",
    tagline: "Great for family vacations and cultural experiences.",
  },
  {
    name: "Egypt – Marsa Alam",
    description: "Red Sea paradise & vibrant marine life",
    tagline: "A hidden gem for divers, snorkelers, and desert explorers.",
  },
  {
    name: "Spain",
    description: "Mediterranean vibes & historic cities",
    tagline: "Perfect for foodies and art lovers.",
  },
  {
    name: "Italy",
    description: "Romantic escapes & timeless elegance",
    tagline: "Ideal for history buffs and culinary explorers.",
  },
  {
    name: "Slovenia",
    description: "Alpine beauty & serene lakes",
    tagline: "A hidden gem for nature lovers and hikers.",
  },
  {
    name: "Bosnia",
    description: "Cultural crossroads & scenic landscapes",
    tagline: "Perfect for history enthusiasts and off-the-beaten-path travelers.",
  },
];

const DestinationsSection = () => {
  return (
    <section id="destinations" className="py-24 px-6 bg-card">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-primary tracking-[0.2em] uppercase text-sm font-medium mb-4">
            Destinations
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground leading-tight mb-6">
            Paradise Awaits in Every{" "}
            <span className="italic font-normal">Corner</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Explore our handpicked destinations where dreams come alive
          </p>
        </div>

        {/* Destinations Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {destinations.map((destination) => (
            <article
              key={destination.name}
              className="group relative bg-background p-8 rounded-sm border border-border hover:border-primary transition-all duration-300 cursor-pointer hover:shadow-xl"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors">
                  <MapPin className="w-5 h-5 text-foreground group-hover:text-primary-foreground transition-colors" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {destination.name}
                  </h3>
                  <p className="text-primary text-sm font-medium mb-2">
                    {destination.description}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {destination.tagline}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Note about interactive map */}
        <p className="text-center text-muted-foreground mt-12 text-sm">
          Contact us to explore our complete collection of destinations
        </p>
      </div>
    </section>
  );
};

export default DestinationsSection;
