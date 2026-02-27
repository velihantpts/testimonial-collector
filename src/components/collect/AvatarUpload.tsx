"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Camera, X, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  brandColor?: string;
}

export function AvatarUpload({ value, onChange, brandColor }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File too large. Maximum size is 5MB.");
        return;
      }

      setError(null);
      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Upload failed");
        }

        const data = await response.json();
        onChange(data.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
        // Fallback: create a local preview via FileReader
        const reader = new FileReader();
        reader.onloadend = () => {
          onChange(reader.result as string);
        };
        reader.readAsDataURL(file);
      } finally {
        setIsUploading(false);
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleRemove = () => {
    onChange(undefined);
    setError(null);
  };

  if (value) {
    return (
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-muted">
            <img
              src={value}
              alt="Avatar preview"
              className="h-full w-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white shadow-sm hover:bg-destructive/90 transition-colors"
            aria-label="Remove avatar"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Photo uploaded</p>
          <button
            type="button"
            onClick={handleRemove}
            className="text-destructive hover:underline"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer items-center gap-4 rounded-lg border-2 border-dashed p-4",
          "transition-colors duration-200",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          isUploading && "pointer-events-none opacity-60"
        )}
        style={
          isDragActive && brandColor
            ? { borderColor: brandColor, backgroundColor: `${brandColor}08` }
            : undefined
        }
      >
        <input {...getInputProps()} />
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
            "bg-muted text-muted-foreground"
          )}
        >
          {isUploading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          ) : isDragActive ? (
            <Upload className="h-5 w-5" />
          ) : (
            <Camera className="h-5 w-5" />
          )}
        </div>
        <div className="text-sm">
          {isUploading ? (
            <p className="text-muted-foreground">Uploading...</p>
          ) : isDragActive ? (
            <p className="font-medium" style={{ color: brandColor }}>
              Drop your photo here
            </p>
          ) : (
            <>
              <p className="font-medium text-foreground">
                Upload a photo{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </p>
              <p className="text-muted-foreground">
                Drag & drop or click. JPEG, PNG, WebP up to 5MB.
              </p>
            </>
          )}
        </div>
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
