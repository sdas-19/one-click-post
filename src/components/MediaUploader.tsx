import { useRef, useState } from "react";
import { ImagePlus, Film, X, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MediaItem {
  url: string;
  type: "image" | "video";
  name: string;
  file: File;
}

interface MediaUploaderProps {
  media: MediaItem | null;
  onMedia: (m: MediaItem | null) => void;
}

export function MediaUploader({ media, onMedia }: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    const type = file.type.startsWith("video") ? "video" : "image";
    const url = URL.createObjectURL(file);
    onMedia({ url, type, name: file.name, file });
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {!media ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors",
            dragging
              ? "border-gray-400 bg-gray-50 dark:border-gray-500 dark:bg-gray-800"
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800/50",
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            <UploadCloud className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-200">
            Drop a photo or video here
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            or click to browse — one file at a time
          </p>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
          <button
            onClick={() => onMedia(null)}
            className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition-colors hover:bg-black/80"
            aria-label="Remove media"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 absolute left-2 top-2 z-10 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
            {media.type === "video" ? (
              <Film className="h-3.5 w-3.5" />
            ) : (
              <ImagePlus className="h-3.5 w-3.5" />
            )}
            <span className="capitalize">{media.type}</span>
          </div>
          {media.type === "image" ? (
            <img
              src={media.url}
              alt="Preview"
              className="max-h-80 w-full object-contain"
            />
          ) : (
            <video
              src={media.url}
              controls
              className="max-h-80 w-full object-contain"
            />
          )}
        </div>
      )}
    </div>
  );
}
