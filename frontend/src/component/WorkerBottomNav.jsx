import { Home, Briefcase, MessageSquare, History, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function WorkerBottomNav({ hidden }) {
  if (hidden) return null;
  const location = useLocation();

  const menu = [
    { name: "Home",    icon: Home,          path: "/worker-dashboard" },
    { name: "Jobs",    icon: Briefcase,     path: "/worker/jobs" },
    { name: "Chats",   icon: MessageSquare, path: "/worker/chats" },
    { name: "Profile", icon: User,          path: "/worker/profile" },
  ];

  return (
    <div
      className="fixed bottom-0 left-0 w-full lg:hidden z-[100]"
      style={{
        background: "rgba(13,13,26,0.97)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 -6px 30px -4px rgba(0,0,0,0.60)",
        paddingBottom: "env(safe-area-inset-bottom, 8px)",
        fontFamily: "'Sora', sans-serif",
      }}
    >
      <div className="grid grid-cols-4 h-16">
        {menu.map((item) => {
          const Icon     = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center active:scale-90 transition-transform duration-150"
            >
              {/* Top active bar */}
              {isActive && (
                <div
                  className="absolute top-0 w-8 h-[3px] rounded-b-full"
                  style={{
                    background: "#60a5fa",
                    boxShadow: "0 2px 10px rgba(96,165,250,0.50)",
                  }}
                />
              )}

              {/* Icon */}
              <div
                className="p-1.5 rounded-xl transition-colors duration-200"
                style={{ color: isActive ? "#60a5fa" : "#475569" }}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  style={isActive ? { filter: "drop-shadow(0 0 6px rgba(96,165,250,0.40))" } : {}}
                />
              </div>

              {/* Label */}
              <span
                className="text-[9px] font-bold uppercase mt-0.5"
                style={{
                  letterSpacing: "0.1em",
                  color: isActive ? "#93c5fd" : "#475569",
                }}
              >
                {item.name}
              </span>

              {/* Chats notification dot */}
              {item.name === "Chats" && !isActive && (
                <span
                  className="absolute top-3 right-5 w-1.5 h-1.5 rounded-full"
                  style={{
                    background: "#f87171",
                    border: "2px solid #0d0d1a",
                  }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
