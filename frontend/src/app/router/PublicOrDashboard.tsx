import { useAuthStore }  from "@/features/auth/store/authStore";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { LandingPage } from "../pages/LandingPage";

export function PublicOrDashboard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <DashboardPage /> : <LandingPage />;
}