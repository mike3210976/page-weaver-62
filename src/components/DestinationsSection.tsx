import { MapPin, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const destinations = [
  {
    name: "Maldives",
    slug: "maldives",
    description: "Crystal waters & overwater villas",
    tagline: "Perfect for luxury seekers and honeymooners.",
  },
  {
    name: "Dominican Republic",
    slug: "dominican-republic",
    description: "Caribbean charm & vibrant culture",
    tagline: "Ideal for beach lovers and adventure enthusiasts.",
  },
  {
    name: "Mexico",
    slug: "mexico",
    description: "Sun-kissed beaches & rich heritage",
    tagline: "Great for family vacations and cultural experiences.",
  },
  {
    name: "Egypt – Marsa Alam",
    slug: "egypt-marsa-alam",
    description: "Red Sea paradise & vibrant marine life",
    tagline: "A hidden gem for divers, snorkelers, and desert explorers.",
  },
  {
    name: "Spain",
    slug: "spain",
    description: "Mediterranean vibes & historic cities",
    tagline: "Perfect for foodies and art lovers.",
  },
  {
    name: "Italy",
    slug: "italy",
    description: "Romantic escapes & timeless elegance",
    tagline: "Ideal for history buffs and culinary explorers.",
  },
  {
    name: "Slovenia",
    slug: "slovenia",
    description: "Alpine beauty & serene lakes",
    tagline: "A hidden gem for nature lovers and hikers.",
  },
  {
    name: "Bosnia",
    slug: "bosnia",
    description: "Cultural crossroads & scenic landscapes",
    tagline: "Perfect for history enthusiasts and off-the-beaten-path travelers.",
  },
  {
    name: "Portugal",
    slug: "portugal",
    description: "Atlantic charm & coastal beauty",
    tagline: "Ideal for explorers, wine lovers, and sunset chasers.",
  },
  {
    name: "Madeira",
    slug: "madeira",
    description: "A jewel in the Atlantic",
    tagline: "Perfect for nature lovers and those seeking relaxation.",
  },
];

interface DestinationImage {
  id: string;
  destination_id: string;
  image_url: string;
  display_order: number | null;
}

interface DestinationWithImages {
  id: string;
  slug: string;
  images: DestinationImage[];
}

const DestinationCard = ({ destination }: { destination: typeof destinations[0] }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Fetch images for this destination
  const { data: destinationData } = useQuery({
    queryKey: ["destination-preview", destination.slug],
    queryFn: async () => {
      // First get the destination ID
      const { data: dest } = await supabase
        .from("destinations")
        .select("id")
        .eq("slug", destination.slug)
        .single();

      if (!dest) return null;

      // Then get images for this destination (limit to 4 for mosaic)
      const { data: images } = await supabase
        .from("destination_images")
        .select("*")
        .eq("destination_id", dest.id)
        .order("display_order", { ascending: true })
        .limit(4);

      return { id: dest.id, images: images || [] };
    },
  });

  const images = destinationData?.images || [];
  const hasImages = images.length > 0;

  return (
    <Link
      to={`/destination/${destination.slug}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <article className="relative bg-background p-8 rounded-sm border border-border hover:border-primary transition-all duration-300 cursor-pointer hover:shadow-xl h-full overflow-hidden">
        {/* Image Mosaic Overlay */}
        {hasImages && (
          <div
            className={`absolute inset-0 z-10 transition-all duration-500 ${
              isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5">
              {images.slice(0, 4).map((image, index) => (
                <div
                  key={image.id}
                  className="relative overflow-hidden"
                  style={{
                    transitionDelay: `${index * 50}ms`,
                  }}
                >
                  <img
                    src={image.image_url}
                    alt=""
                    className={`w-full h-full object-cover transition-all duration-500 ${
                      isHovered ? "scale-100" : "scale-110"
                    }`}
                  />
                </div>
              ))}
              {/* Fill empty slots if less than 4 images */}
              {images.length < 4 &&
                Array.from({ length: 4 - images.length }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="bg-accent/50"
                  />
                ))}
            </div>
            {/* Gradient overlay with destination name */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
              <h3 className="font-display text-xl font-semibold text-white">
                {destination.name}
              </h3>
            </div>
          </div>
        )}

        {/* Default Content */}
        <div
          className={`flex flex-col items-center text-center gap-4 transition-opacity duration-300 ${
            isHovered && hasImages ? "opacity-0" : "opacity-100"
          }`}
        >
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
    </Link>
  );
};

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
            Explore our handpicked destinations where dreams come alive – click on a destination to see photos
          </p>
          <div className="flex justify-center mt-6">
            <ChevronDown className="w-8 h-8 text-primary animate-bounce" />
          </div>
        </div>

        {/* Destinations Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {destinations.map((destination) => (
            <DestinationCard key={destination.slug} destination={destination} />
          ))}
        </div>

        {/* Note about interactive map */}
        <p className="text-center text-muted-foreground mt-12 text-sm">
          Click on a destination for more details and image gallery
        </p>
      </div>
    </section>
  );
};

export default DestinationsSection;
