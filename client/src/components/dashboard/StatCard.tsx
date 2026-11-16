import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
}

export const StatCard = ({ title, value, description, icon: Icon }: StatCardProps) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>

        <div className="rounded-lg bg-gray-100 p-2">
          <Icon size={20} className="text-gray-600" />
        </div>
      </div>

      <h3 className="mt-4 text-2xl font-semibold text-gray-900">{value}</h3>

      {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
    </div>
  );
};
