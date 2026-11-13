import { Bell, UserCircle } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-6">
      <h1 className="font-semibold text-gray-800">
        Video Management
      </h1>
      <div className="flex items-center gap-5">
        <button aria-label="Notifications">
          <Bell size={20} className="text-gray-500" />
        </button>
        <button aria-label="User profile">
          <UserCircle size={25} className="text-gray-600" />
        </button>
      </div>
    </header>
  );
};

export default Header;
