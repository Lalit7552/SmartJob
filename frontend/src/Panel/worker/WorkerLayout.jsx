import { useMemo, useRef, useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import WorkerSidebar from "../../component/WorkerSidebar";
import WorkerBottomNav from "../../component/WorkerBottomNav";
import { WorkerLayoutContext } from "./WorkerLayoutContext";

export default function WorkerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);
  const { pathname } = useLocation();

  const contextValue = useMemo(
    () => ({
      sidebarOpen,
      setSidebarOpen,
      openSidebar:   () => setSidebarOpen(true),
      closeSidebar:  () => setSidebarOpen(false),
      toggleSidebar: () => setSidebarOpen((prev) => !prev),
    }),
    [sidebarOpen]
  );

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [pathname]);

  return (
    <WorkerLayoutContext.Provider value={contextValue}>
      <div
        className="flex h-screen overflow-hidden"
        style={{
          background: "#0a0f0d",
          color: "white",
          fontFamily: "'Sora', sans-serif",
          "--worker-topbar-h": "calc(3.5rem + env(safe-area-inset-top))",
          "--worker-bottombar-h": "calc(4rem + env(safe-area-inset-bottom))",
        }}
      >
        {/* Desktop sidebar — always visible on lg+ */}
        <div className="hidden lg:flex h-full shrink-0">
          <WorkerSidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </div>

        {/* Mobile sidebar drawer + top navbar */}
        <div className="lg:hidden">
          <WorkerSidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </div>

        {/* Page content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
          {/*
            pt-14 on mobile = clears the fixed top navbar (h-14)
            no padding on lg desktop
          */}
          <div ref={contentRef} className="flex-1 overflow-y-auto pt-[var(--worker-topbar-h)] pb-[var(--worker-bottombar-h)] lg:pt-0 lg:pb-0">
            <Outlet />
          </div>
        </div>
      </div>

      <WorkerBottomNav hidden={sidebarOpen} />
    </WorkerLayoutContext.Provider>
  );
}
