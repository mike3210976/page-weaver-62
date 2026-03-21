import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Optimizacija slik posebej za galerijo
const OptimizedImage = ({ src, alt }: { src: string; alt: string }) => {
  const isSupabase = src?.includes('supabase.co');
  // Za galerijo potrebujemo malo večjo ločljivost kot za mozaik (800px)
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
    return <div className="min-h-screen flex items-center justify-center">Loading paradise...</div>;
  }

  if (!destination) {
    return <div className="min-h-screen flex items-center justify-center">Destination not found.</div>;
  }

  const images = destination.destination_images?.sort((a, b) => 
    (a.display_order || 0) - (b.display_order || 0)
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mb-8 hover:bg-accent"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Destinations
          </Button>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <div>
              <div className="flex items-center gap-2 text-primary mb-4">
                <MapPin className="h-5 w-5" />
                <span className="tracking-widest uppercase text-sm font-medium">
                  {destination.name}
                </span>
              </div>
              <h1 className="font-display text-5xl md:text-6xl font-semibold mb-6">
                {destination.name}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {destination.tagline || destination.description}
              </p>
            </div>
            
            {/* Glavna hero slika destinacije */}
            {images.length > 0 && (
              <div className="rounded-sm overflow-hidden shadow-2xl">
                <img 
                  src={`${images[0].image_url}?width=1200&quality=80&format=webp`} 
                  alt={destination.name}
                  className="w-full h-full object-cover aspect-video"
                />
              </div>
            )}
          </div>

          <hr className="border-border mb-16" />

          {/* Galerija vseh slik */}
          <div className="space-y-8">
            <h2 className="font-display text-3xl font-semibold">Image Gallery</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
