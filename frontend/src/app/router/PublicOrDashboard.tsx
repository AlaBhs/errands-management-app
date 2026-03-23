import { useAuthStore }  from "@/features/auth/store/authStore";
import { Navigate }      from "react-router-dom";
import { lazy, Suspense } from "react";
import { PageSpinner }   from "@/shared/components/PageSpinner";

const LandingPage = lazy(() =>
  import("@/app/pages/LandingPage")
    .then(m => ({ default: m.LandingPage })));

export function PublicOrDashboard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Suspense fallback={<PageSpinner />}>
      <LandingPage />
    </Suspense>
  );
}