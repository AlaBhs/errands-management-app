import { useRef, useState }         from "react";
import { Upload, X, File, Loader2 } from "lucide-react";
import { useUploadAttachment }       from "../../hooks";

interface AttachmentUploaderProps {
  requestId: string;
}

const ALLOWED_TYPES  = ["image/jpeg", "image/png", "image/gif",
                         "image/webp", "application/pdf"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_FILES      = 5;

const formatBytes = (bytes: number): string => {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

interface FileItem {
  id:     string;
  file:   File;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

export function AttachmentUploader({ requestId }: AttachmentUploaderProps) {
  const inputRef                  = useRef<HTMLInputElement>(null);
  const [items, setItems]         = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { mutateAsync }           = useUploadAttachment(requestId);

  const validate = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type))
      return "Only images (JPEG, PNG, GIF, WEBP) and PDF files are allowed.";
    if (file.size > MAX_SIZE_BYTES)
      return `File exceeds 10 MB limit (${formatBytes(file.size)}).`;
    return null;
  };

  const enqueue = async (files: FileList | File[]) => {
    const arr        = Array.from(files);
    const totalAfter = items.filter(
      (i) => i.status === "done" || i.status === "uploading",
    ).length + arr.length;

    if (totalAfter > MAX_FILES) {
      arr.splice(MAX_FILES - items.length);
    }

    for (const file of arr) {
      const error = validate(file);
      const item: FileItem = {
        id:     crypto.randomUUID(),
        file,
        status: error ? "error" : "uploading",
        error:  error ?? undefined,
      };

      setItems((prev) => [...prev, item]);

      if (!error) {
        try {
          await mutateAsync(file);
          setItems((prev) =>
            prev.map((i) =>
              i.id === item.id ? { ...i, status: "done" } : i,
            ),
          );
        } catch {
          setItems((prev) =>
            prev.map((i) =>
              i.id === item.id
                ? { ...i, status: "error", error: "Upload failed." }
                : i,
            ),
          );
        }
      }
    }
  };

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    enqueue(e.dataTransfer.files);
  };

  const doneCount = items.filter((i) => i.status === "done").length;
  const canAdd    = doneCount < MAX_FILES;

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onClick={() => canAdd && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center
                    transition-colors select-none
                    ${canAdd
                      ? "cursor-pointer hover:border-[var(--ey-dark)]"
                      : "cursor-not-allowed opacity-50"}
                    ${isDragging
                      ? "border-[var(--ey-dark)] bg-gray-50"
                      : "border-border"}`}
      >
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 mb-1">
          <span className="font-medium text-[var(--ey-dark)]">Click to upload</span>
          {" "}or drag and drop
        </p>
        <p className="text-xs text-gray-400">
          Images or PDF · Max 10 MB per file · Up to {MAX_FILES} files
        </p>
        {!canAdd && (
          <p className="text-xs text-amber-600 mt-1 font-medium">
            Maximum {MAX_FILES} attachments reached
          </p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ALLOWED_TYPES.join(",")}
        className="hidden"
        onChange={(e) => e.target.files && enqueue(e.target.files)}
      />

      {/* File list */}
      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-lg border
                         border-border bg-white px-3 py-2 text-sm"
            >
              {/* Icon */}
              <File className="w-4 h-4 shrink-0 text-gray-400" />

              {/* Name + size */}
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-gray-700">
                  {item.file.name}
                </p>
                <p className="text-xs text-gray-400">
                  {formatBytes(item.file.size)}
                </p>
              </div>

              {/* Status */}
              {item.status === "uploading" && (
                <Loader2 className="w-4 h-4 animate-spin text-[var(--ey-dark)]" />
              )}
              {item.status === "done" && (
                <span className="text-xs font-medium text-emerald-600">
                  Uploaded
                </span>
              )}
              {item.status === "error" && (
                <span className="text-xs font-medium text-red-500">
                  {item.error}
                </span>
              )}

              {/* Remove */}
              {item.status !== "uploading" && (
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="shrink-0 text-gray-400 hover:text-red-500
                             transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}