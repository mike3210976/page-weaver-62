import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ImagePlus, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ServiceUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceTitle: string;
}

interface ServiceImage {
  id: string;
  image_url: string;
}

// Allowed file types and their magic bytes for client-side pre-validation
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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
      .select("id, image_url")
      .eq("service_type", serviceTitle)
      .order("created_at", { ascending: false });

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

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{serviceTitle}</DialogTitle>
            <DialogDescription>
              Upload your pictures for this service. Images will be saved permanently.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Upload Area */}
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

            {/* Images Grid */}
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : images.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">
                  Saved Images ({images.length})
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {images.map((image) => (
                    <div key={image.id} className="relative group aspect-square">
                      <img
                        src={image.image_url}
                        alt="Service gallery"
                        className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setLightboxIndex(images.findIndex(img => img.id === image.id))}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(image.id, image.image_url);
                        }}
                        className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No images uploaded yet
              </p>
            )}

            {/* Action Button */}
            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
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
