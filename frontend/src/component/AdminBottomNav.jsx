import { LayoutDashboard, Users, Briefcase, Wallet } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function AdminBottomNav({ hidden }) {
  if (hidden) return null;

  const location = useLocation();

  const menu = [
    { name: "Dashboard",     icon: LayoutDashboard, path: "/admin-dashboard" },
    { name: "Workers",       icon: Users,           path: "/admin/worker-approvals" },
    { name: "Jobs",          icon: Briefcase,       path: "/admin/jobs" },
    { name: "Wallet",        icon: Wallet,          path: "/admin/wallet" },
    { name: "One Day Jobs",  icon: Briefcase,       path: "/admin/one-day-jobs" },
  ];

  return (
    <div
      style={{ fontFamily: "'Sora', sans-serif" }}
      className="fixed bottom-0 left-0 w-full z-50 lg:hidden
                 bg-[#0d0d1a]/95 backdrop-blur-md border-t border-white/5"
    >
      <div className="grid grid-cols-5">
        {menu.map((item, i) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;

          return (
            <Link
              key={i}
              to={item.path}
              className="flex flex-col items-center justify-center py-3 gap-1 relative transition-all duration-150"
            >
              {/* Active top line */}
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2
                                 w-8 h-[2px] bg-violet-400 rounded-full" />
              )}

              {/* Icon */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150
                ${active
                  ? "bg-violet-600/20 border border-violet-500/25 text-violet-400"
                  : "text-slate-500"
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2.5 : 2} />
              </div>

              {/* Label */}
              <span className={`text-[9px] font-bold uppercase tracking-wide transition-all duration-150
                ${active ? "text-violet-400" : "text-slate-600"}`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
