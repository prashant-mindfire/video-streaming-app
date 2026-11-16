import { Navigate, Route, Routes } from 'react-router';
import { ProtectedRoute } from './ProtectedRoute';
import Login from '@/pages/auth/Login';
import Layout from '@/components/layout/Layout';
import Videos from '@/pages/videos/Videos';
import NotFound from '@/pages/NotFound';
import Upload from '@/pages/uploads/Upload';
import { AdminRoute } from './AdminRoute';
import Dashboard from '@/pages/dashboard/Dashboard';
import { GuestRoute } from './GuestRoute';
import Register from '@/pages/auth/Register';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/videos" replace />} />

          <Route path="/videos" element={<Videos />} />

          <Route path="/upload" element={<Upload />} />

          <Route element={<AdminRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
