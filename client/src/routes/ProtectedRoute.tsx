// import { useAuth } from "@/hooks/useAuth";
import { Navigate, Outlet, useLocation } from "react-router";

export const ProtectedRoute = () => {
  // const { user, isLoading } = useAuth();
  // const location = useLocation();

  // if (isLoading) {
  //   return <div className="p-8 text-center">Loading...</div>;
  // }

  // if (!user) {
  //   return (
  //     <Navigate
  //       to="/login"
  //       state={{ from: location }}
  //       replace
  //     />
  //   );
  // }

  return <Outlet />;
};
