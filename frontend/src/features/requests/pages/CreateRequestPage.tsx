import { useNavigate } from "react-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload } from "lucide-react";
import { useCreateRequest } from "@/features/requests";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { isApiError } from "@/shared/api/client";

const priorityLevels = ["Low", "Normal", "High", "Urgent"] as const;

const schema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().min(1, "Description is required").max(500),
  priority: z.number().min(0).max(3),
  deadline: z.string().optional(),
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

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      priority: 1,
    },
  });
  const onSubmit = (values: FormValues) => {
    mutate(
      {
        title: values.title,
        description: values.description,
        priority: values.priority,
        deadline: values.deadline || undefined,
        estimatedCost: values.estimatedCost
          ? parseFloat(values.estimatedCost)
          : undefined,
        deliveryAddress: values.deliveryAddress,
      },
      {
        onSuccess: () => navigate("/requests/mine"),
      },
    );
  };

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
            <p className="text-xs text-gray-500 mt-1">
              Be as detailed as possible to help us process your request
              efficiently
            </p>
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
              {...register("deadline")}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E2E38]"
            />
            {errors.deadline && (
              <p className="mt-1 text-xs text-red-500">
                {errors.deadline.message}
              </p>
            )}
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

          {/* File Upload placeholder */}
          <div>
            <label className="block text-sm font-medium text-[#2E2E38] mb-2">
              Attachments
              <span className="ml-1 text-xs text-gray-400">(coming soon)</span>
            </label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-[#2E2E38] transition-colors cursor-not-allowed bg-gray-50/50">
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-1">
                <span className="text-[#2E2E38] font-medium">
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PDF, DOC, DOCX, XLS, XLSX (max. 10MB)
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => navigate("/requests/mine")}
              className="px-6 py-2 border border-border rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2 bg-[#2E2E38] text-white rounded-lg hover:bg-[#1a1a24] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isPending ? "Submitting..." : "Submit Request"}
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
