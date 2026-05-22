import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  IndianRupee,
  Briefcase,
  Phone,
  User,
  Home,
  ArrowLeft,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Zap,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { fetchWorkerJobs, applyToJob } from "../../api/workerApi";

export default function WorkerJobCard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const loadJob = async () => {
      try {
        const res = await fetchWorkerJobs();
        const jobs = res?.data?.jobs || [];
        const found = jobs.find((j) => String(j._id || j.id) === String(id));
        setJob(found);
        setApplied(Boolean(found?.applied));
      } catch (err) {
        console.error(err);
      }
    };
    loadJob();
  }, [id]);

  const handleApply = async () => {
    if (!job || applying) return;
    try {
      setApplying(true);
      const res = await applyToJob(job._id || job.id);
      setApplied(true);
    } catch (err) {
      console.error("Apply failed", err);
    } finally {
      setApplying(false);
    }
  };

  /* ── LOADING ── */
  if (!job) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: "linear-gradient(135deg,#f0f4ff 0%,#f8fafc 60%,#eff6ff 100%)" }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=DM+Serif+Display&display=swap');
          @keyframes spin { to { transform: rotate(360deg); } }
          .spin { animation: spin 0.9s linear infinite; }
        `}</style>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center spin"
            style={{ background: "linear-gradient(135deg,#2563eb,#60a5fa)" }}
          >
            <Zap size={22} className="text-white" fill="white" />
          </div>
          <p
            className="text-slate-400 font-bold text-xs uppercase tracking-widest"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Loading Job Details…
          </p>
        </div>
      </div>
    );
  }

  const initials = (job.title || "J").charAt(0).toUpperCase();

  return (
    <div
      className="min-h-screen pb-24"
      style={{
        background: "linear-gradient(135deg,#f0f4ff 0%,#f8fafc 60%,#eff6ff 100%)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=DM+Serif+Display&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseRing {
          0%   { box-shadow: 0 0 0 0 rgba(37,99,235,0.38); }
          70%  { box-shadow: 0 0 0 12px rgba(37,99,235,0); }
          100% { box-shadow: 0 0 0 0 rgba(37,99,235,0); }
        }
        .fade-up   { animation: fadeUp 0.45s ease both; }
        .d1 { animation-delay: 0.06s; }
        .d2 { animation-delay: 0.14s; }
        .d3 { animation-delay: 0.22s; }
        .d4 { animation-delay: 0.30s; }
        .pulse-apply { animation: pulseRing 1.9s infinite; }
      `}</style>

      {/* ── STICKY NAVBAR ── */}
      <header
        className="sticky top-0 z-50 border-b border-slate-200/70 px-6 py-3"
        style={{
          background: "rgba(255,255,255,0.80)",
          backdropFilter: "saturate(180%) blur(18px)",
          WebkitBackdropFilter: "saturate(180%) blur(18px)",
        }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold text-sm transition-colors"
          >
            <span className="p-2 rounded-xl border border-slate-200 bg-white group-hover:border-blue-200 group-hover:bg-blue-50 transition-all">
              <ArrowLeft size={16} />
            </span>
            Back
          </button>

          {/* Logo */}
          <div className="flex items-center gap-1.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)" }}
            >
              <Zap size={14} className="text-white" fill="white" />
            </div>
            <span className="text-sm font-black tracking-[-0.04em]">
              <span className="text-blue-600">WORKER</span>
              <span className="text-slate-800">PRO</span>
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-6 space-y-5">

        {/* ── HERO CARD ── */}
        <div
          className="fade-up d1 rounded-3xl overflow-hidden relative"
          style={{
            background: "linear-gradient(120deg,#1e40af 0%,#2563eb 55%,#3b82f6 100%)",
            boxShadow: "0 20px 60px -12px rgba(37,99,235,0.38)",
          }}
        >
          {/* Decorative blobs */}
          <div
            className="absolute -top-10 -right-10 w-52 h-52 rounded-full opacity-20 pointer-events-none"
            style={{ background: "radial-gradient(circle,#93c5fd,transparent 70%)" }}
          />
          <div
            className="absolute bottom-0 left-1/4 w-36 h-36 rounded-full opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle,#bfdbfe,transparent 70%)" }}
          />

          <div className="relative z-10 p-8 md:p-10">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-5">
              <span
                className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                style={{ background: "rgba(255,255,255,0.18)", color: "#bfdbfe" }}
              >
                {job.type || "Full Time"}
              </span>
              <span
                className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1"
                style={{ background: "rgba(34,197,94,0.22)", color: "#86efac" }}
              >
                <ShieldCheck size={11} /> Verified
              </span>
            </div>

            {/* Title + Avatar Row */}
            <div className="flex items-start gap-4 mb-6">
              <div
                className="w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center text-xl font-black text-white shadow-xl"
                style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(6px)" }}
              >
                {initials}
              </div>
              <div>
                <h1
                  className="text-2xl md:text-3xl font-black text-white leading-tight mb-1 uppercase tracking-tight"
                  style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400 }}
                >
                  {job.title}
                </h1>
                <p className="text-blue-200 text-sm font-semibold">
                  {job.contactName || "Direct Hire"} &nbsp;·&nbsp; {job.city}
                </p>
              </div>
            </div>

            {/* Stat Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  icon: <IndianRupee size={15} />,
                  label: "Salary",
                  value: `₹${job.minSalary}–₹${job.maxSalary}`,
                  color: "#86efac",
                },
                {
                  icon: <MapPin size={15} />,
                  label: "Location",
                  value: job.city,
                  color: "#fca5a5",
                },
                {
                  icon: <Briefcase size={15} />,
                  label: "Category",
                  value: job.category || "General",
                  color: "#fde68a",
                },
                {
                  icon: <Calendar size={15} />,
                  label: "Posted",
                  value: job.createdAt
                    ? new Date(job.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })
                    : "Today",
                  color: "#c4b5fd",
                },
              ].map(({ icon, label, value, color }) => (
                <div
                  key={label}
                  className="rounded-2xl px-4 py-3"
                  style={{ background: "rgba(255,255,255,0.10)", backdropFilter: "blur(6px)" }}
                >
                  <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color }}>
                    {icon} {label}
                  </p>
                  <p className="text-white font-black text-sm truncate">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── DETAILS CARD ── */}
        <div
          className="fade-up d2 bg-white rounded-3xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: "0 4px 24px -6px rgba(30,58,138,0.08)" }}
        >

          {/* Work Address */}
          <div className="p-7 flex gap-5 border-b border-slate-100">
            <div
              className="shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#fff1f2,#ffe4e6)" }}
            >
              <Home size={20} className="text-rose-500" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 mb-1 uppercase tracking-tight">
                Work Address
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {job.address || "The employer has not provided a specific street address yet."}
              </p>
            </div>
          </div>

          {/* Employer Details */}
          <div className="p-7 flex gap-5">
            <div
              className="shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#eff6ff,#dbeafe)" }}
            >
              <User size={20} className="text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-extrabold text-slate-800 mb-3 uppercase tracking-tight">
                Employer Details
              </h3>

              <div
                className="rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
              >
                <div>
                  <p className="text-sm font-extrabold text-slate-900">
                    {job.contactName || "Direct Client"}
                  </p>
                  <p className="text-xs text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                    <Phone size={11} />
                    {job.phone || "Number hidden until applied"}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const employerId =
                      job?.employerId?._id ||
                      job?.employerId?.id ||
                      job?.employer?._id ||
                      job?.employer?.id ||
                      job?.employerId;
                    if (employerId) navigate(`/worker/chat/${employerId}`);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 text-slate-600 transition-all"
                >
                  <MessageCircle size={14} />
                  Chat
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── APPLY CTA CARD ── */}
        <div
          className="fade-up d3 bg-white rounded-3xl border border-slate-100 p-7"
          style={{ boxShadow: "0 4px 24px -6px rgba(30,58,138,0.07)" }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-base font-extrabold text-slate-800">
                Ready to apply?
              </p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Your profile will be shared with the employer instantly.
              </p>
            </div>

            <button
              onClick={handleApply}
              disabled={applying || applied}
              className={`shrink-0 flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 min-w-[200px] ${
                applying
                  ? "bg-slate-300 text-slate-500 cursor-wait"
                  : applied
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100 cursor-default"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100 pulse-apply"
              }`}
            >
              {applied ? (
                <>
                  <CheckCircle2 size={16} />
                  Applied!
                </>
              ) : applying ? (
                "Submitting…"
              ) : (
                <>
                  Apply Now
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>

          {applied && (
            <div
              className="mt-4 rounded-2xl px-4 py-3 flex items-center gap-2 text-xs font-semibold text-emerald-700 fade-up"
              style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
            >
              <CheckCircle2 size={14} className="text-emerald-500" />
              Application submitted! The employer will reach out to you shortly.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
