import {
  LayoutDashboard,
  Video,
  Upload,
  Clapperboard,
} from "lucide-react";
import { NavLink } from "react-router";

const links = [
  { label: "My Videos", path: "/videos", icon: Video },
  { label: "Upload Videos", path: "/upload", icon: Upload },
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
];

const Sidebar = () => {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-white md:block">
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <Clapperboard className="text-indigo-600" />
        <span className="text-lg font-bold text-gray-900">
          StreamHub
        </span>
      </div>

      <nav className="space-y-2 p-4">
        <p className="mb-3 px-3 text-xs font-semibold uppercase text-gray-400">
          Workspace
        </p>

        {links.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            <Icon size={19} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
