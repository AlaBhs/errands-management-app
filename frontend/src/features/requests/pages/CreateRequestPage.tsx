import { useNavigate, useLocation } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileIcon, Upload, X, Loader2, RotateCcw, BookTemplate } from "lucide-react";
import { useCreateRequest } from "@/features/requests";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { PageHeader } from "@/shared/components/PageHeader";
import { FormSection } from "@/shared/components/FormSection";
import { FieldGroup } from "@/shared/components/FieldGroup";
import { DatePicker } from "@/shared/components/DatePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isApiError } from "@/shared/api/client";
import { RequestCategory } from "@/features/requests/types/request.enums";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useUploadAttachments } from "../hooks";
import type { RequestDetailsDto } from "../types";
import { AddressMapPicker } from "@/shared/components/AddressMapPicker";
import type { RequestTemplateListItemDto } from "@/features/request-templates/types";
import { TemplatePicker } from "@/features/request-templates/components/TemplatePicker";

// ── Constants ─────────────────────────────────────────────────────────────────

const PRIORITY_LEVELS = ["Low", "Normal", "High", "Urgent"] as const;

const CATEGORY_OPTIONS: { value: RequestCategory; label: string }[] = [
  { value: RequestCategory.OfficeSupplies, label: "Office Supplies" },
  { value: RequestCategory.ITEquipment, label: "IT Equipment" },
  { value: RequestCategory.Travel, label: "Travel" },
  { value: RequestCategory.Facilities, label: "Facilities" },
  { value: RequestCategory.Other, label: "Other" },
];

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_FILES = 5;

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatBytes = (bytes: number): string => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const minDeadlineDate = (): string => {
  const d = new Date();
  d.setHours(d.getHours() + 24);
  return d.toISOString().split("T")[0];
};

// ── Schema ────────────────────────────────────────────────────────────────────

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
      return new Date(val) >= new Date(minDeadlineDate());
    }, "Deadline must be at least 24 hours from now."),
  estimatedCost: z
    .string()
    .optional()
    .refine(
      (val) => val === "" || val === undefined || !isNaN(parseFloat(val)),
      "Estimated cost must be a valid number",
    ),
  deliveryAddress: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
    note: z.string().optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  }),
});

type FormValues = z.infer<typeof schema>;

// ── Prefill helper — maps RequestDetailsDto → FormValues ──────────────────────

function buildDefaultValues(prefill?: RequestDetailsDto): Partial<FormValues> {
  if (!prefill) return { priority: 1 };

  const priorityMap: Record<string, number> = {
    Low: 0,
    Normal: 1,
    High: 2,
    Urgent: 3,
  };

  return {
    title: prefill.title,
    description: prefill.description,
    priority: priorityMap[prefill.priority] ?? 1,
    category: prefill.category,
    contactPerson: prefill.contactPerson ?? "",
    contactPhone: prefill.contactPhone ?? "",
    comment: prefill.comment ?? "",
    estimatedCost:
      prefill.estimatedCost != null ? String(prefill.estimatedCost) : "",
    deliveryAddress: {
      street: prefill.deliveryAddress.street,
      city: prefill.deliveryAddress.city,
      postalCode: prefill.deliveryAddress.postalCode,
      country: prefill.deliveryAddress.country,
      note: prefill.deliveryAddress.note ?? "",
      latitude: prefill.deliveryAddress.latitude,
      longitude: prefill.deliveryAddress.longitude,
    },
  };
}

// ── Shared input className ────────────────────────────────────────────────────

const inputCls =
  "w-full px-4 py-2 border border-border rounded-lg text-sm " +
  "bg-background dark:bg-card text-foreground " +
  "focus:outline-none focus:ring-2 focus:ring-[var(--ey-dark)] " +
  "placeholder:text-muted-foreground";

// ── Component ─────────────────────────────────────────────────────────────────

