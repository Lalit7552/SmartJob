import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase, Users, MessageCircle, Plus, MapPin, Star, Zap, ChevronRight,
} from "lucide-react";
import { Country, State } from "country-state-city";
import {
  createEmployerJob,
  fetchApprovedWorkers,
  fetchEmployerJobs,
} from "../../api/employerApi";

export default function EmployerDashboard() {
  const navigate = useNavigate();
  const [approvedWorkers, setApprovedWorkers]   = useState([]);
  const [loadingWorkers, setLoadingWorkers]     = useState(true);
  const [workerError, setWorkerError]           = useState("");
  const [ratingsSummary, setRatingsSummary]     = useState({ avgRating: 0, totalRatings: 0 });
  const [jobs, setJobs]                         = useState([]);
  const [loadingJobs, setLoadingJobs]           = useState(true);

  const activeJobsCount = jobs.filter((j) => j.status === "Active").length;

  useEffect(() => {
    const loadWorkers = async () => {
      try {
        setLoadingWorkers(true);
        setWorkerError("");
        const res = await fetchApprovedWorkers();
        const workers = res?.data?.workers || [];
        setApprovedWorkers(workers);
        setRatingsSummary(res?.data?.ratingsSummary || { avgRating: 0, totalRatings: 0 });
      } catch (err) {
        console.error("Worker Load Error", err);
        setApprovedWorkers([]);
        setWorkerError(err?.message || "Failed to load workers");
      } finally {
        setLoadingWorkers(false);
      }
    };
    loadWorkers();
  }, []);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoadingJobs(true);
        const res = await fetchEmployerJobs();
        setJobs(res?.data?.jobs || []);
      } catch (err) {
        console.error("Jobs Load Error", err);
        setJobs([]);
      } finally {
        setLoadingJobs(false);
      }
    };
    loadJobs();
  }, []);

  const handleQuickPost = async () => {
    try {
      await createEmployerJob({
        title: "Urgent Requirement",
        category: "Electrician",
        type: "Daily Wage",
        country: "IN",
        state: "RJ",
        city: "Jaipur",
        address: "Area not specified",
        minSalary: "600",
        maxSalary: "800",
        contactName: "Employer",
        phone: "Not available",
        applicants: 0,
        status: "Active",
      });
      navigate("/employee/myjobs");
    } catch (err) {
      console.error("Quick Post Error", err);
    }
  };

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: "white", fontFamily: "'Sora', sans-serif", color: "white" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position:-500px 0; }
          100% { background-position:500px 0; }
        }
        .fade-up { animation: fadeUp .38s ease both; }
        .fade-up:nth-child(1){animation-delay:.04s}
        .fade-up:nth-child(2){animation-delay:.10s}
        .fade-up:nth-child(3){animation-delay:.16s}
        .fade-up:nth-child(4){animation-delay:.22s}
        .fade-up:nth-child(5){animation-delay:.28s}
        .fade-up:nth-child(6){animation-delay:.34s}

        .shimmer-skel {
          background: linear-gradient(90deg,#1e293b 25%,#273549 50%,#1e293b 75%);
          background-size:500px 100%;
          animation: shimmer 1.4s infinite linear;
        }
        .worker-card {
          transition: border-color .18s, box-shadow .18s, transform .18s;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .worker-card:hover {
          border-color: rgba(96,165,250,0.28);
          box-shadow: 0 6px 28px -6px rgba(37,99,235,0.22);
          transform: translateY(-2px);
        }
      `}</style>

      {/* ── HERO HEADER ── */}
      <div
        className="relative overflow-hidden"
        style={{ background: "#0d0d1a" }}
      >
        {/* Glow blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[180px] rounded-full pointer-events-none opacity-20"
          style={{ background: "radial-gradient(ellipse,#2563eb,transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full pointer-events-none opacity-10"
          style={{ background: "radial-gradient(circle,#10b981,transparent 70%)", filter: "blur(50px)" }} />

        <div className="relative max-w-4xl mx-auto px-6 pt-10 pb-28">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(37,99,235,0.20)", border: "1px solid rgba(96,165,250,0.30)" }}
            >
              <Zap size={12} style={{ color: "#60a5fa" }} fill="#60a5fa" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold" style={{ color: "#60a5fa" }}>
              Welcome back
            </span>
          </div>

          <h1 className="text-[26px] font-extrabold text-white tracking-tight leading-tight">
            Employer Dashboard
          </h1>
          <p className="text-sm mt-1 leading-relaxed" style={{ color: "#64748b" }}>
            Review and contact your approved talent pool
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={() => navigate("/employer/post-job")}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all active:scale-95"
              style={{
                background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
                boxShadow: "0 4px 24px rgba(37,99,235,0.35)",
                color: "white",
              }}
            >
              <Plus size={17} strokeWidth={2.5} />
              Post Requirement
            </button>
            <button
              onClick={() => navigate("/employer/one-day")}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all active:scale-95"
              style={{
                background: "linear-gradient(135deg,#059669,#047857)",
                boxShadow: "0 4px 24px rgba(16,185,129,0.28)",
                color: "white",
              }}
            >
              <Plus size={17} strokeWidth={2.5} />
              One Day Job
            </button>
          </div>
        </div>
      </div>

      {/* ── STATS CARD (floats over header) ── */}
      <div className="px-4 sm:px-6 -mt-14 max-w-4xl mx-auto">
        <div
          className="rounded-[1.75rem] overflow-hidden"
          style={{
            background: "#131c2e",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.40)",
          }}
        >
          <div className="grid grid-cols-3" style={{ borderBottom: "none" }}>
            {[
              {
                icon: <Users size={15} style={{ color: "#60a5fa" }} />,
                iconBg: "rgba(37,99,235,0.15)",
                value: loadingWorkers ? "—" : approvedWorkers.length,
                label: "Workers",
                color: "#60a5fa",
              },
              {
                icon: <Briefcase size={15} style={{ color: "#a78bfa" }} />,
                iconBg: "rgba(139,92,246,0.15)",
                value: loadingJobs ? "—" : activeJobsCount,
                label: "Active Jobs",
                color: "#a78bfa",
              },
              {
                icon: <Star size={15} style={{ color: "#fbbf24" }} />,
                iconBg: "rgba(251,191,36,0.15)",
                value: loadingWorkers ? "—" : ratingsSummary.avgRating || "0.0",
                label: "Avg Rating",
                color: "#fbbf24",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="flex flex-col items-center py-5 px-3 gap-2"
                style={{ borderRight: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: s.iconBg }}>
                  {s.icon}
                </div>
                <p className="font-extrabold text-lg leading-none" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[9px] uppercase font-bold tracking-widest" style={{ color: "#475569" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── WORKERS SECTION ── */}
      <div className="mt-8 px-4 sm:px-6 max-w-4xl mx-auto">

        {/* Section header */}
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-[17px] font-extrabold text-white tracking-tight">
              Approved Talent
            </h2>
            <p className="text-[11px] mt-0.5" style={{ color: "#475569" }}>
              {approvedWorkers.length} professionals available
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {loadingWorkers ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="rounded-3xl p-5 shimmer-skel" style={{ height: 80 }} />
            ))
          ) : workerError ? (
            <div
              className="p-10 rounded-3xl text-center"
              style={{ border: "1px dashed rgba(239,68,68,0.30)", background: "rgba(239,68,68,0.05)" }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: "rgba(239,68,68,0.12)" }}>
                <Users size={20} style={{ color: "#f87171" }} />
              </div>
              <p className="font-bold text-sm" style={{ color: "#94a3b8" }}>Unable to load workers</p>
              <p className="text-xs mt-1" style={{ color: "#475569" }}>{workerError}</p>
            </div>
          ) : approvedWorkers.length === 0 ? (
            <div
              className="p-10 rounded-3xl text-center"
              style={{ border: "1px dashed rgba(255,255,255,0.07)", background: "rgba(37,99,235,0.04)" }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: "rgba(37,99,235,0.12)" }}>
                <Users size={20} style={{ color: "#60a5fa" }} />
              </div>
              <p className="font-bold text-sm" style={{ color: "#94a3b8" }}>No approved workers yet</p>
              <p className="text-xs mt-1" style={{ color: "#475569" }}>Post a job to start receiving applications</p>
            </div>
          ) : (
            approvedWorkers.map((worker, index) => (
              <WorkerRow key={worker.id || index} worker={worker} index={index} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ── WORKER CARD ── */
function WorkerRow({ worker, index }) {
  const navigate = useNavigate();
  const profile  = worker?.profile || {};

  const baseURL      = "http://localhost:5000";
  const profilePhoto = profile?.profilePhoto ? `${baseURL}${profile.profilePhoto}` : "";

  const countryData = profile?.country ? Country.getCountryByCode(profile.country) : null;
  const stateData   = profile?.state && profile?.country
    ? State.getStateByCodeAndCountry(profile.state, profile.country) : null;

  const location = [profile?.city, stateData?.name, countryData?.name].filter(Boolean).join(", ");

  const avatarGradient = `linear-gradient(135deg,hsl(${(index * 67 + 200) % 360},60%,42%),hsl(${(index * 67 + 230) % 360},55%,35%))`;

  return (
    <div
      onClick={() => navigate(`/employee/workerdetail?workerId=${worker.id}`)}
      className="worker-card fade-up rounded-3xl p-4 cursor-pointer"
      style={{ background: "#0d0d1a" }}
    >
      <div className="flex items-center justify-between gap-3">

        {/* Avatar + Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div
              className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center"
              style={{
                background: profilePhoto ? "#1e293b" : avatarGradient,
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt={profile?.fullName}
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : (
                <span className="text-white font-extrabold text-base">
                  {profile?.fullName?.charAt(0) || "W"}
                </span>
              )}
            </div>
            {/* Online dot */}
            <span
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full"
              style={{ background: "#34d399", border: "2px solid #0d0d1a" }}
            />
          </div>

          <div className="min-w-0">
            <h3 className="font-bold text-white text-[14px] leading-tight truncate">
              {profile?.fullName || "Unnamed Professional"}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1 mt-1">
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg"
                style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.18)" }}
              >
                <Star size={9} style={{ color: "#fbbf24", fill: "#fbbf24" }} />
                <span className="text-[10px] font-bold" style={{ color: "#fbbf24" }}>
                  {worker?.avgRating || "0.0"}
                </span>
                <span className="text-[10px]" style={{ color: "#92400e" }}>
                  · {worker?.totalRatings || 0}
                </span>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1 mt-1">
              <MapPin size={10} style={{ color: "#60a5fa" }} className="shrink-0" />
              <span className="text-[11px] truncate" style={{ color: "#475569" }}>
                {location || "Location not specified"}
              </span>
            </div>
          </div>
        </div>

        {/* Chat button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/employee/chat/${worker.id}`);
          }}
          className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-95"
          style={{
            background: "rgba(37,99,235,0.15)",
            border: "1px solid rgba(96,165,250,0.20)",
            color: "#60a5fa",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "#2563eb";
            e.currentTarget.style.color      = "white";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(37,99,235,0.15)";
            e.currentTarget.style.color      = "#60a5fa";
          }}
        >
          <MessageCircle size={16} />
        </button>
      </div>
    </div>
  );
}

/* ── STAT ITEM (kept for compatibility, not used directly) ── */
function StatItem({ icon, value, label, accent }) {
  return (
    <div className="flex flex-col items-center py-5 px-3 gap-2">
      {icon}
      <p className={`font-extrabold text-lg leading-none ${accent}`}>{value}</p>
      <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">{label}</p>
    </div>
  );
}
