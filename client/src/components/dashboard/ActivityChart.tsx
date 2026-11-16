import type { ActivityItem } from '@/types/dashboard';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface ActivityChartProps {
  activity: ActivityItem[];
}

export const ActivityChart = ({ activity }: ActivityChartProps) => {
  const chartData = activity.map((item) => ({
    ...item,
    date: new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
    }).format(new Date(item.date)),
  }));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-6">
        <h2 className="font-semibold text-gray-900">Video Activity</h2>

        <p className="mt-1 text-sm text-gray-500">Views and downloads over time</p>
      </div>

      {chartData.length === 0 ? (
        <div className="flex h-72 items-center justify-center text-sm text-gray-500">
          No activity data available.
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="date" tick={{ fontSize: 12 }} />

              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />

              <Tooltip />

              <Legend />

              <Line
                type="monotone"
                dataKey="views"
                name="Views"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
              />

              <Line
                type="monotone"
                dataKey="downloads"
                name="Downloads"
                stroke="#16a34a"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
