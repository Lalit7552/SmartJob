import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar, Clock, MapPin, Wallet, User, Phone,
  Home, ArrowLeft, ShieldCheck, Zap, Sun, CheckCircle2, ChevronRight
} from "lucide-react";
import { fetchWorkerJobs } from "../../api/workerApi";
import { State } from "country-state-city";

export default function OneDayJobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);

  useEffect(() => {
    const loadJob = async () => {
      const res = await fetchWorkerJobs();
      const jobs = res?.data?.jobs || [];
      const found = jobs.find((j) => String(j._id || j.id) === String(id));
      setJob(found);
    };
    loadJob();
  }, [id]);

  if (!job) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen gap-4"
        style={{ background: "linear-gradient(135deg,#f0f4ff,#f8fafc,#eff6ff)", fontFamily: "'DM Sans', sans-serif" }}
      >
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700;900&display=swap'); @keyframes spin{to{transform:rotate(360deg)}} .spin{animation:spin .9s linear infinite;}`}</style>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center spin shadow" style={{ background: "linear-gradient(135deg,#f59e0b,#fcd34d)" }}>
          <Sun size={22} className="text-white" fill="white" />
        </div>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading job details…</p>
      </div>
    );
  }

  const location = buildLocation(job);

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: "linear-gradient(135deg,#f0f4ff 0%,#f8fafc 55%,#eff6ff 100%)", fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=DM+Serif+Display&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp .4s ease both; }
        .d1{animation-delay:.05s} .d2{animation-delay:.12s} .d3{animation-delay:.19s} .d4{animation-delay:.26s}
        @keyframes pulseRing {
          0%{box-shadow:0 0 0 0 rgba(245,158,11,0.35)} 70%{box-shadow:0 0 0 10px rgba(245,158,11,0)} 100%{box-shadow:0 0 0 0 rgba(245,158,11,0)}
        }
        .pulse-amber { animation: pulseRing 1.9s infinite; }
      `}</style>

      {/* ── NAVBAR ── */}
      <header
        className="sticky top-0 z-50 border-b border-slate-200/70 px-6 py-3 flex items-center justify-between"
        style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "saturate(180%) blur(18px)", WebkitBackdropFilter: "saturate(180%) blur(18px)" }}
      >
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-slate-600 hover:text-amber-600 font-bold text-sm transition-colors"
        >
          <span className="p-2 rounded-xl border border-slate-200 bg-white group-hover:border-amber-200 group-hover:bg-amber-50 transition-all">
            <ArrowLeft size={16} />
          </span>
          Back
        </button>

        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow" style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)" }}>
            <Zap size={14} className="text-white" fill="white" />
          </div>
          <span className="text-sm font-black tracking-[-0.04em]">
            <span className="text-blue-600">WORKER</span><span className="text-slate-800">PRO</span>
          </span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── LEFT / MAIN ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Hero card */}
            <div
              className="fade-up d1 rounded-3xl overflow-hidden relative"
              style={{ background: "linear-gradient(120deg,#f59e0b 0%,#fbbf24 55%,#fcd34d 100%)", boxShadow: "0 12px 40px -8px rgba(245,158,11,0.30)" }}
            >
              <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle,#fff7ed,transparent 70%)" }} />
              <div className="relative z-10 p-7 md:p-9">
                <div className="flex flex-wrap gap-2 mb-5">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider" style={{ background: "rgba(255,255,255,0.25)", color: "#78350f" }}>
                    {job.category || "General"}
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1" style={{ background: "rgba(34,197,94,0.22)", color: "#14532d" }}>
                    <ShieldCheck size={11} /> Verified
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1" style={{ background: "rgba(255,255,255,0.20)", color: "#78350f" }}>
                    <Sun size={10} /> One Day
                  </span>
                </div>

                <h1
                  className="text-2xl md:text-3xl font-black text-amber-900 leading-tight mb-4 uppercase tracking-tight"
                  style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400 }}
                >
                  {job.title}
                </h1>

                {/* Meta pills */}
                <div className="flex flex-wrap gap-2">
                  {job.date && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold" style={{ background: "rgba(255,255,255,0.30)", color: "#78350f" }}>
                      <Calendar size={11} /> {job.date}
                    </span>
                  )}
                  {(job.startTime || job.endTime) && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold" style={{ background: "rgba(255,255,255,0.30)", color: "#78350f" }}>
                      <Clock size={11} /> {[job.startTime, job.endTime].filter(Boolean).join(" – ")}
                    </span>
                  )}
                  {location && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold" style={{ background: "rgba(255,255,255,0.30)", color: "#78350f" }}>
                      <MapPin size={11} /> {location}
                    </span>
                  )}
                  {job.payment && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold" style={{ background: "rgba(255,255,255,0.30)", color: "#78350f" }}>
                      <Wallet size={11} /> {job.payment}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div
              className="fade-up d2 bg-white rounded-3xl border border-slate-100 p-7"
              style={{ boxShadow: "0 4px 24px -6px rgba(30,58,138,0.07)" }}
            >
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight mb-3">Job Description</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {job.description || "No description provided for this role."}
              </p>

              {/* Verified ribbon */}
              <div className="mt-5 flex items-center gap-3 p-4 rounded-2xl" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                <ShieldCheck size={20} className="text-emerald-500 shrink-0" />
                <div>
                  <p className="text-sm font-extrabold text-emerald-900">Verified Listing</p>
                  <p className="text-xs text-emerald-600 font-medium">This employer has a high response rate.</p>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div
              className="fade-up d3 bg-white rounded-3xl border border-slate-100 p-7"
              style={{ boxShadow: "0 4px 24px -6px rgba(30,58,138,0.07)" }}
            >
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight mb-5">Contact & Location</h3>
              <div className="space-y-4">
                <InfoRow icon={<Home size={18} className="text-rose-500" />} iconBg="#fff1f2" label="Address" value={job.address} />
                <InfoRow icon={<User size={18} className="text-blue-500" />} iconBg="#eff6ff" label="Contact Name" value={job.contactName} />
                <InfoRow icon={<Phone size={18} className="text-emerald-500" />} iconBg="#f0fdf4" label="Phone Number" value={job.phone} />
              </div>
            </div>
          </div>

          {/* ── SIDEBAR ── */}
          <div className="space-y-4">
            <div
              className="fade-up d2 bg-white rounded-3xl border border-slate-100 p-6 sticky top-24"
              style={{ boxShadow: "0 4px 24px -6px rgba(30,58,138,0.07)" }}
            >
              {/* Payment */}
              <div className="mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Payment</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">{job.payment}</span>
                  <span className="text-slate-400 font-bold text-xs">/ job</span>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 border-t border-slate-100 pt-5 mb-6">
                {job.date && <SidebarItem icon={<Calendar size={15} className="text-blue-400" />} label="Date" value={job.date} />}
                {(job.startTime || job.endTime) && (
                  <SidebarItem icon={<Clock size={15} className="text-emerald-400" />} label="Timing" value={[job.startTime, job.endTime].filter(Boolean).join(" – ") || "Not set"} />
                )}
                {location && <SidebarItem icon={<MapPin size={15} className="text-rose-400" />} label="Location" value={location} />}
              </div>

              {/* Apply CTA */}
              <button
                className="pulse-amber w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wide text-amber-900 transition-all active:scale-95"
                style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)", boxShadow: "0 8px 24px -4px rgba(245,158,11,0.35)" }}
              >
                Apply for this Job <ChevronRight size={15} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, iconBg, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center" style={{ background: iconBg }}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <p className="text-sm font-bold text-slate-700 mt-0.5">{value || "Not provided"}</p>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5">
      {icon}
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">{label}</p>
        <p className="text-xs font-bold text-slate-700">{value}</p>
      </div>
    </div>
  );
}

function buildLocation(job) {
  if (!job || (!job.city && !job.state)) return "";
  const stateName = job.state ? State.getStateByCodeAndCountry(job.state, job.country || "IN")?.name : "";
  return [job.city, stateName].filter(Boolean).join(", ");
}