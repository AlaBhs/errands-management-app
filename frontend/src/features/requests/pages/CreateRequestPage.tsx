import { useNavigate } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileIcon, Upload, X } from "lucide-react";
import { useCreateRequest } from "@/features/requests";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { isApiError } from "@/shared/api/client";
import { RequestCategory } from "@/features/requests/types/request.enums";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { attachmentsApi } from "../api/attachments.api";

const priorityLevels = ["Low", "Normal", "High", "Urgent"] as const;
const ALLOWED_TYPES  = ["image/jpeg", "image/png", "image/gif",
                        "image/webp", "application/pdf"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_FILES      = 5;

const formatBytes = (bytes: number): string => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const schema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().min(1, "Description is required").max(500),
  priority: z.number().min(0).max(3),
  category: z.enum(
    [
      RequestCategory.OfficeSupplies,
      RequestCategory.ITEquipment,
      RequestCategory.Travel,
      RequestCategory.Facilities,
      RequestCategory.Other,
    ],
    { message: "Category is required" },
  ),
  contactPerson: z.string().max(100).optional(),
  contactPhone: z.string().max(20).optional(),
  comment: z.string().max(500).optional(),
  deadline: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const selected = new Date(val);
      const minDate = new Date();
      minDate.setHours(minDate.getHours() + 24);
      return selected >= minDate;
    }, "Deadline must be at least 24 hours from now."),
  estimatedCost: z
    .string()
    .optional()
    .refine(
      (val) => val === "" || val === undefined || !isNaN(parseFloat(val)),
      "Estimated cost must be a valid number",
    ),
  deliveryAddress: z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
    note: z.string().optional(),
  }),
});

type FormValues = z.infer<typeof schema>;

