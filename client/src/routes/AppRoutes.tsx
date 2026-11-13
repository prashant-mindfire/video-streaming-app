import { Navigate, Route, Routes } from "react-router";
import { ProtectedRoute } from "./ProtectedRoute";
import Login from "@/pages/auth/Login";
import Layout from "@/components/layout/Layout";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />

      {/* Authenticated routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/videos" replace />} />

          {/* <Route path="/videos" element={<VideosPage />} />

          <Route
            path="/videos/:videoId"
            element={<VideoDetailsPage />}
          /> */}

          {/* <Route path="/upload" element={<UploadPage />} /> */}

          {/* Admin-only routes */}
          {/* <Route element={<AdminRoute />}>
            <Route
              path="/dashboard"
              element={<DashboardPage />}
            />
          </Route> */}
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/videos" replace />} />
    </Routes>
  );
};
