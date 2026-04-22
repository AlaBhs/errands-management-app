import { useRef }              from "react";
import { Camera, X }           from "lucide-react";

interface DischargePhotoSelectorProps {
  file:     File | null;
  onChange: (file: File | null) => void;
}

const ALLOWED_TYPES  = ["image/jpeg","image/png","image/gif","image/webp"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export function DischargePhotoSelector({
  file,
  onChange,
}: DischargePhotoSelectorProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (selected: File) => {
    if (!ALLOWED_TYPES.includes(selected.type)) return;
    if (selected.size > MAX_SIZE_BYTES)          return;
    onChange(selected);
  };

  return (
    <div>
      <p className="text-xs text-gray-500 mb-1.5">
        Discharge photo
        <span className="ml-1 text-gray-400">(optional)</span>
      </p>

      {file ? (
        // Preview
        <div className="relative rounded-md overflow-hidden border border-border">
          <img
            src={URL.createObjectURL(file)}
            alt="Discharge preview"
            className="w-full max-h-36 object-cover"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-1.5 right-1.5 rounded-full bg-white/80
                       p-0.5 shadow text-gray-600 hover:text-red-500"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <p className="text-[10px] text-gray-500 px-2 py-1 truncate">
            {file.name}
          </p>
        </div>
      ) : (
        // Select button
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full flex items-center gap-2 rounded-md border
                     border-dashed border-gray-300 px-3 py-2 text-xs
                     text-gray-500 hover:border-[var(--ey-dark)] hover:text-[var(--ey-dark)]
                     transition-colors"
        >
          <Camera className="w-4 h-4" />
          Add discharge photo
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleSelect(f);
        }}
      />
    </div>
  );
}