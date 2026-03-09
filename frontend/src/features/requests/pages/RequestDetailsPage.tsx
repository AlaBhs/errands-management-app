import { useParams, Link } from "react-router-dom";
import { useRequest } from "../hooks/useRequests";
import { StatusBadge } from "../components/StatusBadge";
import { PageSpinner } from "@/shared/components/PageSpinner";
import { ErrorMessage } from "@/shared/components/ErrorMessage";

export function RequestDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: request, isLoading, isError, error } = useRequest(id!);

  if (isLoading) return <PageSpinner />;
  if (isError) return <ErrorMessage message={(error as any)?.message} />;
  if (!request) return null;

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link to="/requests" className="text-sm text-primary hover:underline">
        ← Back to Requests
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {request.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Requested by {request.requesterId} ·{" "}
            {/* {new Date(request.createdAt).toLocaleDateString()} */}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {/* Description */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-medium text-gray-700">Description</h2>
        <p className="text-sm text-gray-600">{request.description}</p>
      </div>

      {/* Delivery Address */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-medium text-gray-700">
          Delivery Address
        </h2>
        <p className="text-sm text-gray-600">
          {request.deliveryAddress.street}, {request.deliveryAddress.city},{" "}
          {request.deliveryAddress.postalCode},{" "}
          {request.deliveryAddress.country}
        </p>
        {request.deliveryAddress.note && (
          <p className="mt-1 text-xs text-gray-400">
            {request.deliveryAddress.note}
          </p>
        )}
      </div>

      {/* Assignment */}
      {request.currentAssignment && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-medium text-gray-700">Assignment</h2>
          <div className="space-y-1 text-sm text-gray-600">
            <p>
              Courier ID:{" "}
              <span className="font-medium">
                {request.currentAssignment.courierId}
              </span>
            </p>
            <p>
              Assigned:{" "}
              {new Date(
                request.currentAssignment.assignedAt,
              ).toLocaleDateString()}
            </p>
            {request.currentAssignment.startedAt && (
              <p>
                Started:{" "}
                {new Date(
                  request.currentAssignment.startedAt,
                ).toLocaleDateString()}
              </p>
            )}
            {request.currentAssignment.completedAt && (
              <p>
                Completed:{" "}
                {new Date(
                  request.currentAssignment.completedAt,
                ).toLocaleDateString()}
              </p>
            )}
            {request.currentAssignment.actualCost != null && (
              <p>Actual Cost: ${request.currentAssignment.actualCost}</p>
            )}
            {request.currentAssignment.note && (
              <p className="text-gray-400">{request.currentAssignment.note}</p>
            )}
          </div>
        </div>
      )}

      {/* Audit Log */}
      {request.auditLogs.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-medium text-gray-700">Activity</h2>
          <ol className="space-y-3">
            {request.auditLogs.map((log, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="text-gray-400">
                  {new Date(log.occurredAt).toLocaleDateString()}
                </span>
                <span className="text-gray-600">
                  <span className="font-medium">{log.eventType}</span> —{" "}
                  {log.detail}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Survey */}
      {request.survey && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-medium text-gray-700">Survey</h2>
          <p className="text-sm text-gray-600">
            Rating:{" "}
            <span className="font-medium">{request.survey.rating}/5</span>
          </p>
          {request.survey.comment && (
            <p className="mt-1 text-sm text-gray-500">
              {request.survey.comment}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
