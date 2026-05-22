import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ROLES = [
  {
    id: "worker",
    label: "Professional Worker",
    tagline: "BUILD YOUR LEGACY",
    desc: "Access high-ticket local opportunities and manage your professional profile.",
    emoji: "👷‍♂️",
    activeColor: "border-[#00ff9d] shadow-[0_0_40px_-10px_rgba(0,255,157,0.4)]",
    iconBg: "bg-[#00ff9d] text-[#004D36]",
    taglineColor: "text-[#00ff9d]"
  },
  {
    id: "employer",
    label: "Premium Employer",
    tagline: "HIRE EXCELLENCE",
    desc: "Connect with top-tier, background-verified workers for your home or business.",
    emoji: "🏢",
    activeColor: "border-blue-400 shadow-[0_0_40px_-10px_rgba(96,165,250,0.4)]",
    iconBg: "bg-blue-500 text-white",
    taglineColor: "text-blue-400"
  },
];

export default function RoleSelect() {
  // Default selection set to 'worker' taaki page khali na lage
  const [selected, setSelected] = useState("worker"); 
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#004D36] flex flex-col font-sans selection:bg-[#00ff9d]/30">
      
      {/* --- Header --- */}
      <div className="flex items-center justify-between px-8 py-6">
        <button
          onClick={() => navigate("/")}
          className="text-white/40 hover:text-white text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2"
        >
          <span className="text-lg">←</span> Back
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-white flex items-center justify-center shadow-xl">
            <span className="text-[#004D36] text-xs font-black italic">KW</span>
          </div>
          <span className="font-black text-xl tracking-tighter text-white uppercase">
            Kaam<span className="text-white/40 italic font-medium">Wala</span>
          </span>
        </div>
        <div className="w-16"></div>
      </div>

      {/* --- Title --- */}
      <div className="text-center px-6 pt-10 pb-8">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase">
          Identity <span className="italic text-white/50">Verified</span>
        </h1>
        <p className="text-white/50 text-xs mt-3 font-bold tracking-[0.2em] uppercase">
          Select your professional path
        </p>
      </div>

      {/* --- Role Cards --- */}
      <div className="flex-1 px-6 md:px-10 max-w-2xl mx-auto w-full space-y-6 pb-24">
        {ROLES.map((role) => {
          const isSel = selected === role.id;

          return (
            <div
              key={role.id}
              onClick={() => setSelected(role.id)}
              className={`relative cursor-pointer rounded-[2.5rem] p-8 transition-all duration-500 border-2 
              ${isSel 
                ? `${role.activeColor} bg-black/40 translate-y-[-6px]` 
                : "border-white/10 bg-black/20 opacity-60 hover:opacity-100 hover:border-white/20"}
              `}
            >
              {/* Dynamic Glow Orb */}
              {isSel && (
                <div className={`absolute top-0 right-0 w-48 h-48 blur-[100px] rounded-full -mr-20 -mt-20 opacity-30 
                  ${role.id === 'worker' ? "bg-[#00ff9d]" : "bg-blue-400"}`} 
                />
              )}

              <div className="flex items-center gap-8 relative z-10">
                {/* Icon Container */}
                <div
                  className={`w-20 h-20 rounded-[1.8rem] flex items-center justify-center text-4xl transition-all duration-500 shadow-2xl
                  ${!isSel ? "bg-white/5 grayscale" : `${role.iconBg} scale-110 shadow-lg`}
                  `}
                >
                  {role.emoji}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className={`text-2xl font-black uppercase tracking-tight transition-colors ${isSel ? "text-white" : "text-white/30"}`}>
                      {role.label}
                    </h3>
                    {isSel && (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center animate-bounce ${role.id === 'worker' ? "bg-[#00ff9d]" : "bg-blue-400"}`}>
                        <span className="text-black text-[10px] font-black">✓</span>
                      </div>
                    )}
                  </div>

                  <p className={`text-[10px] font-black tracking-[0.25em] mb-3 transition-colors ${isSel ? role.taglineColor : "text-white/20"}`}>
                    {role.tagline}
                  </p>

                  <p className={`text-sm leading-relaxed font-medium transition-colors ${isSel ? "text-white/70" : "text-white/20"}`}>
                    {role.desc}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- Action Bar --- */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-3xl border-t border-white/5 p-8 z-50">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => {
              if (selected === "worker") navigate("/worker-signup");
              if (selected === "employer") navigate("/employer-signup");
            }}
            className={`w-full py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.4em] transition-all duration-500 shadow-2xl
            ${selected === "worker" 
                ? "bg-[#00ff9d] text-[#004D36] hover:shadow-[#00ff9d]/30" 
                : "bg-blue-500 text-white hover:shadow-blue-500/30"} 
            active:scale-[0.97] hover:-translate-y-1
            `}
          >
            Access Dashboard →
          </button>
        </div>
      </div>
    </div>
  );
}
