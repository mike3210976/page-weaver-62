import { MapPin } from "lucide-react";

const destinations = [
  {
    name: "Maldives",
    description: "Crystal waters & overwater villas",
    packages: 12,
  },
  {
    name: "Bora Bora",
    description: "French Polynesian paradise",
    packages: 8,
  },
  {
    name: "Amalfi Coast",
    description: "Italian coastal elegance",
    packages: 10,
  },
  {
    name: "Santorini",
    description: "Greek island romance",
    packages: 9,
  },
  {
    name: "Bali",
    description: "Spiritual island escape",
    packages: 15,
  },
  {
    name: "Seychelles",
    description: "Pristine island beauty",
    packages: 7,
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination) => (
            <article
              key={destination.name}
              className="group relative bg-background p-8 rounded-sm border border-border hover:border-primary transition-all duration-300 cursor-pointer hover:shadow-xl"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors">
                  <MapPin className="w-5 h-5 text-foreground group-hover:text-primary-foreground transition-colors" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {destination.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    {destination.description}
                  </p>
                  <p className="text-xs text-primary font-medium uppercase tracking-wide">
                    {destination.packages} Packages Available
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
