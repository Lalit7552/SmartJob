import { Menu } from "lucide-react";
import { useEmployeeLayout } from "./EmployeeLayoutContext";

export default function EmployeeSettings() {
  const { openSidebar } = useEmployeeLayout();

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="bg-[#0a0f0d] p-6 pt-10 relative">
        <button onClick={openSidebar} className="lg:hidden absolute top-6 right-6 text-blue-500">
          <Menu size={28} />
        </button>
        <h1 className="text-2xl font-black">Settings</h1>
        <p className="text-slate-400 text-xs font-bold mt-2">Coming soon.</p>
      </div>
    </div>
  );
}