export function CreateRequestPage() {
  const navigate = useNavigate();
  const location = useLocation();

  /** Router-state prefill: set by the Resubmit button in MyRequestsPage */
  const resubmitSource = location.state?.resubmitFrom as
    | RequestDetailsDto
    | undefined;
  const isResubmit = Boolean(resubmitSource);

  const { mutate, isPending, isError, error } = useCreateRequest();

  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});

  const { mutateAsync: uploadFiles, isPending: isUploadingFiles } =
    useUploadAttachments();

  const [appliedTemplate, setAppliedTemplate] = useState<
    RequestTemplateListItemDto | undefined
  >(undefined);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: buildDefaultValues(resubmitSource),
  });

  // ── File handling ──────────────────────────────────────────────────────────

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type))
      return "Only images (JPEG, PNG, GIF, WEBP) and PDF files are allowed.";
    if (file.size > MAX_SIZE_BYTES)
      return `Exceeds 10 MB limit (${formatBytes(file.size)}).`;
    return null;
  };

  const addFiles = (incoming: FileList | File[]) => {
    const arr = Array.from(incoming);
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

  const applyTemplate = (template: RequestTemplateListItemDto) => {
    setAppliedTemplate(template);
    // Fetch template details to get address and description
    import("@/features/request-templates/api/templates.api").then(
      ({ templatesApi }) => {
        templatesApi.getById(template.id).then((res) => {
          const t = res.data;
          setValue("title", t.title);
          setValue("description", t.description);
          setValue("category", t.category);
          if (t.estimatedCost != null) {
            setValue("estimatedCost", String(t.estimatedCost));
          }
          if (t.address) {
            setValue("deliveryAddress.city", t.address.city ?? "");
            setValue("deliveryAddress.postalCode", t.address.postalCode ?? "");
            setValue("deliveryAddress.country", t.address.country ?? "");
            setValue("deliveryAddress.street", t.address.street ?? "");
            setValue("deliveryAddress.note", t.address.note ?? "");
            if (t.address.latitude)
              setValue("deliveryAddress.latitude", t.address.latitude);
            if (t.address.longitude)
              setValue("deliveryAddress.longitude", t.address.longitude);
          }
        });
      },
    );
  };

  const clearTemplate = () => {
    setAppliedTemplate(undefined);
    reset({ priority: 1 });
  };
  // ── Submit ─────────────────────────────────────────────────────────────────

  const onSubmit = (values: FormValues) => {
    mutate(
      {
        title: values.title,
        description: values.description,
        priority: values.priority,
        category: values.category,
        contactPerson: values.contactPerson || undefined,
        contactPhone: values.contactPhone || undefined,
        comment: values.comment || undefined,
        deadline: values.deadline || undefined,
        estimatedCost: values.estimatedCost
          ? parseFloat(values.estimatedCost)
          : undefined,
        deliveryAddress: {
          street: values.deliveryAddress.street || "",
          city: values.deliveryAddress.city || "",
          postalCode: values.deliveryAddress.postalCode || "",
          country: values.deliveryAddress.country || "",
          note: values.deliveryAddress.note,
          latitude: values.deliveryAddress.latitude,
          longitude: values.deliveryAddress.longitude,
        },
      },
      {
        onSuccess: async (response) => {
          const requestId = response.data;
          if (!requestId) {
            navigate("/requests/mine");
            return;
          }

          if (selectedFiles.length > 0) {
            try {
              await uploadFiles({ requestId, files: selectedFiles });
              toast.success(
                `Request submitted with ${selectedFiles.length} attachment${selectedFiles.length > 1 ? "s" : ""}.`,
              );
            } catch {
              toast.warning(
                "Request created but some attachments failed to upload. " +
                  "You can add them from the request details page.",
              );
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
  const canAddMore = selectedFiles.length < MAX_FILES;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <PageHeader
        title={isResubmit ? "Resubmit Request" : "Create New Request"}
        subtitle={
          isResubmit
            ? `Pre-filled from "${resubmitSource!.title}" — review and resubmit.`
            : "Submit a new errand request for processing."
        }
        actions={
          isResubmit ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-950/30 px-3 py-1 text-xs font-medium text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
              <RotateCcw className="h-3 w-3" />
              Resubmitting cancelled request
            </span>
          ) : undefined
        }
      />

      {isError && (
        <ErrorMessage
          message={isApiError(error) ? error.message : "Something went wrong."}
        />
      )}

      {/* ── Template Picker ──────────────────────────────────────────────────── */}
      <div
        className="rounded-xl border border-indigo-100 dark:border-indigo-900/30
                bg-indigo-50/50 dark:bg-indigo-950/10 p-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <BookTemplate className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
            Use a Template
          </span>
          {appliedTemplate && (
            <span className="ml-auto text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              ✓ Form pre-filled from "{appliedTemplate.name}"
            </span>
          )}
        </div>
        <TemplatePicker
          onSelect={applyTemplate}
          onClear={clearTemplate}
          selectedName={appliedTemplate?.name}
        />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        {/* ── General Info ─────────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-card rounded-xl border border-border p-6 space-y-5">
          <FormSection
            title="General Info"
            description="Describe your request in detail so it can be processed accurately."
          >
            <FieldGroup
              label="Request Title"
              htmlFor="title"
              error={errors.title?.message}
            >
              <input
                id="title"
                type="text"
                {...register("title")}
                placeholder="e.g. Deliver office supplies to floor 3"
                className={inputCls}
              />
            </FieldGroup>

            <FieldGroup
              label="Description"
              htmlFor="description"
              error={errors.description?.message}
            >
              <textarea
                id="description"
                {...register("description")}
                placeholder="Provide detailed information about what needs to be done..."
                rows={4}
                className={inputCls + " resize-none"}
              />
            </FieldGroup>

            <FieldGroup
              label="Additional Comments"
              htmlFor="comment"
              optional
              error={errors.comment?.message}
            >
              <textarea
                id="comment"
                {...register("comment")}
                rows={2}
                placeholder="Access codes, schedule constraints, special handling instructions..."
                className={inputCls + " resize-none"}
              />
            </FieldGroup>
          </FormSection>
        </div>

        {/* ── Classification + Contact & Address (side by side on lg) ──────── */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex flex-col gap-6 min-w-0">
            {/* ── Classification ─────────────────────────────────────────────── */}
            <div className="bg-white dark:bg-card rounded-xl border border-border p-6">
              <FormSection
                title="Classification"
                description="Helps route your request to the right team."
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FieldGroup label="Category" error={errors.category?.message}>
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full !rounded-lg">
                            <SelectValue placeholder="Select a category…" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORY_OPTIONS.map(({ value, label }) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FieldGroup>
                  <FieldGroup
                    label="Priority Level"
                    error={errors.priority?.message}
                  >
                    <Controller
                      name="priority"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={String(field.value)}
                          onValueChange={(value) =>
                            field.onChange(parseInt(value, 10))
                          }
                        >
                          <SelectTrigger className="w-full !rounded-lg">
                            <SelectValue placeholder="Select priority…" />
                          </SelectTrigger>
                          <SelectContent>
                            {PRIORITY_LEVELS.map((label, idx) => (
                              <SelectItem key={label} value={String(idx)}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FieldGroup>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FieldGroup
                    label="Due Date"
                    htmlFor="deadline"
                    optional
                    error={errors.deadline?.message}
                  >
                    <Controller
                      name="deadline"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          minDate={minDeadlineDate()}
                          placeholder="Pick a date"
                        />
                      )}
                    />
                  </FieldGroup>

                  <FieldGroup
                    label="Estimated Cost"
                    htmlFor="estimatedCost"
                    optional
                    error={errors.estimatedCost?.message}
                  >
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground text-sm">
                        tnd
                      </span>
                      <input
                        id="estimatedCost"
                        type="number"
                        step="0.01"
                        min="0"
                        {...register("estimatedCost")}
                        placeholder="0.00"
                        className={`${inputCls} pl-10`}
                      />
                    </div>
                  </FieldGroup>
                </div>
              </FormSection>
            </div>
            {/* ── Attachments ──────────────────────────────────────────────────── */}
            <div className="flex-1 bg-white dark:bg-card rounded-xl border border-border p-6 space-y-5">
              <FormSection
                title="Attachments"
                description="Images or PDF documents up to 10 MB each."
              >
                <div
                  onClick={() => canAddMore && inputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (canAddMore) addFiles(e.dataTransfer.files);
                  }}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors bg-muted/30 dark:bg-muted/10
                ${
                  canAddMore
                    ? "cursor-pointer hover:border-foreground dark:hover:border-[var(--ey-yellow)] hover:bg-muted/50 dark:hover:bg-muted/20"
                    : "cursor-not-allowed opacity-50"
                } border-border`}
                >
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">
                    <span className="font-medium text-foreground">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
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

                {Object.entries(fileErrors).map(([name, err]) => (
                  <p key={name} className="text-xs text-red-500">
                    {name}: {err}
                  </p>
                ))}

                {selectedFiles.length > 0 && (
                  <ul className="space-y-2">
                    {selectedFiles.map((file) => (
                      <li
                        key={file.name}
                        className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 dark:bg-muted/20 px-3 py-2 text-sm"
                      >
                        <FileIcon className="w-4 h-4 shrink-0 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatBytes(file.size)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(file.name)}
                          className="shrink-0 text-muted-foreground hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </FormSection>
            </div>
          </div>
          {/* ── Contact & Address ───────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 bg-white dark:bg-card rounded-xl border border-border p-6">
            <FormSection
              title="Contact & Address"
              description="Who to meet on-site and where to deliver."
            >
              {/* Contact row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FieldGroup
                  label="Contact Person"
                  htmlFor="contactPerson"
                  optional
                  error={errors.contactPerson?.message}
                >
                  <input
                    id="contactPerson"
                    type="text"
                    {...register("contactPerson")}
                    placeholder="Name of person to meet on-site"
                    className={inputCls}
                  />
                </FieldGroup>

                <FieldGroup
                  label="Contact Phone"
                  htmlFor="contactPhone"
                  optional
                  error={errors.contactPhone?.message}
                >
                  <input
                    id="contactPhone"
                    type="tel"
                    {...register("contactPhone")}
                    placeholder="+216 XX XXX XXX"
                    className={inputCls}
                  />
                </FieldGroup>
              </div>

              {/* Address Map Picker */}
              <div className="space-y-3">
                <label className="text-xs font-medium text-foreground">
                  Delivery Location
                </label>
                <Controller
                  name="deliveryAddress.latitude"
                  control={control}
                  render={({ field: latField }) => (
                    <Controller
                      name="deliveryAddress.longitude"
                      control={control}
                      render={({ field: lngField }) => (
                        <AddressMapPicker
                          latitude={latField.value}
                          longitude={lngField.value}
                          onCoordinatesChange={(lat, lng) => {
                            latField.onChange(lat);
                            lngField.onChange(lng);
                          }}
                          onAddressChange={(address) => {
                            // Update address fields from reverse geocoding
                            if (address.street)
                              setValue(
                                "deliveryAddress.street",
                                address.street,
                              );
                            if (address.city)
                              setValue("deliveryAddress.city", address.city);
                            if (address.postalCode)
                              setValue(
                                "deliveryAddress.postalCode",
                                address.postalCode,
                              );
                            if (address.country)
                              setValue(
                                "deliveryAddress.country",
                                address.country,
                              );
                          }}
                        />
                      )}
                    />
                  )}
                />
              </div>
              <FieldGroup label="Address Note" htmlFor="addressNote" optional>
                <input
                  id="addressNote"
                  {...register("deliveryAddress.note")}
                  placeholder="Floor, building, landmark…"
                  className={inputCls}
                />
              </FieldGroup>
            </FormSection>
          </div>
        </div>

        {/* ── Form Actions ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 py-4 border-t border-border">
          <button
            type="button"
            onClick={() => navigate("/requests/mine")}
            disabled={isSubmitting}
            className="px-6 py-2 border border-border rounded-lg text-sm text-foreground
                       hover:bg-muted dark:hover:bg-muted/40 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2 bg-[var(--ey-dark)] text-white
                       rounded-lg text-sm hover:bg-[var(--ey-text-hover)] transition-colors
                       disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isUploadingFiles
                  ? `Uploading ${selectedFiles.length} file${selectedFiles.length > 1 ? "s" : ""}…`
                  : "Submitting…"}
              </>
            ) : isResubmit ? (
              <>
                <RotateCcw className="h-4 w-4" />
                Resubmit Request
              </>
            ) : (
              "Submit Request"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
