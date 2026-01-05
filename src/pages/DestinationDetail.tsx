import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Upload, Trash2, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const DestinationDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");

  // Fetch destination details
  const { data: destination, isLoading } = useQuery({
    queryKey: ["destination", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Fetch destination images
  const { data: images = [] } = useQuery({
    queryKey: ["destination-images", destination?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("destination_images")
        .select("*")
        .eq("destination_id", destination?.id)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!destination?.id,
  });

  // Update description mutation
  const updateDescription = useMutation({
    mutationFn: async (fullDescription: string) => {
      const { error } = await supabase
        .from("destinations")
        .update({ full_description: fullDescription })
        .eq("id", destination?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destination", slug] });
      setIsEditing(false);
      toast({ title: "Description updated successfully" });
    },
    onError: () => {
      toast({ title: "Error updating description", variant: "destructive" });
    },
  });

  // Upload image mutation
  const uploadImage = useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split(".").pop();
      const fileName = `${destination?.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("destination-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from("destination-images")
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from("destination_images")
        .insert({
          destination_id: destination?.id,
          image_url: publicUrl.publicUrl,
          display_order: images.length,
        });

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destination-images", destination?.id] });
      toast({ title: "Image uploaded successfully" });
    },
    onError: () => {
      toast({ title: "Error uploading image", variant: "destructive" });
    },
  });

  // Delete image mutation
  const deleteImage = useMutation({
    mutationFn: async (imageId: string) => {
      const { error } = await supabase
        .from("destination_images")
        .delete()
        .eq("id", imageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destination-images", destination?.id] });
      toast({ title: "Image deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error deleting image", variant: "destructive" });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => uploadImage.mutate(file));
    }
  };

  const handleStartEditing = () => {
    setEditedDescription(destination?.full_description || "");
    setIsEditing(true);
  };

  const handleSaveDescription = () => {
    updateDescription.mutate(editedDescription);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Destination not found</p>
        <Link to="/#destinations">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to destinations
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Back button */}
          <Link to="/#destinations" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to destinations
          </Link>

          {/* Header */}
          <div className="mb-12">
            <p className="text-primary tracking-[0.2em] uppercase text-sm font-medium mb-4">
              Destination
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground leading-tight mb-4">
              {destination.name}
            </h1>
            <p className="text-xl text-primary font-medium mb-2">
              {destination.short_description}
            </p>
            <p className="text-muted-foreground">
              {destination.tagline}
            </p>
          </div>

          {/* Image Gallery */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                Image Gallery
              </h2>
              {user && (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadImage.isPending}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadImage.isPending ? "Uploading..." : "Upload Images"}
                  </Button>
                </>
              )}
            </div>

            {images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div key={image.id} className="relative group aspect-square">
                    <img
                      src={image.image_url}
                      alt={destination.name}
                      className="w-full h-full object-cover rounded-sm"
                    />
                    {user && (
                      <button
                        onClick={() => deleteImage.mutate(image.id)}
                        className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-sm p-12 text-center flex flex-col items-center gap-4">
                <p className="text-muted-foreground">
                  No images available for this destination yet.
                </p>
                {user && (
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadImage.isPending}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadImage.isPending ? "Uploading..." : "Upload Images"}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                About This Destination
              </h2>
              {user && !isEditing && (
                <Button variant="outline" onClick={handleStartEditing}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Description
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <Textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Enter a detailed description of the destination..."
                  className="min-h-[200px]"
                />
                <div className="flex gap-2">
                  <Button onClick={handleSaveDescription} disabled={updateDescription.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    {updateDescription.isPending ? "Saving..." : "Save"}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="prose prose-lg max-w-none">
                {destination.full_description ? (
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {destination.full_description}
                  </p>
                ) : (
                  <p className="text-muted-foreground italic">
                    {user
                      ? "No description added yet. Click the button above to edit."
                      : "Description for this destination coming soon."}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default DestinationDetail;
