import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ImagePlus, Loader2, ChevronLeft, ChevronRight, LogIn, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
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

interface ServiceUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceTitle: string;
}

interface ServiceImage {
  id: string;
  image_url: string;
  display_order: number;
}

// Allowed file types and their magic bytes for client-side pre-validation
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface SortableImageProps {
  image: ServiceImage;
  onRemove?: (id: string, imageUrl: string) => void;
  onView: (index: number) => void;
  index: number;
  canEdit: boolean;
}

const SortableImage = ({ image, onRemove, onView, index, canEdit }: SortableImageProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id, disabled: !canEdit });

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
      {/* Drag handle - only for authenticated users */}
      {canEdit && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 p-1 bg-background/80 rounded cursor-grab opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <GripVertical className="w-4 h-4 text-foreground" />
        </div>
      )}
      
      <img
        src={image.image_url}
        alt="Service gallery"
        className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => onView(index)}
      />
      {/* Delete button - only for authenticated users */}
      {canEdit && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(image.id, image.image_url);
          }}
          className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

const ServiceUploadDialog = ({
  open,
  onOpenChange,
  serviceTitle,
}: ServiceUploadDialogProps) => {
  const [images, setImages] = useState<ServiceImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch images when dialog opens
  useEffect(() => {
    if (open && serviceTitle) {
      fetchImages();
    }
  }, [open, serviceTitle]);

  const fetchImages = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("service_images")
      .select("id, image_url, display_order")
      .eq("service_type", serviceTitle)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching images:", error);
      toast({
        title: "Error",
        description: "Failed to load images",
        variant: "destructive",
      });
    } else {
      setImages(data || []);
    }
    setIsLoading(false);
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `${file.name} exceeds 10MB limit` };
    }

    // Check MIME type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: `${file.name} is not a valid image type` };
    }

    // Check extension
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return { valid: false, error: `${file.name} has an invalid extension` };
    }

    return { valid: true };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    let successCount = 0;

    for (const file of Array.from(files)) {
      // Client-side validation first
      const validation = validateFile(file);
      if (!validation.valid) {
        toast({
          title: "Invalid File",
          description: validation.error,
          variant: "destructive",
        });
        continue;
      }

      // Upload via edge function for server-side validation
      const formData = new FormData();
      formData.append("file", file);
      formData.append("serviceType", serviceTitle);

      try {
        const { data, error } = await supabase.functions.invoke("upload-service-image", {
          body: formData,
        });

        if (error) {
          console.error("Upload error:", error);
          toast({
            title: "Upload Failed",
            description: `Failed to upload ${file.name}`,
            variant: "destructive",
          });
          continue;
        }

        if (data?.error) {
          toast({
            title: "Upload Failed",
            description: data.error,
            variant: "destructive",
          });
          continue;
        }

        successCount++;
      } catch (err) {
        console.error("Upload exception:", err);
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
      }
    }

    // Refresh images
    await fetchImages();
    setIsUploading(false);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (successCount > 0) {
      toast({
        title: "Success",
        description: `${successCount} image${successCount > 1 ? "s" : ""} uploaded successfully`,
      });
    }
  };

  const removeImage = async (id: string, imageUrl: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("delete-service-image", {
        body: { id, imageUrl },
      });

      if (error || data?.error) {
        console.error("Delete error:", error || data?.error);
        toast({
          title: "Error",
          description: "Failed to delete image",
          variant: "destructive",
        });
        return;
      }

      setImages((prev) => prev.filter((img) => img.id !== id));
      toast({
        title: "Deleted",
        description: "Image removed successfully",
      });
    } catch (err) {
      console.error("Delete exception:", err);
      toast({
        title: "Error",
        description: "Failed to delete image",
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = images.findIndex((img) => img.id === active.id);
    const newIndex = images.findIndex((img) => img.id === over.id);

    const newImages = arrayMove(images, oldIndex, newIndex);
    setImages(newImages);

    // Update display_order in database
    const updates = newImages.map((img, index) => ({
      id: img.id,
      display_order: index + 1,
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from("service_images")
        .update({ display_order: update.display_order })
        .eq("id", update.id);

      if (error) {
        console.error("Error updating order:", error);
        toast({
          title: "Error",
          description: "Failed to save image order",
          variant: "destructive",
        });
        // Refresh to get correct order
        fetchImages();
        return;
      }
    }

    toast({
      title: "Order saved",
      description: "Image order updated successfully",
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const canEdit = !authLoading && !!user;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{serviceTitle}</DialogTitle>
            <DialogDescription>
              {canEdit 
                ? "Upload your pictures for this service. Drag images to reorder them."
                : "Browse our gallery for this service."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Upload Area - only for authenticated users */}
            {canEdit && (
              <div
                onClick={triggerFileInput}
                className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all duration-300"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isUploading}
                />
                {isUploading ? (
                  <Loader2 className="w-12 h-12 mx-auto text-primary/50 mb-4 animate-spin" />
                ) : (
                  <ImagePlus className="w-12 h-12 mx-auto text-primary/50 mb-4" />
                )}
                <p className="text-foreground font-medium mb-1">
                  {isUploading ? "Uploading..." : "Click to upload images"}
                </p>
                <p className="text-sm text-muted-foreground">
                  PNG, JPG, WEBP up to 10MB each
                </p>
              </div>
            )}

            {/* Images Grid with Drag and Drop */}
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : images.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">
                  {canEdit 
                    ? `Saved Images (${images.length}) — Drag to reorder`
                    : `Gallery (${images.length} images)`}
                </p>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={images.map(img => img.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-2 gap-5">
                      {images.map((image, index) => (
                        <SortableImage
                          key={image.id}
                          image={image}
                          onRemove={canEdit ? removeImage : undefined}
                          onView={setLightboxIndex}
                          index={index}
                          canEdit={canEdit}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No images uploaded yet
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4">
              {!canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onOpenChange(false);
                    navigate("/auth");
                  }}
                  className="gap-2 text-muted-foreground"
                >
                  <LogIn className="w-4 h-4" />
                  Sign in to upload
                </Button>
              )}
              <div className="ml-auto">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && images[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Previous arrow */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev === 0 ? images.length - 1 : (prev ?? 0) - 1));
              }}
              className="absolute left-4 md:left-8 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </button>
          )}

          {/* Image */}
          <img
            src={images[lightboxIndex].image_url}
            alt="Full size view"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next arrow */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => ((prev ?? 0) + 1) % images.length);
              }}
              className="absolute right-4 md:right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </button>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-white/10 rounded-full text-white text-sm">
              {lightboxIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ServiceUploadDialog;