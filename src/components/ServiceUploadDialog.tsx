import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, X, ImagePlus } from "lucide-react";

interface ServiceUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceTitle: string;
}

const ServiceUploadDialog = ({
  open,
  onOpenChange,
  serviceTitle,
}: ServiceUploadDialogProps) => {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setUploadedImages((prev) => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
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
            Upload your pictures for this service. Images will be displayed in the gallery below.
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
            />
            <ImagePlus className="w-12 h-12 mx-auto text-primary/50 mb-4" />
            <p className="text-foreground font-medium mb-1">Click to upload images</p>
            <p className="text-sm text-muted-foreground">
              PNG, JPG, WEBP up to 10MB each
            </p>
          </div>

          {/* Uploaded Images Grid */}
          {uploadedImages.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">
                Uploaded Images ({uploadedImages.length})
              </p>
              <div className="grid grid-cols-3 gap-4">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img
                      src={image}
                      alt={`Uploaded ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button variant="luxury" onClick={() => onOpenChange(false)}>
              <Upload className="w-4 h-4 mr-2" />
              Save Gallery
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceUploadDialog;
