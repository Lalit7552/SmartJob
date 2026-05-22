import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Briefcase, Wallet, Calendar, ArrowUpRight, AlertTriangle } from "lucide-react";
import { fetchAdminJobs, fetchAdminWallet, fetchEmployers, fetchWorkers, wipeDatabase } from "../../api/adminApi";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [totalWorkers, setTotalWorkers] = useState(0);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalOneDayJobs, setTotalOneDayJobs] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [wiping, setWiping] = useState(false);
  const [wipeError, setWipeError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const loadStats = async () => {
      try {
        setLoadingStats(true);
        const [workersRes, jobsRes, employersRes, walletRes] = await Promise.all([
          fetchWorkers(),
          fetchAdminJobs(),
          fetchEmployers(),
          fetchAdminWallet(),
        ]);
        const workers = workersRes?.data?.workers || [];
        const jobs = jobsRes?.data?.jobs || [];
        const employers = employersRes?.data?.employers || [];
        const walletBalance = walletRes?.data?.balance || 0;
        if (!isMounted) return;
        setTotalWorkers(workers.length);
        setTotalJobs(jobs.length);
        setTotalUsers(employers.length);
        setTotalOneDayJobs(jobs.filter((j) => j.type === "One Day Job").length);
        setTotalEarnings(walletBalance);
      } catch (err) {
        console.error("Admin stats load failed", err);
        if (!isMounted) return;
        setTotalWorkers(0); 
        setTotalJobs(0);
        setTotalUsers(0); 
        setTotalOneDayJobs(0); 
        setTotalEarnings(0);
      } finally {
        if (isMounted) setLoadingStats(false);
      }
    };
    loadStats();
    return () => { isMounted = false; };
  }, []);

  const sv = useMemo(() => (v) => loadingStats ? "..." : v, [loadingStats]);

  const stats = [
    { 
      title: "Total Workers",  
      value: sv(totalWorkers),            
      icon: Users,    
      accent: "from-violet-600 to-indigo-600",  
      ring: "bg-indigo-500/10 text-indigo-300",
      path: "/admin/worker-approvals"
    },
    { 
      title: "Total Jobs",     
      value: sv(totalJobs),               
      icon: Briefcase,
      accent: "from-blue-600 to-cyan-500",      
      ring: "bg-blue-500/10 text-blue-300",
      path: "/admin/jobs"
    },
    { 
      title: "One Day Jobs",   
      value: sv(totalOneDayJobs),         
      icon: Calendar, 
      accent: "from-teal-500 to-emerald-500",   
      ring: "bg-teal-500/10 text-teal-300",
      path: "/admin/one-day-jobs"
    },
    { 
      title: "Total Users",    
      value: sv(totalUsers),              
      icon: Users,    
      accent: "from-purple-600 to-pink-500",    
      ring: "bg-purple-500/10 text-purple-300",
      path: "/admin/user-management"
    },
    { 
      title: "Total Earning",  
      value: loadingStats ? "..." : `₹${totalEarnings}`, 
      icon: Wallet, 
      accent: "from-green-500 to-emerald-400", 
      ring: "bg-green-500/10 text-green-300",
      path: "/admin/wallet"
    },
  ];

  const handleWipe = async () => {
    if (wiping) return;
    const phrase = "DELETE ALL";
    const typed = window.prompt(`Type "${phrase}" to permanently wipe the entire database.`);
    if (!typed) return;
    if (typed.trim() !== phrase) {
      alert("Confirmation phrase does not match.");
      return;
    }
    const ok = window.confirm("This will permanently delete ALL data. This cannot be undone. Continue?");
    if (!ok) return;
    try {
      setWiping(true);
      setWipeError("");
      await wipeDatabase(phrase);
      alert("Database wipe completed.");
    } catch (err) {
      const msg = err?.message || "Database wipe failed.";
      setWipeError(msg);
      alert(msg);
    } finally {
      setWiping(false);
    }
  };

  return (
    <div className="font-['Sora',sans-serif]">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
          System{" "}
          <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            Overview
          </span>
        </h1>
        <p className="text-[11px] font-semibold text-slate-500 tracking-[2px] uppercase mt-1">
          Real-time platform analytics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              onClick={() => navigate(item.path)}
              className="cursor-pointer relative bg-[#13131f] border border-white/5 rounded-2xl p-5 overflow-hidden
                         hover:-translate-y-1 hover:border-violet-500/30 transition-all duration-300 group"
            >
              {/* Top row */}
              <div className="flex justify-between items-start mb-5">
                <div className={`w-11 h-11 rounded-xl ${item.ring} flex items-center justify-center`}>
                  <Icon size={20} strokeWidth={2.2} />
                </div>
                <div className="flex items-center gap-1 bg-emerald-950 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-lg border border-emerald-800/50">
                  LIVE <ArrowUpRight size={9} />
                </div>
              </div>

              {/* Label + Value */}
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[2px] mb-1">
                {item.title}
              </p>
              <h2 className="text-3xl font-extrabold text-white tracking-tighter">
                {item.value}
              </h2>

              {/* Gradient bar bottom */}
              <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${item.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              {/* Decorative bg icon */}
              <div className="absolute -right-3 -bottom-3 opacity-[0.04] group-hover:opacity-[0.07] transition-opacity duration-300">
                <Icon size={88} strokeWidth={1} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Danger Zone */}
      <div className="mt-10 border border-rose-500/20 bg-[#120b0f] rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-300 flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-extrabold text-rose-100 uppercase tracking-widest">
              Danger Zone
            </h3>
            <p className="text-xs text-rose-200/70 mt-1">
              Permanently deletes all users, jobs, enquiries, messages, sessions, wallets, and ratings.
              Requires `ALLOW_ADMIN_DB_WIPE=true` on the server and typing the exact confirmation phrase.
            </p>
            {wipeError && (
              <div className="mt-3 text-[11px] font-bold text-rose-200">
                {wipeError}
              </div>
            )}
          </div>
          <button
            onClick={handleWipe}
            disabled={wiping}
            className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
              wiping
                ? "bg-rose-900/40 text-rose-300/40 cursor-wait"
                : "bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-900/40"
            }`}
          >
            {wiping ? "Wiping..." : "Wipe Database"}
          </button>
        </div>
      </div>
    </div>
  );
}
