import { useState } from "react";
import { File, ImageIcon, X, Download } from "lucide-react";
import { formatDateTime } from "@/shared/utils/date";// adjust import to your actual hook
import type { AttachmentDto } from "@/features/requests/types/request.types";

interface DeliveryAttachmentListProps {
  attachments: AttachmentDto[];
}

const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string)?.replace("/api", "") ?? "";

const getFileUrl = (uri: string) =>
  `${API_BASE}${uri.startsWith("/") ? uri : `/${uri}`}`;

const isImage = (contentType: string) => contentType.startsWith("image/");

export function DeliveryAttachmentList({
  attachments,
}: DeliveryAttachmentListProps) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  if (attachments.length === 0) {
    return <p className="text-sm text-muted-foreground italic">No proof uploaded yet.</p>;
  }


  const handleOpen = (att: AttachmentDto) => {
    const url = getFileUrl(att.uri);
    if (isImage(att.contentType)) {
      setLightboxUrl(url);
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <>
      <ul className="space-y-2">
        {attachments.map((att) => {
          const isImg = isImage(att.contentType);
          const isDischarge = att.type === "DischargePhoto"; // adjust if you have such type

          return (
            <li
              key={att.id}
              onClick={() => handleOpen(att)}
              className="flex items-center gap-3 rounded-lg border border-border bg-card dark:bg-muted/20 px-3 py-2.5 text-sm hover:cursor-pointer"
            >
              {/* Icon */}
              {isImg ? (
                <ImageIcon className="h-4 w-4 shrink-0 text-blue-400" />
              ) : (
                <File className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}

              {/* File info */}
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  
                  className="block w-full truncate text-left font-medium text-foreground hover:underline"
                >
                  {att.fileName}
                </button>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatDateTime(att.uploadedAt)}
                  {isDischarge && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950/30 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                      Discharge
                    </span>
                  )}
                </p>
              </div>

              {/* Download button */}
              <a
                href={getFileUrl(att.uri)}
                download={att.fileName}
                className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                title="Download"
              >
                <Download className="h-4 w-4" />
              </a>
            </li>
          );
        })}
      </ul>

      {/* Lightbox for images */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setLightboxUrl(null)}
        >
          <div
            className="relative max-h-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute -right-2 -top-2 z-10 rounded-full bg-white p-1 shadow-md transition-colors hover:text-gray-900 dark:bg-card dark:text-muted-foreground dark:hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={lightboxUrl}
              alt="Preview"
              className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-xl"
            />
          </div>
        </div>
      )}
    </>
  );
}