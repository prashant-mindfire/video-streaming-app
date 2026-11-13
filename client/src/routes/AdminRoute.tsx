import { useAuth } from "@/hooks/useAuth";
import { Navigate, Outlet } from "react-router";

export const AdminRoute = () => {
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return <Navigate to="/videos" replace />;
  }

  return <Outlet />;
};
