import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Briefcase,
  MessageCircle,
  ChevronRight,
  Filter,
  Sparkles,
  CheckCircle2,
  Clock,
  Zap,
} from "lucide-react";
import { applyToJob, fetchWorkerJobs } from "../../api/workerApi";

export default function WorkerDashboard() {
  const navigate = useNavigate();

  const [isAvailable, setIsAvailable] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [applyingJobId, setApplyingJobId] = useState("");
  const [appliedJobIds, setAppliedJobIds] = useState(() => new Set());

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoadingJobs(true);
        const res = await fetchWorkerJobs();
        const fetchedJobs = res?.data?.jobs || [];
        setJobs(fetchedJobs);
        const appliedSet = new Set(
          fetchedJobs
            .filter((job) => job.applied)
            .map((job) => String(job._id || job.id))
        );
        const localApplied = getLocalAppliedIds();
        localApplied.forEach((id) => appliedSet.add(id));
        setAppliedJobIds(appliedSet);
      } catch (err) {
        console.error("Dashboard Jobs Load Error:", err);
        setJobs([]);
        setAppliedJobIds(new Set());
      } finally {
        setLoadingJobs(false);
      }
    };
    loadJobs();
  }, []);

  const today = toDateInputValue(new Date());
  const activeJobs = jobs.filter((job) => {
    if (job.status !== "Active") return false;
    // "Today" means posted today (createdAt), not job date
    const postedDate = normalizeDateValue(job?.createdAt);
    if (!postedDate || postedDate !== today) return false;
    return !appliedJobIds.has(String(job._id || job.id));
  });

  const handleApply = async (jobId) => {
    if (!jobId || applyingJobId) return;
    try {
      setApplyingJobId(String(jobId));
      const res = await applyToJob(jobId);
      const alreadyApplied = res?.data?.alreadyApplied;
      setAppliedJobIds((prev) => {
        const next = new Set(prev);
        next.add(String(jobId));
        return next;
      });
      addLocalAppliedId(String(jobId));
      setJobs((prev) => prev.filter((job) => String(job._id || job.id) !== String(jobId)));
      if (alreadyApplied) console.info("Already applied for this job");
    } catch (err) {
      console.error("Apply failed:", err);
    } finally {
      setApplyingJobId("");
    }
  };

  return (
    <div
      className="min-h-screen text-slate-900 font-sans"
      style={{
        background: "linear-gradient(135deg, #f0f4ff 0%, #f8fafc 50%, #eff6ff 100%)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=DM+Serif+Display&display=swap');

        @keyframes shimmer {
          0% { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseRing {
          0% { box-shadow: 0 0 0 0 rgba(59,130,246,0.35); }
          70% { box-shadow: 0 0 0 10px rgba(59,130,246,0); }
          100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
        }
        .card-animate {
          animation: fadeUp 0.4s ease both;
        }
        .card-animate:nth-child(1) { animation-delay: 0.05s; }
        .card-animate:nth-child(2) { animation-delay: 0.12s; }
        .card-animate:nth-child(3) { animation-delay: 0.19s; }
        .card-animate:nth-child(4) { animation-delay: 0.26s; }
        .card-animate:nth-child(5) { animation-delay: 0.33s; }

        .shimmer-skeleton {
          background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
          background-size: 600px 100%;
          animation: shimmer 1.4s infinite linear;
        }

        .apply-btn-pulse { animation: pulseRing 1.8s infinite; }

        .job-card {
          transition: transform 0.22s cubic-bezier(.4,0,.2,1), box-shadow 0.22s cubic-bezier(.4,0,.2,1), border-color 0.2s;
        }
        .job-card:hover {
          transform: translateY(-3px) scale(1.005);
          box-shadow: 0 20px 48px -8px rgba(59,130,246,0.13), 0 4px 16px -2px rgba(30,64,175,0.08);
        }
      `}</style>

      {/* ── TOP NAVBAR ── */}
      <header
        className="sticky top-0 z-50 border-b border-slate-200/80"
        style={{
          background: "rgba(255,255,255,0.82)",
          backdropFilter: "saturate(180%) blur(18px)",
          WebkitBackdropFilter: "saturate(180%) blur(18px)",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 h-[72px] flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" }}
            >
              <Zap size={16} className="text-white" fill="white" />
            </div>
            <span
              className="text-lg font-black tracking-[-0.04em]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <span className="text-blue-600">WORKER</span>
              <span className="text-slate-800">PRO</span>
            </span>
          </div>

          {/* Availability Toggle */}
          <div
            className="flex items-center gap-2.5 px-4 py-2 rounded-full border cursor-pointer select-none"
            style={{
              background: isAvailable
                ? "linear-gradient(135deg,#dcfce7,#f0fdf4)"
                : "linear-gradient(135deg,#f1f5f9,#e2e8f0)",
              borderColor: isAvailable ? "#86efac" : "#cbd5e1",
            }}
            onClick={() => setIsAvailable((v) => !v)}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: isAvailable ? "#22c55e" : "#94a3b8",
                boxShadow: isAvailable ? "0 0 0 3px rgba(34,197,94,0.2)" : "none",
              }}
            />
            <span
              className="text-xs font-700 font-bold"
              style={{ color: isAvailable ? "#15803d" : "#64748b" }}
            >
              {isAvailable ? "Available" : "Unavailable"}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-10 pb-16">

        {/* ── HERO SECTION ── */}
        <div
          className="rounded-3xl p-8 mb-10 relative overflow-hidden"
          style={{
            background: "linear-gradient(120deg, #1e40af 0%, #2563eb 55%, #3b82f6 100%)",
          }}
        >
          {/* Decorative blobs */}
          <div
            className="absolute -top-12 -right-12 w-56 h-56 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #93c5fd, transparent 70%)" }}
          />
          <div
            className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #bfdbfe, transparent 70%)" }}
          />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-blue-200" />
                <span className="text-blue-200 text-xs font-semibold uppercase tracking-widest">
                  Curated for you
                </span>
              </div>
              <h2
                className="text-3xl font-black text-white leading-tight tracking-tight mb-1"
                style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400 }}
              >
                Jobs waiting for you
              </h2>
              <p className="text-blue-200 text-sm font-medium">
                Matched to your skills & location — apply instantly.
              </p>
            </div>

            <div className="flex gap-4 shrink-0">
              {[
                { label: "Active", value: activeJobs.length, icon: <Briefcase size={16} /> },
                { label: "Applied", value: appliedJobIds.size, icon: <CheckCircle2 size={16} /> },
              ].map(({ label, value, icon }) => (
                <div
                  key={label}
                  className="rounded-2xl px-5 py-4 text-center min-w-[90px]"
                  style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(6px)" }}
                >
                  <div className="flex items-center justify-center gap-1 text-blue-200 mb-1">
                    {icon}
                    <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
                  </div>
                  <p className="text-3xl font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── SECTION HEADER ── */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">
              Active Listings
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {activeJobs.length} opportunities available near you
            </p>
          </div>

          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm"
          >
            <Filter size={14} />
            Filter
          </button>
        </div>

        {/* ── LOADING SKELETONS ── */}
        {loadingJobs ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 rounded-3xl shimmer-skeleton border border-slate-100"
              />
            ))}
          </div>
        ) : activeJobs.length === 0 ? (
          /* ── EMPTY STATE ── */
          <div
            className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-16 text-center"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "linear-gradient(135deg,#eff6ff,#dbeafe)" }}
            >
              <Briefcase size={28} className="text-blue-300" />
            </div>
            <p className="text-slate-700 font-bold text-lg mb-1">No active jobs right now</p>
            <p className="text-slate-400 text-sm">Check back soon — new opportunities are added daily.</p>
          </div>
        ) : (
          /* ── JOB CARDS ── */
          <div className="space-y-4">
            {activeJobs.map((job, idx) => {
              const id = job._id || job.id;
              const strId = String(id);
              const isApplied = appliedJobIds.has(strId);
              const isApplying = applyingJobId === strId;

              return (
                <div
                  key={id}
                  className="job-card card-animate group cursor-pointer bg-white rounded-3xl border border-slate-100 hover:border-blue-200 overflow-hidden"
                  style={{ boxShadow: "0 2px 16px -4px rgba(30,58,138,0.07)" }}
                  onClick={() => navigate(`/worker/job/${id}`)}
                >
                  <div className="p-6 flex flex-col md:flex-row gap-6">

                    {/* Left: Avatar + Info */}
                    <div className="flex gap-4 flex-1 min-w-0">
                      {/* Initials Avatar */}
                      <div
                        className="w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center text-base font-black text-white shadow-lg"
                        style={{
                          background: `linear-gradient(135deg, hsl(${(idx * 67 + 200) % 360},70%,50%), hsl(${(idx * 67 + 230) % 360},65%,42%))`,
                        }}
                      >
                        {(job.title || "J").charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <h4
                          className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight truncate mb-1"
                        >
                          {job.title}
                        </h4>

                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          <span className="font-bold text-slate-700">
                            {job.contactName || "Direct Hire"}
                          </span>

                          <span className="text-slate-200">|</span>

                          <span className="flex items-center gap-1 font-semibold text-rose-500">
                            <MapPin size={11} />
                            {job.city}
                          </span>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide"
                            style={{ background: "#eff6ff", color: "#2563eb" }}
                          >
                            {job.type || "Full Time"}
                          </span>
                          <span
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide flex items-center gap-1"
                            style={{ background: "#f0fdf4", color: "#15803d" }}
                          >
                            <Clock size={9} />
                            Active
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Action Buttons */}
                    <div
                      className="flex md:flex-col justify-end gap-2.5 md:min-w-[148px] border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6"
                    >
                      {/* Chat */}
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
                        className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 bg-slate-50 text-slate-500 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all"
                      >
                        <MessageCircle size={14} />
                        Chat
                      </button>

                      {/* Apply */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApply(id);
                        }}
                        disabled={isApplied || isApplying}
                        className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all active:scale-95 ${
                          isApplying
                            ? "bg-slate-300 text-slate-500 cursor-wait"
                            : isApplied
                            ? "bg-emerald-500 text-white cursor-default shadow-lg shadow-emerald-100"
                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100 apply-btn-pulse"
                        }`}
                      >
                        {isApplied ? (
                          <>
                            <CheckCircle2 size={13} />
                            Applied
                          </>
                        ) : isApplying ? (
                          "Applying…"
                        ) : (
                          <>
                            Apply Now
                            <ChevronRight size={13} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Bottom accent bar on hover */}
                  <div
                    className="h-[3px] w-0 group-hover:w-full transition-all duration-500 ease-out"
                    style={{ background: "linear-gradient(90deg,#2563eb,#60a5fa)" }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function toDateInputValue(date) {
  const pad = (v) => String(v).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function normalizeDateValue(value) {
  if (!value) return "";
  const raw = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const m = raw.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  const p = new Date(raw);
  return Number.isNaN(p.getTime()) ? "" : toDateInputValue(p);
}

function getLocalAppliedIds() {
  try {
    const raw = localStorage.getItem("workerAppliedJobIds");
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.map(String) : []);
  } catch {
    return new Set();
  }
}

function addLocalAppliedId(jobId) {
  try {
    const set = getLocalAppliedIds();
    set.add(String(jobId));
    localStorage.setItem("workerAppliedJobIds", JSON.stringify(Array.from(set)));
  } catch {
    // ignore storage errors
  }
}
