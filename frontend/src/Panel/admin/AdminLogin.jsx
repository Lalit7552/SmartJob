import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, Mail, Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) navigate("/admin-dashboard", { replace: true });
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === "admin@gmail.com" && password === "admin123") {
      localStorage.setItem("adminToken", "admin-login-success");
      navigate("/admin-dashboard", { replace: true });
    } else {
      alert("Invalid Admin Credentials");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "#0a0a12", fontFamily: "'Sora', sans-serif" }}
    >

      {/* ── Ambient glows ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px]
                      bg-violet-700/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[300px]
                      bg-purple-900/20 rounded-full blur-[100px] pointer-events-none" />

      {/* ── Subtle grid pattern ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="w-full max-w-sm relative z-10">

        {/* ── Logo ── */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30
                          flex items-center justify-center text-violet-400 mb-5
                          shadow-[0_0_40px_rgba(124,107,255,0.25)]">
            <ShieldCheck size={30} strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Admin{" "}
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              Portal
            </span>
          </h1>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-[2px] mt-2">
            Management &amp; Control Center
          </p>
        </div>

        {/* ── Form Card ── */}
        <form
          onSubmit={handleLogin}
          className="bg-[#13131f] border border-white/5 rounded-2xl p-7 space-y-5
                     shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
        >

          {/* Email */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[2px] text-slate-500 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
              />
              <input
                type="email"
                placeholder="admin@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#0e0e1a] border border-white/8 text-slate-200 placeholder-slate-600
                           text-sm py-3.5 pl-11 pr-4 rounded-xl
                           focus:outline-none focus:border-violet-500/60 focus:bg-[#0e0e1a]
                           transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[2px] text-slate-500 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#0e0e1a] border border-white/8 text-slate-200 placeholder-slate-600
                           text-sm py-3.5 pl-11 pr-12 rounded-xl
                           focus:outline-none focus:border-violet-500/60
                           transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500
                           hover:text-violet-400 transition"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full mt-2 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-[2px]
                       text-white bg-violet-600 hover:bg-violet-500
                       shadow-[0_8px_32px_rgba(124,107,255,0.35)]
                       active:scale-[0.98] transition-all duration-150"
          >
            Sign In to System
          </button>
        </form>

        {/* ── Footer note ── */}
        <p className="text-center mt-6 text-[10px] font-semibold text-slate-600 uppercase tracking-[1.5px]">
          Authorized access only · All activities are logged
        </p>

      </div>
    </div>
  );
}