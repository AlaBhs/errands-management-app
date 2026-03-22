import { useState } from "react";
import { File, ImageIcon, Trash2, Loader2, X, Download } from "lucide-react";
import { formatDateTime } from "@/shared/utils/date";
import { useDeleteAttachment } from "../hooks/useAttachments";
import type { AttachmentDto } from "../types/request.types";
import { AttachmentType } from "../types";

interface AttachmentListProps {
  requestId: string;
  attachments: AttachmentDto[];
  canDelete: boolean;
}

const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string)?.replace("/api", "") ?? "";

const getFileUrl = (uri: string) =>
  `${API_BASE}${uri.startsWith("/") ? uri : `/${uri}`}`;
console.log("API_BASE:", API_BASE);
const isImage = (contentType: string) => contentType.startsWith("image/");

export function AttachmentList({
  requestId,
  attachments,
  canDelete,
}: AttachmentListProps) {
  const { mutate: remove, isPending } = useDeleteAttachment(requestId);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  if (attachments.length === 0)
    return <p className="text-sm text-gray-400 italic">No attachments.</p>;

  const handleDelete = (id: string) => {
    setDeletingId(id);
    remove(id, { onSettled: () => setDeletingId(null) });
  };

  const handleOpen = (att: AttachmentDto) => {
    const url = getFileUrl(att.uri);
    console.log("Opening file at:", url);
    if (isImage(att.contentType)) {
      // Open image in lightbox
      setLightboxUrl(url);
    } else {
      // Open PDF in new tab — bypasses router entirely
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <>
      <ul className="space-y-2">
        {attachments.map((att) => {
          const isImg = isImage(att.contentType);
          const isDischarge = att.type === AttachmentType.DischargePhoto;
          const isDeleting = deletingId === att.id;

          return (
            <li
              key={att.id}
              className="flex items-center gap-3 rounded-lg border
                         border-border bg-white px-3 py-2.5 text-sm"
            >
              {/* Icon */}
              {isImg ? (
                <ImageIcon className="w-4 h-4 shrink-0 text-blue-400" />
              ) : (
                <File className="w-4 h-4 shrink-0 text-gray-400" />
              )}

              {/* Name + meta */}
              <div className="flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => handleOpen(att)}
                  className="truncate font-medium text-[#2E2E38]
                             hover:underline block text-left w-full"
                >
                  {att.fileName}
                </button>
                <p className="text-xs text-gray-400">
                  {formatDateTime(att.uploadedAt)}
                  {isDischarge && (
                    <span
                      className="ml-2 inline-flex items-center
                                     rounded-full bg-emerald-50 px-1.5
                                     py-0.5 text-[10px] font-medium
                                     text-emerald-700"
                    >
                      Discharge
                    </span>
                  )}
                </p>
              </div>

              {/* Download */}
              <a
                href={getFileUrl(att.uri)}
                download={att.fileName}
                className="shrink-0 text-gray-400 hover:text-[#2E2E38]
             transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </a>

              {/* Delete */}
              {canDelete && (
                <button
                  type="button"
                  disabled={isDeleting || isPending}
                  onClick={() => handleDelete(att.id)}
                  className="shrink-0 text-gray-400 hover:text-red-500
                             transition-colors disabled:opacity-40"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {/* Image lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center
                     bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <div
            className="relative max-w-4xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute -top-3 -right-3 z-10 rounded-full
                         bg-white p-1 shadow-md text-gray-600
                         hover:text-gray-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={lightboxUrl}
              alt="Attachment preview"
              className="max-w-full max-h-[85vh] rounded-lg object-contain
                         shadow-xl"
            />
          </div>
        </div>
      )}
    </>
  );
}
