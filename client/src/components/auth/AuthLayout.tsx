import type { ReactNode } from 'react';

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

export const AuthLayout = ({ title, description, children, footer }: AuthLayoutProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Video Platform</h1>

          <p className="mt-2 text-sm text-gray-500">Video Streaming & Media Processing</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>

            <p className="mt-2 text-sm text-gray-500">{description}</p>
          </div>

          {children}
        </div>

        {footer && <div className="mt-6 text-center text-sm text-gray-500">{footer}</div>}
      </div>
    </div>
  );
};
