import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin } from "lucide-react";
// POPRAVLJENI UVOZI:
import Navigation from "@/components/Navigation"; // Odstranjeni zaviti oklepaji
import Footer from "@/components/Footer"; 

const OptimizedImage = ({ src, alt }: { src: string; alt: string }) => {
  const isSupabase = src?.includes('supabase.co');
  const optimizedSrc = isSupabase ? `${src}?width=800&quality=75&format=webp` : src;

  return (
    <div className="aspect-[4/3] overflow-hidden rounded-sm bg-muted">
      <img
        src={optimizedSrc}
        alt={alt}
        loading="lazy"
        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
      />
    </div>
  );
};

const DestinationDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { data: destination, isLoading } = useQuery({
    queryKey: ["destination", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("destinations")
        .select(`
          *,
          destination_images (
            id,
            image_url,
            display_order
          )
        `)
        .eq("slug", slug)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center font-display">Loading paradise...</div>;
  }

  if (!destination) {
    return <div className="min-h-screen flex items-center justify-center font-display">Destination not found.</div>;
  }

  const images = destination.destination_images?.sort((a, b) => 
    (a.display_order || 0) - (b.display_order || 0)
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mb-8 hover:bg-accent group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> 
            Back to Destinations
          </Button>

          <div className="grid lg:grid-cols-2 gap-12 mb-16 items-center">
            <div>
              <div className="flex items-center gap-2 text-primary mb-4">
                <MapPin className="h-5 w-5" />
                <span className="tracking-[0.2em] uppercase text-sm font-medium">
                  {destination.name}
                </span>
              </div>
              <h1 className="font-display text-5xl md:text-7xl font-semibold mb-6 leading-tight">
                {destination.name}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                {destination.tagline || destination.description}
              </p>
            </div>
            
            {images.length > 0 && (
              <div className="rounded-sm overflow-hidden shadow-2xl aspect-video bg-muted">
                <img 
                  src={`${images[0].image_url}?width=1200&quality=85&format=webp`} 
                  alt={destination.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="w-full h-px bg-border mb-16" />

          <div className="space-y-8">
            <h2 className="font-display text-3xl font-semibold">Explore the Gallery</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {images.map((image) => (
                <OptimizedImage 
                  key={image.id} 
                  src={image.image_url} 
                  alt={destination.name} 
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DestinationDetail;
