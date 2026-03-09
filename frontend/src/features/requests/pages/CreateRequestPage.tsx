import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateRequest } from "../hooks";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { isApiError } from "@/shared/api/client";

const priorityLevels = ["Low", "Normal", "High", "Urgent"] as const;

const schema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().min(1, "Description is required").max(500),
  requesterId: z.uuid("Requester ID must be a valid UUID"),
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
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      priority: 1, // Default to "Normal"
    },
  });

  const onSubmit = (values: FormValues) => {
    mutate(
      {
        ...values,
        deadline: values.deadline || undefined,
        estimatedCost: values.estimatedCost
          ? parseFloat(values.estimatedCost)
          : undefined,
      },
      {
        onSuccess: () => navigate("/requests"),
      },
    );
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">New Request</h1>

      {isError && (
        <ErrorMessage
          message={isApiError(error) ? error.message : "Something went wrong."}
        />
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            {...register("title")}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            {...register("description")}
            rows={3}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-500">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Requester ID — temporary until auth */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Requester ID
            <span className="ml-1 text-xs text-gray-400">
              (temporary — replaced by auth in Phase 5)
            </span>
          </label>
          <input
            {...register("requesterId")}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.requesterId && (
            <p className="mt-1 text-xs text-red-500">
              {errors.requesterId.message}
            </p>
          )}
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Priority
          </label>
          <select
            {...register("priority")}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {priorityLevels.map((p, index) => (
              <option key={p} value={index}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Deadline
            <span className="ml-1 text-xs text-gray-400">(optional)</span>
          </label>
          <input
            type="date"
            {...register("deadline")}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Estimated Cost */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Estimated Cost
            <span className="ml-1 text-xs text-gray-400">(optional)</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register("estimatedCost")}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.estimatedCost && (
            <p className="mt-1 text-xs text-red-500">
              {errors.estimatedCost.message}
            </p>
          )}
        </div>

        {/* Delivery Address */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-gray-700">
            Delivery Address
          </legend>

          <div>
            <input
              {...register("deliveryAddress.street")}
              placeholder="Street"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.deliveryAddress?.street && (
              <p className="mt-1 text-xs text-red-500">
                {errors.deliveryAddress.street.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                {...register("deliveryAddress.city")}
                placeholder="City"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
                placeholder="Postal Code"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
              placeholder="Country"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </fieldset>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/requests")}
            className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
