import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, X, ImagePlus, Loader2 } from "lucide-react";
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

const ServiceUploadDialog = ({
  open,
  onOpenChange,
  serviceTitle,
}: ServiceUploadDialogProps) => {
  const [images, setImages] = useState<ServiceImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    for (const file of Array.from(files)) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${serviceTitle.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("service-images")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("service-images")
        .getPublicUrl(fileName);

      // Save to database
      const { error: dbError } = await supabase
        .from("service_images")
        .insert({
          service_type: serviceTitle,
          image_url: urlData.publicUrl,
        });

      if (dbError) {
        console.error("Database error:", dbError);
        toast({
          title: "Error",
          description: "Failed to save image reference",
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

    toast({
      title: "Success",
      description: "Images uploaded successfully",
    });
  };

  const removeImage = async (id: string, imageUrl: string) => {
    // Extract filename from URL
    const fileName = imageUrl.split("/").pop();

    // Delete from storage
    if (fileName) {
      await supabase.storage.from("service-images").remove([fileName]);
    }

    // Delete from database
    const { error } = await supabase
      .from("service_images")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    } else {
      setImages((prev) => prev.filter((img) => img.id !== id));
      toast({
        title: "Deleted",
        description: "Image removed successfully",
      });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
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
              accept="image/*"
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
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(image.id, image.image_url)}
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
  );
};

export default ServiceUploadDialog;
