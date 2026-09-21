"use client";

import { useState, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

type MediaUploaderProps = {
  bucket: string;
  accept: string;
  label: string;
  uploadPrefix?: string;
  accessToken?: string | null;
  onUploaded: (path: string, previewUrl: string) => void;
  onRemove?: () => void;
  currentPath?: string | null;
  currentPreview?: string | null;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function MediaUploader({
  bucket,
  accept,
  label,
  uploadPrefix = "uploads",
  accessToken,
  onUploaded,
  onRemove,
  currentPath,
  currentPreview,
}: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentPreview ?? null);
  const [uploading, setUploading] = useState(false);

  const upload = useCallback(
    async (file: File) => {
      setUploading(true);
      setError(null);
      setFileName(file.name);
      setFileSize(formatSize(file.size));

      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
        const supabase = accessToken
          ? createClient(supabaseUrl, supabaseKey, {
              global: { headers: { Authorization: `Bearer ${accessToken}` } },
            })
          : createClient(supabaseUrl, supabaseKey);

        const timestamp = Date.now();
        const cleanName = file.name
          .toLowerCase()
          .replace(/[^a-z0-9.]+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^[.-]+/, "")
          .slice(-60);
        const path = `${uploadPrefix}/${timestamp}-${cleanName}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(path, file, { cacheControl: "3600", upsert: false });

        if (uploadError) throw uploadError;

        // For preview: create a blob URL from the file directly (no signed URL needed for admin preview)
        const blobUrl = URL.createObjectURL(file);

        setPreview(blobUrl);
        setUploading(false);
        onUploaded(path, blobUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
        setUploading(false);
      }
    },
    [bucket, uploadPrefix, accessToken, onUploaded],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setFileName(null);
    setFileSize(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
    onRemove?.();
  };

  return (
    <div className="media-uploader">
      <p className="eyebrow">{label}</p>

      {preview && (
        <div className="media-preview-container">
          {accept.includes("video") ? (
            <video src={preview} controls className="media-preview-video" />
          ) : (
            <img src={preview} alt="Preview" className="media-preview-img" />
          )}
          <button type="button" className="media-remove-btn" onClick={handleRemove}>
            ✕ REMOVE
          </button>
        </div>
      )}

      {!preview && (
        <div className="media-upload-area">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="visually-hidden"
          />
          <button
            type="button"
            className="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "UPLOADING..." : "CHOOSE FILE"}
          </button>
          {fileName && (
            <span className="media-file-info">
              {fileName} {fileSize && "(" + fileSize + ")"}
            </span>
          )}
        </div>
      )}

      {error && <p className="media-error">{error}</p>}
    </div>
  );
}
