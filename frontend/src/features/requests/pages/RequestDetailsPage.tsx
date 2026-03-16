import { useParams, Link } from "react-router-dom";
import { useRequest, StatusBadge, RequestActions, PriorityBadge, CategoryBadge } from "@/features/requests";
import { PageSpinner } from "@/shared/components/PageSpinner";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { isApiError } from "@/shared/api/client";
import { UserRole } from "@/features/auth/types/auth.enums";
import { useAuthStore } from "@/features/auth/store/authStore";
import { formatDateTime, formatDate } from "@/shared/utils/date";


export function RequestDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: request, isLoading, isError, error } = useRequest(id!);
  const role = useAuthStore((s) => s.user?.role);

  const backLink =
    role === UserRole.Courier ? '/assignments' :
    role === UserRole.Collaborator ? '/requests/mine' :
    '/requests';

  const backLabel =
    role === UserRole.Courier ? '← Back to My Assignments' :
    role === UserRole.Collaborator ? '← Back to My Requests' :
    '← Back to All Requests';

  if (isLoading) return <PageSpinner />;
  if (isError)
    return (
      <ErrorMessage
        message={isApiError(error) ? error.message : 'Something went wrong.'}
      />
    );
  if (!request) return null;

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link to={backLink} className="text-sm text-primary hover:underline">
        {backLabel}
      </Link>

      {/* Header */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <h1 className="text-2xl font-semibold text-gray-900">
              {request.title}
            </h1>
            <p className="text-sm text-gray-500">
              Requested by{' '}
              <span className="font-medium text-gray-700">
                {request.requesterName}
              </span>
              {' · '}
              {formatDateTime(request.createdAt)}
            </p>
            {/* Badges row */}
            <div className="flex flex-wrap gap-2 pt-1">
              <StatusBadge status={request.status} />
              <PriorityBadge priority={request.priority} />
              <CategoryBadge category={request.category} />
              {request.deadline && (
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600">
                  Due {formatDate(request.deadline)}
                </span>
              )}
              {request.estimatedCost != null && (
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600">
                  Est. ${request.estimatedCost}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-medium text-gray-700">Description</h2>
        <p className="text-sm text-gray-600">{request.description}</p>
      </div>

      {/* Actions */}
      <RequestActions request={request} />

      {/* Delivery Address */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-medium text-gray-700">
          Delivery Address
        </h2>
        <p className="text-sm text-gray-600">
          {request.deliveryAddress.street}, {request.deliveryAddress.city},{' '}
          {request.deliveryAddress.postalCode},{' '}
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
          <h2 className="mb-3 text-sm font-medium text-gray-700">Assignment</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Courier</p>
              <p className="font-medium text-gray-800">
                {request.currentAssignment.courierName}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Assigned</p>
              <p className="text-gray-600">
                {formatDateTime(request.currentAssignment.assignedAt)}
              </p>
            </div>
            {request.currentAssignment.startedAt && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Started</p>
                <p className="text-gray-600">
                  {formatDateTime(request.currentAssignment.startedAt)}
                </p>
              </div>
            )}
            {request.currentAssignment.completedAt && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Completed</p>
                <p className="text-gray-600">
                  {formatDateTime(request.currentAssignment.completedAt)}
                </p>
              </div>
            )}
            {request.currentAssignment.actualCost != null && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Actual Cost</p>
                <p className="font-medium text-gray-800">
                  ${request.currentAssignment.actualCost}
                </p>
              </div>
            )}
            {request.currentAssignment.note && (
              <div className="col-span-2">
                <p className="text-xs text-gray-400 mb-0.5">Note</p>
                <p className="text-gray-600">{request.currentAssignment.note}</p>
              </div>
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
                <span className="text-gray-400 whitespace-nowrap">
                  {formatDateTime(log.occurredAt)}
                </span>
                <span className="text-gray-600">
                  <span className="font-medium">{log.eventType}</span>
                  {' — '}
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
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                    n <= request.survey!.rating
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {n}
                </span>
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {request.survey.rating}/5
            </span>
          </div>
          {request.survey.comment && (
            <p className="mt-2 text-sm text-gray-500 italic">
              "{request.survey.comment}"
            </p>
          )}
        </div>
      )}
    </div>
  );
}