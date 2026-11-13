import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="md:ml-64">
        <Header />
        <main className="p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