export function CreateRequestPage() {
  const navigate = useNavigate();
  const { mutate, isPending, isError, error } = useCreateRequest();
const inputRef                        = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors]     = useState<Record<string, string>>({});
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  const { register, handleSubmit, control, formState: { errors } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: { priority: 1 },
    });

    const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type))
      return "Only images (JPEG, PNG, GIF, WEBP) and PDF files are allowed.";
    if (file.size > MAX_SIZE_BYTES)
      return `Exceeds 10 MB limit (${formatBytes(file.size)}).`;
    return null;
  };

  const addFiles = (incoming: FileList | File[]) => {
    const arr      = Array.from(incoming);
    const newFiles = arr.slice(0, MAX_FILES - selectedFiles.length);
    const newErrors: Record<string, string> = {};

    const valid = newFiles.filter((f) => {
      const err = validateFile(f);
      if (err) newErrors[f.name] = err;
      return !err;
    });

    setSelectedFiles((prev) => [...prev, ...valid]);
    if (Object.keys(newErrors).length > 0)
      setFileErrors((prev) => ({ ...prev, ...newErrors }));
  };

  const removeFile = (name: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.name !== name));
    setFileErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const onSubmit = (values: FormValues) => {
    mutate(
      {
        title:         values.title,
        description:   values.description,
        priority:      values.priority,
        category:      values.category,
        contactPerson: values.contactPerson || undefined,
        contactPhone:  values.contactPhone  || undefined,
        comment:       values.comment       || undefined,
        deadline:      values.deadline      || undefined,
        estimatedCost: values.estimatedCost
          ? parseFloat(values.estimatedCost)
          : undefined,
        deliveryAddress: values.deliveryAddress,
      },
      {
        onSuccess: async (response) => {
          const requestId = response.data;
          if (!requestId) { navigate("/requests/mine"); return; }

          // Upload any pre-selected files silently after creation
          if (selectedFiles.length > 0) {
            setIsUploadingFiles(true);
            try {
              for (const file of selectedFiles) {
                await attachmentsApi.upload(requestId, file);
              }
              toast.success(
                `Request submitted with ${selectedFiles.length} attachment${selectedFiles.length > 1 ? "s" : ""}.`
              );
            } catch {
              toast.warning(
                "Request created but some attachments failed to upload. " +
                "You can add them from the request details page."
              );
            } finally {
              setIsUploadingFiles(false);
            }
          } else {
            toast.success("Request submitted successfully.");
          }

          navigate("/requests/mine");
        },
      },
    );
  };

  const isSubmitting = isPending || isUploadingFiles;
  const canAddMore   = selectedFiles.length < MAX_FILES;

  return (
    <div className="">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl text-[#2E2E38] mb-1">Create New Request</h1>
        <p className="text-gray-600">
          Submit a new errand request for processing
        </p>
      </div>

      {isError && (
        <ErrorMessage
          message={isApiError(error) ? error.message : "Something went wrong."}
        />
      )}

      {/* Form Card */}
      <div className="bg-white rounded-lg border border-border p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-[#2E2E38] mb-2"
            >
              Request Title *
            </label>
            <input
              id="title"
              type="text"
              {...register("title")}
              placeholder="Enter a descriptive title"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E2E38]"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-[#2E2E38] mb-2"
            >
              Description *
            </label>
            <textarea
              id="description"
              {...register("description")}
              placeholder="Provide detailed information about your request"
              rows={5}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E2E38] resize-none"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>
          {/* Comment */}
          <div>
            <label
              htmlFor="comment"
              className="block text-sm font-medium text-[#2E2E38] mb-2"
            >
              Additional Comments
              <span className="ml-1 text-xs text-gray-400">(optional)</span>
            </label>
            <textarea
              id="comment"
              {...register("comment")}
              rows={3}
              placeholder="Any additional instructions for the courier — access codes, schedule constraints, special handling..."
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E2E38] resize-none"
            />
            {errors.comment && (
              <p className="mt-1 text-xs text-red-500">
                {errors.comment.message}
              </p>
            )}
          </div>
          {/* Category + Deadline row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-[#2E2E38] mb-2">
                Category *
              </label>
              <select
                {...register("category")}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E2E38]"
              >
                <option value="">Select a category...</option>
                <option value={RequestCategory.OfficeSupplies}>
                  Office Supplies
                </option>
                <option value={RequestCategory.ITEquipment}>
                  IT Equipment
                </option>
                <option value={RequestCategory.Travel}>Travel</option>
                <option value={RequestCategory.Facilities}>Facilities</option>
                <option value={RequestCategory.Other}>Other</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Deadline */}
            <div>
              <label
                htmlFor="deadline"
                className="block text-sm font-medium text-[#2E2E38] mb-2"
              >
                Due Date
              </label>
              <input
                id="deadline"
                type="date"
                min={(() => {
                  const d = new Date();
                  d.setHours(d.getHours() + 24);
                  return d.toISOString().split("T")[0];
                })()}
                {...register("deadline")}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E2E38]"
              />
              {errors.deadline && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.deadline.message}
                </p>
              )}
            </div>
          </div>
          {/* Contact Person + Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="contactPerson"
                className="block text-sm font-medium text-[#2E2E38] mb-2"
              >
                Contact Person (Vis-à-vis)
                <span className="ml-1 text-xs text-gray-400">(optional)</span>
              </label>
              <input
                id="contactPerson"
                type="text"
                {...register("contactPerson")}
                placeholder="Name of person to meet"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E2E38]"
              />
              {errors.contactPerson && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.contactPerson.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="contactPhone"
                className="block text-sm font-medium text-[#2E2E38] mb-2"
              >
                Contact Phone
                <span className="ml-1 text-xs text-gray-400">(optional)</span>
              </label>
              <input
                id="contactPhone"
                type="tel"
                {...register("contactPhone")}
                placeholder="+216 XX XXX XXX"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E2E38]"
              />
              {errors.contactPhone && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.contactPhone.message}
                </p>
              )}
            </div>
          </div>
          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-[#2E2E38] mb-3">
              Priority Level *
            </label>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <div className="flex gap-4">
                  {priorityLevels.map((priority, index) => (
                    <label
                      key={priority}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        value={index}
                        checked={field.value === index}
                        onChange={() => field.onChange(index)}
                        className="w-4 h-4 text-[#2E2E38] focus:ring-[#2E2E38]"
                      />
                      <span className="text-sm text-gray-700">{priority}</span>
                    </label>
                  ))}
                </div>
              )}
            />
            {errors.priority && (
              <p className="mt-1 text-xs text-red-500">
                {errors.priority.message}
              </p>
            )}
          </div>

          {/* Estimated Cost */}
          <div>
            <label
              htmlFor="estimatedCost"
              className="block text-sm font-medium text-[#2E2E38] mb-2"
            >
              Estimated Cost
              <span className="ml-1 text-xs text-gray-400">(optional)</span>
            </label>
            <input
              id="estimatedCost"
              type="number"
              step="0.01"
              min="0"
              {...register("estimatedCost")}
              placeholder="0.00"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E2E38]"
            />
            {errors.estimatedCost && (
              <p className="mt-1 text-xs text-red-500">
                {errors.estimatedCost.message}
              </p>
            )}
          </div>

          {/* Delivery Address */}
          <fieldset className="space-y-4 border-t border-border pt-4">
            <legend className="text-sm font-medium text-[#2E2E38] px-2 bg-white">
              Delivery Address
            </legend>

            <div>
              <input
                {...register("deliveryAddress.street")}
                placeholder="Street *"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E2E38]"
              />
              {errors.deliveryAddress?.street && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.deliveryAddress.street.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  {...register("deliveryAddress.city")}
                  placeholder="City *"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E2E38]"
                />
                {errors.deliveryAddress?.city && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.deliveryAddress.city.message}
                  </p>
                )}
              </div>
              <div>
                <input
                  {...register("deliveryAddress.postalCode")}
                  placeholder="Postal Code *"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E2E38]"
                />
                {errors.deliveryAddress?.postalCode && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.deliveryAddress.postalCode.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <input
                {...register("deliveryAddress.country")}
                placeholder="Country *"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E2E38]"
              />
              {errors.deliveryAddress?.country && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.deliveryAddress.country.message}
                </p>
              )}
            </div>

            <div>
              <input
                {...register("deliveryAddress.note")}
                placeholder="Note (optional)"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E2E38]"
              />
            </div>
          </fieldset>

          {/* ── Attachments ── */}
          <div>
            <label className="block text-sm font-medium text-[#2E2E38] mb-2">
              Attachments
              <span className="ml-1 text-xs text-gray-400">(optional)</span>
            </label>

            {/* Drop zone */}
            <div
              onClick={() => canAddMore && inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (canAddMore) addFiles(e.dataTransfer.files);
              }}
              className={`border-2 border-dashed rounded-lg p-8 text-center
                          transition-colors
                          ${
                            canAddMore
                              ? "cursor-pointer hover:border-[#2E2E38]"
                              : "cursor-not-allowed opacity-50"
                          }
                          border-border`}
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium text-[#2E2E38]">
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              <p className="text-xs text-gray-400">
                Images or PDF · Max 10 MB · Up to {MAX_FILES} files
              </p>
              {!canAddMore && (
                <p className="text-xs text-amber-600 mt-1 font-medium">
                  Maximum {MAX_FILES} files reached
                </p>
              )}
            </div>

            <input
              ref={inputRef}
              type="file"
              multiple
              accept={ALLOWED_TYPES.join(",")}
              className="hidden"
              onChange={(e) => e.target.files && addFiles(e.target.files)}
            />

            {/* Validation errors for rejected files */}
            {Object.entries(fileErrors).map(([name, err]) => (
              <p key={name} className="mt-1 text-xs text-red-500">
                {name}: {err}
              </p>
            ))}

            {/* Selected file list */}
            {selectedFiles.length > 0 && (
              <ul className="mt-3 space-y-2">
                {selectedFiles.map((file) => (
                  <li
                    key={file.name}
                    className="flex items-center gap-3 rounded-lg border
                               border-border bg-white px-3 py-2 text-sm"
                  >
                    <FileIcon className="w-4 h-4 shrink-0 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-gray-700">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatBytes(file.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(file.name)}
                      className="shrink-0 text-gray-400
                                 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => navigate("/requests/mine")}
              className="px-6 py-2 border border-border rounded-lg
                         text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#2E2E38] text-white rounded-lg
                         hover:bg-[#1a1a24] transition-colors flex items-center
                         gap-2 disabled:opacity-50"
            >
              {isSubmitting
                ? isUploadingFiles
                  ? `Uploading ${selectedFiles.length} file${selectedFiles.length > 1 ? "s" : ""}...`
                  : "Submitting..."
                : "Submit Request"}
            </button>
          </div>
        </form>
      </div>

      {/* Help Section */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Need Help?</h3>
        <p className="text-sm text-blue-700">
          For urgent requests, please contact the Facilities team at{" "}
          <a href="mailto:facilities@ey.com" className="underline">
            facilities@ey.com
          </a>{" "}
          or call ext. 2345
        </p>
      </div>
    </div>
  );
}
