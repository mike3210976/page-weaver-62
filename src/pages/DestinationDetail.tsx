import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Upload, Trash2, Edit, Save, X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface DestinationImage {
  id: string;
  image_url: string;
  display_order: number;
}

interface SortableImageProps {
  image: DestinationImage;
  destinationName: string;
  canEdit: boolean;
  onDelete: (id: string) => void;
  onClick: () => void;
}

const SortableImage = ({ image, destinationName, canEdit, onDelete, onClick }: SortableImageProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group aspect-square"
    >
      <img
        src={image.image_url}
        alt={destinationName}
        className="w-full h-full object-cover rounded-sm cursor-pointer hover:opacity-90 transition-opacity"
        onClick={onClick}
      />
      {canEdit && (
        <>
          <button
            {...attributes}
            {...listeners}
            className="absolute top-2 left-2 p-2 bg-background/80 text-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(image.id);
            }}
            className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
};
import Footer from "@/components/Footer";

const DestinationDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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

  // Upload image mutation (via backend function for validation)
  const uploadImage = useMutation({
    mutationFn: async (file: File) => {
      if (!destination?.id) throw new Error("Destination not loaded");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("destinationId", destination.id);

      const { data, error } = await supabase.functions.invoke("upload-destination-image", {
        body: formData,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destination-images", destination?.id] });
      toast({ title: "Image uploaded successfully" });
    },
    onError: (error: any) => {
      console.error("Upload error:", error);
      const message =
        typeof error?.message === "string"
          ? error.message
          : "Upload failed. Please try again.";
      toast({ title: message, variant: "destructive" });
    },
  });

  // Delete image mutation (also removes file from storage)
  const deleteImage = useMutation({
    mutationFn: async (imageId: string) => {
      const { data, error } = await supabase.functions.invoke("delete-destination-image", {
        body: { id: imageId },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destination-images", destination?.id] });
      toast({ title: "Image deleted successfully" });
    },
    onError: (error: any) => {
      const message = typeof error?.message === "string" ? error.message : "Error deleting image";
      toast({ title: message, variant: "destructive" });
    },
  });

  // Reorder images mutation
  const reorderImages = useMutation({
    mutationFn: async (reorderedImages: DestinationImage[]) => {
      const updates = reorderedImages.map((img, index) => ({
        id: img.id,
        display_order: index,
        destination_id: destination?.id,
        image_url: img.image_url,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from("destination_images")
          .update({ display_order: update.display_order })
          .eq("id", update.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destination-images", destination?.id] });
      toast({ title: "Image order updated" });
    },
    onError: () => {
      toast({ title: "Error updating image order", variant: "destructive" });
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over.id);
      const newOrder = arrayMove(images, oldIndex, newIndex);
      reorderImages.mutate(newOrder);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Upload sequentially to avoid concurrent ordering/race issues
    for (const file of Array.from(files)) {
      await uploadImage.mutateAsync(file);
    }

    // Allow re-selecting the same files later
    e.target.value = "";
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
            <p className="text-xl text-cyan-500 font-medium italic">
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
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {images.map((image) => (
                      <SortableImage
                        key={image.id}
                        image={image}
                        destinationName={destination.name}
                        canEdit={!!user}
                        onDelete={(id) => deleteImage.mutate(id)}
                        onClick={() => {
                          setLightboxIndex(images.findIndex((img) => img.id === image.id));
                          setLightboxOpen(true);
                        }}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
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

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
          <div className="relative flex items-center justify-center min-h-[80vh]">
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setLightboxIndex((prev) => (prev - 1 + images.length) % images.length)}
                  className="absolute left-4 p-2 bg-background/20 hover:bg-background/40 text-white rounded-full transition-colors z-10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setLightboxIndex((prev) => (prev + 1) % images.length)}
                  className="absolute right-4 p-2 bg-background/20 hover:bg-background/40 text-white rounded-full transition-colors z-10"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
            {images[lightboxIndex] && (
              <img
                src={images[lightboxIndex].image_url}
                alt={destination.name}
                className="max-w-full max-h-[85vh] object-contain"
              />
            )}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
                {lightboxIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default DestinationDetail;
