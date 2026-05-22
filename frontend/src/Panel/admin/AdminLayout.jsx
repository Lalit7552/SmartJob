import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import AdminSidebar from "../../component/AdminSidebar";
import AdminBottomNav from "../../component/AdminBottomNav";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-[#0a0a12]">

      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-h-screen">

        {/* Mobile Topbar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-[#13131f] border-b border-white/5">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-white hover:bg-white/10 transition"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-sm font-bold text-white tracking-tight">Admin Panel</h1>
        </header>

        {/* Page Content */}
        <main ref={contentRef} className="flex-1 p-5 md:p-8 pb-24 overflow-y-auto">
          <Outlet />
        </main>

      </div>

      <AdminBottomNav hidden={sidebarOpen} />
    </div>
  );
}
