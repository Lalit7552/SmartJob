import {
  Home, Briefcase, User, Settings, LogOut, X,
  MessageSquare, History, Menu, Zap,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function EmployeeSidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("employerAuthToken");
    localStorage.removeItem("employerOnboardingToken");
    navigate("/");
  };

  const menu = [
    { name: "Dashboard", icon: Home,          path: "/employee-dashboard" },
    { name: "Worker",    icon: Briefcase,     path: "/employee/jobs" },
    { name: "Chats",     icon: MessageSquare, path: "/employee/chats" },
    { name: "My Jobs",   icon: History,       path: "/employee/myjobs" },
    { name: "Profile",   icon: User,          path: "/employee/profile" },
    { name: "One Day",   icon: Briefcase,     path: "/employer/one-dayjob" },
    { name: "Enquiry",   icon: Settings,      path: "/employee/enquiry" },
  ];

  const currentPage = menu.find((m) => m.path === location.pathname)?.name || "Employer Panel";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');

        @keyframes slideInDrawer {
          from { transform: translateX(-100%); opacity: .6; }
          to   { transform: translateX(0);     opacity: 1;  }
        }
        .emp-drawer-in { animation: slideInDrawer .25s cubic-bezier(.4,0,.2,1) both; }

        .emp-nav-item { transition: background .14s, color .14s; border: 1px solid transparent; }
        .emp-nav-item:hover:not(.is-active) {
          background: rgba(255,255,255,0.05) !important;
          color: #e2e8f0 !important;
        }
      `}</style>

      {/* ── MOBILE TOP NAVBAR ── */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-4 px-4 h-14"
        style={{
          fontFamily: "'Sora', sans-serif",
          background: "#0d0d1a",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 4px 24px -4px rgba(0,0,0,0.60)",
        }}
      >
        {/* Hamburger */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-90"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#94a3b8",
          }}
        >
          <Menu size={18} />
        </button>

        {/* Current page title */}
        <span
          className="text-sm font-bold text-white tracking-wide"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          {currentPage}
        </span>
      </header>

      {/* ── MOBILE OVERLAY ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <div
        className={`
          fixed lg:static top-0 left-0 h-screen w-64 z-[70]
          flex flex-col justify-between
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0 emp-drawer-in" : "-translate-x-full"}
          lg:translate-x-0
        `}
        style={{
          fontFamily: "'Sora', sans-serif",
          background: "#ffffff",
          borderRight: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="flex flex-col min-h-0">

          {/* Brand */}
          <div
            className="flex items-center justify-between px-5 py-5"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: "rgba(37,99,235,0.20)",
                  border: "1px solid rgba(96,165,250,0.30)",
                }}
              >
                <Zap size={17} style={{ color: "#60a5fa" }} fill="#60a5fa" />
              </div>
              <div>
                <p className="text-[13px] font-black text-white tracking-tight">
                  Employer<span style={{ color: "#60a5fa" }}>Hub</span>
                </p>
                <p
                  className="text-[9px] font-bold uppercase -mt-0.5"
                  style={{ color: "#475569", letterSpacing: "1.5px" }}
                >
                  Employer Panel
                </p>
              </div>
            </div>

            {/* Mobile close */}
            <button
              className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center transition"
              style={{ background: "rgba(255,255,255,0.05)", color: "#94a3b8" }}
              onClick={() => setSidebarOpen(false)}
            >
              <X size={16} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {menu.map((item) => {
              const Icon   = item.icon;
              const active = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`emp-nav-item ${active ? "is-active" : ""} flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold relative`}
                  style={active ? {
                    background: "rgba(37,99,235,0.18)",
                    color: "#93c5fd",
                    border: "1px solid rgba(96,165,250,0.22)",
                  } : { color: "#64748b" }}
                >
                  {/* Active left bar */}
                  {active && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                      style={{ background: "#60a5fa" }}
                    />
                  )}
                  <Icon
                    size={16}
                    strokeWidth={active ? 2.5 : 2}
                    style={{ color: active ? "#60a5fa" : "#475569" }}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <div className="px-3 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150"
            style={{ color: "#64748b", border: "1px solid transparent" }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(239,68,68,0.10)";
              e.currentTarget.style.color      = "#f87171";
              e.currentTarget.style.border     = "1px solid rgba(239,68,68,0.20)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color      = "#64748b";
              e.currentTarget.style.border     = "1px solid transparent";
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