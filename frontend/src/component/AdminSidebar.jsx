import { LayoutDashboard, Users, Briefcase, FileText, Wallet, Settings, LogOut, Shield, X } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function AdminSidebar({ sidebarOpen, setSidebarOpen }) {

  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    { name: "Dashboard",        icon: LayoutDashboard, path: "/admin-dashboard" },
    { name: "Worker Approvals", icon: Users,           path: "/admin/worker-approvals" },
    { name: "User Management",  icon: Users,           path: "/admin/user-management" },
    { name: "Active Jobs",      icon: Briefcase,       path: "/admin/jobs" },
    { name: "One Day Jobs",     icon: Briefcase,       path: "/admin/one-day-jobs" },
    // { name: "Applications",     icon: FileText,        path: "/admin/applications" },
    // { name: "Payments",         icon: Wallet,          path: "/admin/payments" },
    { name: "Wallet",           icon: Wallet,          path: "/admin/wallet" },
    // { name: "Settings",         icon: Settings,        path: "/admin/settings" },
  ];

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin-login");
  };

  return (
    <>
      {/* ── Mobile Overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        style={{ fontFamily: "'Sora', sans-serif" }}
        className={`fixed lg:static top-0 left-0 h-screen w-64 z-50
          bg-[#0d0d1a] border-r border-white/5
          flex flex-col justify-between
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >

        <div className="flex flex-col min-h-0">

          {/* ── Brand Header ── */}
          <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30
                              flex items-center justify-center text-violet-400">
                <Shield size={18} strokeWidth={2} />
              </div>
              <div>
                <p className="text-[13px] font-black text-white tracking-tight">Admin</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[1.5px] -mt-0.5">Control Panel</p>
              </div>
            </div>
            <button
              className="lg:hidden w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center
                         text-slate-400 hover:text-white hover:bg-white/10 transition"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={16} />
            </button>
          </div>

          {/* ── Nav Menu ── */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {menu.map((item, i) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;

              return (
                <Link
                  key={i}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold
                    transition-all duration-150 group relative
                    ${active
                      ? "bg-violet-600/20 text-violet-300 border border-violet-500/20"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
                    }`}
                >
                  {/* Active indicator bar */}
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5
                                     bg-violet-400 rounded-r-full" />
                  )}

                  <Icon
                    size={16}
                    strokeWidth={active ? 2.5 : 2}
                    className={active ? "text-violet-400" : "text-slate-500 group-hover:text-slate-300"}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

        </div>

        {/* ── Logout ── */}
        <div className="px-3 py-4 border-t border-white/5">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold
                       text-slate-500 hover:bg-rose-500/10 hover:text-rose-400
                       border border-transparent hover:border-rose-500/20
                       transition-all duration-150"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

      </div>
    </>
  );
}