import { useState }                        from "react";
import { File, ImageIcon, Trash2, Loader2 } from "lucide-react";
import { formatDateTime }                   from "@/shared/utils/date";
import { useDeleteAttachment }              from "../hooks/useAttachments";
import type { AttachmentDto }               from "../types/request.types";
import { AttachmentType } from "../types";

interface AttachmentListProps {
  requestId:   string;
  attachments: AttachmentDto[];
  canDelete:   boolean; // Admin or Collaborator only
}

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ?? "";

export function AttachmentList({
  requestId,
  attachments,
  canDelete,
}: AttachmentListProps) {
  const { mutate: remove, isPending } = useDeleteAttachment(requestId);
  const [deletingId, setDeletingId]   = useState<string | null>(null);

  if (attachments.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic">No attachments.</p>
    );
  }

  const handleDelete = (id: string) => {
    setDeletingId(id);
    remove(id, { onSettled: () => setDeletingId(null) });
  };

  return (
    <ul className="space-y-2">
      {attachments.map((att) => {
        const isImage    = att.contentType.startsWith("image/");
        const isDischarge = att.type === AttachmentType.DischargePhoto;
        const fileUrl    = `${API_BASE}${att.uri}`;
        const isDeleting = deletingId === att.id;

        return (
          <li
            key={att.id}
            className="flex items-center gap-3 rounded-lg border
                       border-border bg-white px-3 py-2.5 text-sm"
          >
            {/* Icon */}
            {isImage
              ? <ImageIcon className="w-4 h-4 shrink-0 text-blue-400" />
              : <File      className="w-4 h-4 shrink-0 text-gray-400" />
            }

            {/* Name + meta */}
            <div className="flex-1 min-w-0">
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate font-medium text-[#2E2E38]
                           hover:underline block"
              >
                {att.fileName}
              </a>
              <p className="text-xs text-gray-400">
                {formatDateTime(att.uploadedAt)}
                {isDischarge && (
                  <span className="ml-2 inline-flex items-center rounded-full
                                   bg-emerald-50 px-1.5 py-0.5 text-[10px]
                                   font-medium text-emerald-700">
                    Discharge
                  </span>
                )}
              </p>
            </div>

            {/* Delete */}
            {canDelete && (
              <button
                type="button"
                disabled={isDeleting || isPending}
                onClick={() => handleDelete(att.id)}
                className="shrink-0 text-gray-400 hover:text-red-500
                           transition-colors disabled:opacity-40"
              >
                {isDeleting
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Trash2  className="w-4 h-4" />
                }
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}