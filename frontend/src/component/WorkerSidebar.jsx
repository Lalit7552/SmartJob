import {
  Home, Briefcase, User, Wallet, LogOut, X,
  MessageSquare, History, Star, Zap, Menu,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function WorkerSidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const menu = [
    { name: "Dashboard", icon: Home,          path: "/worker-dashboard" },
    { name: "My Jobs",   icon: Briefcase,     path: "/worker/jobs" },
    { name: "Chats",     icon: MessageSquare, path: "/worker/chats" },
    { name: "One Day",   icon: History,       path: "/worker/onedayjob" },
    { name: "Applied",   icon: History,       path: "/worker/appliedjob" },
    { name: "Rating",    icon: Star,          path: "/worker/rating" },
    { name: "Wallet",    icon: Wallet,        path: "/worker/wallet" },
    { name: "Profile",   icon: User,          path: "/worker/profile" },
  ];

  const currentPage =
    menu.find((m) => m.path === location.pathname)?.name || "Worker Panel";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');

        @keyframes slideInDrawer {
          from { transform: translateX(-100%); opacity: .6; }
          to   { transform: translateX(0);     opacity: 1;  }
        }
        .drawer-in { animation: slideInDrawer .25s ease both; }

        .nav-item { transition: all .15s; border: 1px solid transparent; }
        .nav-item:hover:not(.is-active) {
          background: #f1f5f9 !important;
          color: #0f172a !important;
        }
      `}</style>

      {/* TOP NAVBAR */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-4 px-4 h-[var(--worker-topbar-h)]"
        style={{
          fontFamily: "'Sora', sans-serif",
          background: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: "#f1f5f9",
            color: "#334155",
          }}
        >
          <Menu size={18} />
        </button>

        <span className="text-sm font-bold text-slate-800">
          {currentPage}
        </span>
      </header>

      {/* OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-[60] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`
          fixed lg:static top-0 left-0 h-screen w-64 z-[70]
          flex flex-col justify-between
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0 drawer-in" : "-translate-x-full"}
          lg:translate-x-0
        `}
        style={{
          fontFamily: "'Sora', sans-serif",
          background: "#ffffff",
          borderRight: "1px solid #e2e8f0",
        }}
      >
        <div className="flex flex-col min-h-0">

          {/* BRAND */}
          <div className="flex items-center justify-between px-5 py-5 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-100 border border-blue-200">
                <Zap size={17} className="text-blue-600" />
              </div>
              <div>
                <p className="text-[13px] font-black text-slate-800">
                  Worker<span className="text-blue-600">Pro</span>
                </p>
                <p className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">
                  Worker Panel
                </p>
              </div>
            </div>

            <button
              className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 text-slate-500"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={16} />
            </button>
          </div>

          {/* NAV */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {menu.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`nav-item ${active ? "is-active" : ""} flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold relative`}
                  style={
                    active
                      ? {
                          background: "#eff6ff",
                          color: "#1d4ed8",
                          border: "1px solid #dbeafe",
                        }
                      : { color: "#334155" }
                  }
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-blue-600" />
                  )}

                  <Icon
                    size={16}
                    style={{
                      color: active ? "#2563eb" : "#64748b",
                    }}
                  />

                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* LOGOUT */}
        <div className="px-3 py-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold"
            style={{ color: "#475569" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#fef2f2";
              e.currentTarget.style.color = "#dc2626";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#475569";
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}