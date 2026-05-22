import { useMemo, useRef, useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import EmployeeSidebar from "../../component/EmployeeSiderbar";
import EmployeeBottomNav from "../../component/EmployeeBottomNav";
import { EmployeeLayoutContext } from "./EmployeeLayoutContext";

export default function EmployeeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [pathname]);

  const contextValue = useMemo(
    () => ({
      sidebarOpen,
      setSidebarOpen,
      openSidebar: () => setSidebarOpen(true),
      closeSidebar: () => setSidebarOpen(false),
      toggleSidebar: () => setSidebarOpen((prev) => !prev),
    }),
    [sidebarOpen]
  );

  return (
    <EmployeeLayoutContext.Provider value={contextValue}>
      <div
        className="flex h-screen bg-white text-white font-sans overflow-hidden"
        style={{
          "--employee-topbar-h": "3.5rem",
          "--employee-bottombar-h": "calc(4.5rem + env(safe-area-inset-bottom))",
        }}
      >

        {/* SIDEBAR */}
        <EmployeeSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* MAIN AREA */}
        <div className="flex-1 flex flex-col h-full">

          {/* PAGE CONTENT (SCROLL ONLY HERE) */}
          <div ref={contentRef} className="flex-1 overflow-y-auto pt-[var(--employee-topbar-h)] pb-[var(--employee-bottombar-h)] lg:pt-0 lg:pb-0">
            <Outlet />
          </div>

          {/* BOTTOM NAV (FIXED HEIGHT, NO EXTRA SPACE) */}
          <div className="shrink-0">
            <EmployeeBottomNav hidden={sidebarOpen} />
          </div>

        </div>

      </div>
    </EmployeeLayoutContext.Provider>
  );
}
