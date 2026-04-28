import { useRef, useState }      from 'react';
import { Upload } from 'lucide-react';
import { useUploadPickupProof }  from '../hooks';

interface PickupProofUploaderProps {
  batchId: string;
}

// Images only — matches backend validator
const ALLOWED_TYPES  = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_FILES      = 3;

const formatBytes = (bytes: number): string => {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

interface FileItem {
  id:     string;
  file:   File;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

export function PickupProofUploader({ batchId }: PickupProofUploaderProps) {
  const inputRef                    = useRef<HTMLInputElement>(null);
  const [items, setItems]           = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { mutateAsync }             = useUploadPickupProof(batchId);

  const validate = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type))
      return 'Only images (JPEG, PNG, WEBP) are allowed.';
    if (file.size > MAX_SIZE_BYTES)
      return `File exceeds 10 MB limit (${formatBytes(file.size)}).`;
    return null;
  };

  const enqueue = async (files: FileList | File[]) => {
    const arr = Array.from(files).slice(
      0,
      Math.max(0, MAX_FILES - items.filter((i) => i.status === 'done').length),
    );

    for (const file of arr) {
      const error = validate(file);
      const item: FileItem = {
        id:     crypto.randomUUID(),
        file,
        status: error ? 'error' : 'uploading',
        error:  error ?? undefined,
      };
      setItems((prev) => [...prev, item]);

      if (!error) {
        try {
          await mutateAsync(file);
          setItems((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, status: 'done' } : i)),
          );
        } catch {
          setItems((prev) =>
            prev.map((i) =>
              i.id === item.id
                ? { ...i, status: 'error', error: 'Upload failed.' }
                : i,
            ),
          );
        }
      }
    }
  };

  const doneCount = items.filter((i) => i.status === 'done').length;
  const canAdd    = doneCount < MAX_FILES;

  return (
    <div className="space-y-3">
      <div
        onClick={() => canAdd && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          enqueue(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-lg p-8 text-center
                    transition-colors select-none
                    ${canAdd
                      ? 'cursor-pointer hover:border-[var(--ey-dark)]'
                      : 'cursor-not-allowed opacity-50'}
                    ${isDragging
                      ? 'border-[var(--ey-dark)] bg-gray-50'
                      : 'border-border'}`}
      >
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground mb-1">
          <span className="font-medium text-foreground">Click to upload</span>
          {' '}or drag and drop
        </p>
        <p className="text-xs text-gray-400">
          Images only (JPEG, PNG, WEBP) · Max 10 MB · Up to {MAX_FILES} files
        </p>
        {!canAdd && (
          <p className="text-xs text-amber-600 mt-1 font-medium">
            Maximum {MAX_FILES} proofs reached
          </p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ALLOWED_TYPES.join(',')}
        className="hidden"
        onChange={(e) => e.target.files && enqueue(e.target.files)}
      />

    </div>
  );
}