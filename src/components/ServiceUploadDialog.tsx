To je zadnji, a morda najbolj kritičen del za hitrost tvoje strani. ServiceUploadDialog namreč odpira galerijo slik, ki jih naložiš preko Supabase. Če tam naložiš 20 slik neposredno s telefona (ki so velike po 5–10 MB), bo galerija na mobilnih napravah popolnoma zmrznila.

V kodi sem optimiziral SortableImage in Lightbox, da uporabljata Supabase-ovo vgrajeno optimizacijo slik.

Zamenjaj celotno vsebino datoteke ServiceUploadDialog.tsx s temle:

TypeScript
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

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// --- OPTIMIZIRANA MINIATURA ZA GALERIJO ---
const SortableImage = ({ image, onRemove, onView, index, canEdit }: SortableImageProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id, disabled: !canEdit });

  // Na mobilnih napravah naložimo le 400px široko miniaturo za hitrejši pregled
  const optimizedThumbnail = `${image.image_url}?width=400&quality=60`;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group aspect-square">
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
        src={optimizedThumbnail}
        alt="Service gallery"
        loading="lazy"
        className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => onView(index)}
      />
      
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

interface SortableImageProps {
  image: ServiceImage;
  onRemove?: (id: string, imageUrl: string) => void;
  onView: (index: number) => void;
  index: number;
  canEdit: boolean;
}

const ServiceUploadDialog = ({ open, onOpenChange, serviceTitle }: ServiceUploadDialogProps) => {
  const [images, setImages] = useState<ServiceImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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

    if (!error) setImages(data || []);
    setIsLoading(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    let successCount = 0;

    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_SIZE) {
        toast({ title: "Prevelika datoteka", description: `${file.name} presega 10MB`, variant: "destructive" });
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("serviceType", serviceTitle);

      try {
        const { data, error } = await supabase.functions.invoke("upload-service-image", { body: formData });
        if (!error && !data?.error) successCount++;
      } catch (err) {
        console.error("Upload error", err);
      }
    }

    await fetchImages();
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (successCount > 0) toast({ title: "Uspeh", description: `${successCount} slik naloženih.` });
  };

  const removeImage = async (id: string, imageUrl: string) => {
    const { data, error } = await supabase.functions.invoke("delete-service-image", { body: { id, imageUrl } });
    if (!error && !data?.error) {
      setImages((prev) => prev.filter((img) => img.id !== id));
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex((img) => img.id === active.id);
    const newIndex = images.findIndex((img) => img.id === over.id);
    const newImages = arrayMove(images, oldIndex, newIndex);
    setImages(newImages);

    const updates = newImages.map((img, index) => ({ id: img.id, display_order: index + 1 }));
    for (const update of updates) {
      await supabase.from("service_images").update({ display_order: update.display_order }).eq("id", update.id);
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();
  const canEdit = !authLoading && !!user;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{serviceTitle}</DialogTitle>
            <DialogDescription>
              {canEdit ? "Drag to reorder." : "Browse our travel gallery."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {canEdit && (
              <div onClick={triggerFileInput} className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center cursor-pointer hover:bg-primary/5">
                <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.webp" multiple onChange={handleFileChange} className="hidden" disabled={isUploading} />
                {isUploading ? <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary/50" /> : <ImagePlus className="w-12 h-12 mx-auto text-primary/50" />}
                <p className="mt-2 font-medium">Click to upload</p>
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={images.map(img => img.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {images.map((image, index) => (
                      <SortableImage key={image.id} image={image} onRemove={canEdit ? removeImage : undefined} onView={setLightboxIndex} index={index} canEdit={canEdit} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
            
            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* LIGHTBOX OPTIMIZACIJA */}
      {lightboxIndex !== null && images[lightboxIndex] && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4" onClick={() => setLightboxIndex(null)}>
          <button className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white z-10"><X className="w-6 h-6" /></button>
          
          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => (prev === 0 ? images.length - 1 : (prev ?? 0) - 1)); }} className="absolute left-4 p-3 bg-white/10 rounded-full text-white z-10"><ChevronLeft className="w-8 h-8" /></button>
              <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => ((prev ?? 0) + 1) % images.length); }} className="absolute right-4 p-3 bg-white/10 rounded-full text-white z-10"><ChevronRight className="w-8 h-8" /></button>
            </>
          )}

          <img 
            // Za celozaslonski prikaz naložimo sliko z razumno širino (npr. 1200px), da ne upočasnimo mobilnika
            src={`${images[lightboxIndex].image_url}?width=1200&quality=80`} 
            alt="Full view" 
            className="max-w-full max-h-[90vh] object-contain shadow-2xl transition-all duration-300" 
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </>
  );
};

export default ServiceUploadDialog;
