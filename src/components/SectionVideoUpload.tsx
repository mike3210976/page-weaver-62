import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Video, X, Loader2, LogIn, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface SectionVideo {
  id: string;
  video_url: string;
  display_order: number;
}

interface SectionVideoUploadProps {
  sectionKey: string;
}

const ALLOWED_EXTENSIONS = ["mp4", "webm", "mov"];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const SectionVideoUpload = ({ sectionKey }: SectionVideoUploadProps) => {
  const [videos, setVideos] = useState<SectionVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const canEdit = !authLoading && !!user;

  useEffect(() => {
    fetchVideos();
  }, [sectionKey]);

  const fetchVideos = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("section_videos")
      .select("id, video_url, display_order")
      .eq("section_key", sectionKey)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching videos:", error);
    } else {
      setVideos(data || []);
    }
    setIsLoading(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    let successCount = 0;

    for (const file of Array.from(files)) {
      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 100MB limit`,
          variant: "destructive",
        });
        continue;
      }

      // Validate extension
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported video format (MP4, WEBM, MOV)`,
          variant: "destructive",
        });
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("sectionKey", sectionKey);

      try {
        const { data, error } = await supabase.functions.invoke("upload-video", {
          body: formData,
        });

        if (error || data?.error) {
          console.error("Upload error:", error || data?.error);
          toast({
            title: "Upload Failed",
            description: `Failed to upload ${file.name}`,
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

    await fetchVideos();
    setIsUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (successCount > 0) {
      toast({
        title: "Success",
        description: `${successCount} video${successCount > 1 ? "s" : ""} uploaded successfully`,
      });
    }
  };

  const removeVideo = async (id: string, videoUrl: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("delete-video", {
        body: { id, videoUrl },
      });

      if (error || data?.error) {
        toast({
          title: "Error",
          description: "Failed to delete video",
          variant: "destructive",
        });
        return;
      }

      setVideos((prev) => prev.filter((v) => v.id !== id));
      toast({
        title: "Deleted",
        description: "Video removed successfully",
      });
    } catch (err) {
      console.error("Delete exception:", err);
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      {/* Display existing videos */}
      {videos.length > 0 && (
        <div className="space-y-4">
          {videos.map((video) => (
            <div key={video.id} className="relative group rounded-lg overflow-hidden shadow-lg">
              <video
                src={video.video_url}
                controls
                className="w-full rounded-lg"
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
              {canEdit && (
                <button
                  onClick={() => removeVideo(video.id, video.video_url)}
                  className="absolute top-3 right-3 p-2 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  aria-label="Delete video"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload area - only for authenticated users */}
      {canEdit ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-primary/30 rounded-lg p-6 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all duration-300"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp4,.webm,.mov"
            multiple
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
          {isUploading ? (
            <Loader2 className="w-10 h-10 mx-auto text-primary/50 mb-3 animate-spin" />
          ) : (
            <Video className="w-10 h-10 mx-auto text-primary/50 mb-3" />
          )}
          <p className="text-foreground font-medium mb-1">
            {isUploading ? "Uploading..." : "Click to upload video"}
          </p>
          <p className="text-sm text-muted-foreground">
            MP4, WEBM, MOV up to 100MB
          </p>
        </div>
      ) : (
        videos.length === 0 && (
          <div className="text-center py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/auth")}
              className="gap-2 text-muted-foreground"
            >
              <LogIn className="w-4 h-4" />
              Sign in to upload videos
            </Button>
          </div>
        )
      )}
    </div>
  );
};

export default SectionVideoUpload;
