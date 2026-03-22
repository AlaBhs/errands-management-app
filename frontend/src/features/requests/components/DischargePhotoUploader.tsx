import { useRef, useState }         from "react";
import { Camera, Loader2, X, CheckCircle2 } from "lucide-react";
import { useUploadDischargePhoto }   from "../hooks/useAttachments";

interface DischargePhotoUploaderProps {
  requestId: string;
  onDone:    () => void;
}

const ALLOWED_TYPES  = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export function DischargePhotoUploader({
  requestId,
  onDone,
}: DischargePhotoUploaderProps) {
  const inputRef                    = useRef<HTMLInputElement>(null);
  const [preview, setPreview]       = useState<string | null>(null);
  const [file, setFile]             = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploaded, setUploaded]     = useState(false);

  const { mutate: upload, isPending } = useUploadDischargePhoto(requestId);

  const handleFileChange = (selected: File) => {
    setValidationError(null);

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setValidationError("Only images (JPEG, PNG, GIF, WEBP) are allowed.");
      return;
    }
    if (selected.size > MAX_SIZE_BYTES) {
      setValidationError("Image must not exceed 10 MB.");
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleUpload = () => {
    if (!file) return;
    upload(file, {
      onSuccess: () => setUploaded(true),
    });
  };

  if (uploaded) {
    return (
      <div className="rounded-md bg-emerald-50 border border-emerald-200
                      p-3 flex items-center gap-3">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <p className="text-sm text-emerald-700 flex-1">
          Discharge photo uploaded successfully.
        </p>
        <button
          onClick={onDone}
          className="text-sm font-medium text-emerald-700 underline"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-3 space-y-3">
      <p className="text-xs font-medium text-gray-600">
        Discharge Photo
        <span className="ml-1 font-normal text-gray-400">(optional)</span>
      </p>

      {/* Preview or drop zone */}
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Discharge preview"
            className="w-full max-h-40 object-cover rounded-md border border-border"
          />
          <button
            type="button"
            onClick={() => { setFile(null); setPreview(null); }}
            className="absolute top-1.5 right-1.5 rounded-full bg-white/80
                       p-0.5 text-gray-500 hover:text-red-500 shadow-sm"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full flex flex-col items-center gap-2 rounded-md
                     border-2 border-dashed border-border py-5
                     text-gray-400 hover:border-[#2E2E38]
                     hover:text-[#2E2E38] transition-colors"
        >
          <Camera className="w-6 h-6" />
          <span className="text-xs">Click to select a photo</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFileChange(f);
        }}
      />

      {validationError && (
        <p className="text-xs text-red-500">{validationError}</p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onDone}
          className="flex-1 rounded-md border border-gray-300 px-3 py-1.5
                     text-xs text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Skip
        </button>
        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || isPending}
          className="flex-1 rounded-md bg-[#2E2E38] px-3 py-1.5 text-xs
                     font-medium text-white hover:bg-[#1a1a24] disabled:opacity-50
                     transition-colors flex items-center justify-center gap-1.5"
        >
          {isPending
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...</>
            : "Upload Photo"
          }
        </button>
      </div>
    </div>
  );
}