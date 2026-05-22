import { MapPin, Flame, MessageCircle, ChevronRight, Briefcase, CheckCircle2, Zap, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { State } from "country-state-city";
import { useNavigate } from "react-router-dom";
import { applyToJob, fetchWorkerJobs } from "../../api/workerApi";

export default function WorkerFindJobs() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("Recent");
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [applyingJobId, setApplyingJobId] = useState("");
  const [appliedJobIds, setAppliedJobIds] = useState(() => new Set());

  const filters = ["Recent", "All", "Full Time", "Daily Wage", "Contract"];

  const filteredJobs = useMemo(() => {
    const activeJobs = jobs.filter(
      (job) => job.status === "Active" && job.type !== "One Day Job"
    );
    const sortedJobs = [...activeJobs].sort(
      (a, b) => getJobTimestamp(b?.createdAt) - getJobTimestamp(a?.createdAt)
    );
    if (activeFilter === "All" || activeFilter === "Recent") return sortedJobs;
    return sortedJobs.filter((job) => job.type === activeFilter);
  }, [activeFilter, jobs, appliedJobIds]);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoadingJobs(true);
        const res = await fetchWorkerJobs();
        const fetchedJobs = res?.data?.jobs || [];
        setJobs(fetchedJobs);
        const appliedSet = new Set(
          fetchedJobs.filter((job) => job.applied).map((job) => String(job._id || job.id))
        );
        const localApplied = getLocalAppliedIds();
        localApplied.forEach((id) => appliedSet.add(id));
        setAppliedJobIds(appliedSet);
      } catch (err) {
        console.error("Worker Jobs Load Error", err);
        setJobs([]);
        setAppliedJobIds(new Set());
      } finally {
        setLoadingJobs(false);
      }
    };
    loadJobs();
  }, []);

  const handleApply = async (jobId) => {
    if (!jobId || applyingJobId || appliedJobIds.has(String(jobId))) return;
    try {
      setApplyingJobId(String(jobId));
      const res = await applyToJob(jobId);
      const alreadyApplied = Boolean(res?.data?.alreadyApplied);
      setAppliedJobIds((prev) => {
        const next = new Set(prev);
        next.add(String(jobId));
        return next;
      });
      addLocalAppliedId(String(jobId));
      if (!alreadyApplied) {
        setJobs((prev) =>
          prev.map((job) =>
            String(job._id || job.id) === String(jobId) ? { ...job, applied: true } : job
          )
        );
      }
    } catch (err) {
      console.error("Apply failed:", err);
    } finally {
      setApplyingJobId("");
    }
  };

  return (
    <div
      className="flex-1 min-h-screen overflow-y-auto"
      style={{
        background: "linear-gradient(135deg,#f0f4ff 0%,#f8fafc 55%,#eff6ff 100%)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=DM+Serif+Display&display=swap');

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position:-600px 0; }
          100% { background-position:600px 0; }
        }
        @keyframes pulseRing {
          0%   { box-shadow:0 0 0 0 rgba(37,99,235,0.35); }
          70%  { box-shadow:0 0 0 10px rgba(37,99,235,0); }
          100% { box-shadow:0 0 0 0 rgba(37,99,235,0); }
        }
        .fade-up { animation: fadeUp 0.4s ease both; }
        .fade-up:nth-child(1){ animation-delay:.04s }
        .fade-up:nth-child(2){ animation-delay:.10s }
        .fade-up:nth-child(3){ animation-delay:.16s }
        .fade-up:nth-child(4){ animation-delay:.22s }
        .fade-up:nth-child(5){ animation-delay:.28s }
        .fade-up:nth-child(6){ animation-delay:.34s }

        .shimmer-skel {
          background: linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%);
          background-size:600px 100%;
          animation:shimmer 1.4s infinite linear;
        }
        .job-card {
          transition: transform .22s cubic-bezier(.4,0,.2,1), box-shadow .22s cubic-bezier(.4,0,.2,1), border-color .2s;
        }
        .job-card:hover {
          transform: translateY(-3px) scale(1.004);
          box-shadow: 0 20px 48px -8px rgba(59,130,246,0.13), 0 4px 16px -2px rgba(30,64,175,0.08);
        }
        .pulse-apply { animation: pulseRing 1.9s infinite; }
        .no-scrollbar::-webkit-scrollbar { display:none; }
        .no-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>

      {/* ── HEADER ── */}
      <div
        className="border-b border-slate-200/70 px-6 pt-10 pb-6"
        style={{
          background: "rgba(255,255,255,0.80)",
          backdropFilter: "saturate(180%) blur(18px)",
          WebkitBackdropFilter: "saturate(180%) blur(18px)",
        }}
      >
        <div className="max-w-5xl mx-auto">

          

          {/* Title */}
          <div className="mb-5">
            <h1
              className="text-3xl font-black tracking-tight text-slate-900 leading-tight"
              style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400 }}
            >
              Available Jobs
            </h1>
            <p className="text-slate-400 text-sm font-medium mt-1">
              Browse and manage your applied opportunities
            </p>
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <SlidersHorizontal size={14} className="text-slate-400 shrink-0" />
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border whitespace-nowrap transition-all ${
                  activeFilter === filter
                    ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100"
                    : "bg-white border-slate-200 text-slate-500 hover:border-blue-200 hover:text-blue-600"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── JOB LIST ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-32 space-y-4">

        {/* Loading skeletons */}
        {loadingJobs ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-36 rounded-3xl shimmer-skel border border-slate-100" />
          ))
        ) : filteredJobs.length === 0 ? (
          /* Empty state */
          <div
            className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-16 text-center"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "linear-gradient(135deg,#eff6ff,#dbeafe)" }}
            >
              <Briefcase size={28} className="text-blue-300" />
            </div>
            <p className="text-slate-700 font-extrabold text-base mb-1">No jobs found</p>
            <p className="text-slate-400 text-xs font-medium">
              Try a different filter or check back later.
            </p>
          </div>
        ) : (
          filteredJobs.map((job, idx) => {
            const id = job._id || job.id;
            const strId = String(id);
            const isApplied = appliedJobIds.has(strId);
            const isApplying = applyingJobId === strId;
            const location = buildLocation(job);

            return (
              <div
                key={id}
                onClick={() => navigate(`/worker/job/${id}`)}
                className="job-card fade-up group cursor-pointer bg-white rounded-3xl border border-slate-100 hover:border-blue-200 overflow-hidden"
                style={{ boxShadow: "0 2px 16px -4px rgba(30,58,138,0.07)" }}
              >
                <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">

                  {/* Avatar */}
                  {/* <div
                    className="w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center text-lg font-black text-white shadow-md"
                    style={{
                      background: `linear-gradient(135deg,hsl(${(idx * 71 + 200) % 360},68%,50%),hsl(${(idx * 71 + 228) % 360},63%,42%))`,
                    }}
                  >
                    {(job.title || "J").charAt(0).toUpperCase()}
                  </div> */}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight truncate">
                        {job.title || "Untitled Job"}
                      </h3>
                      {job.urgent && (
                        <span
                          className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase border"
                          style={{ background: "#fff1f2", color: "#e11d48", borderColor: "#fecdd3" }}
                        >
                          <Flame size={9} fill="currentColor" /> Urgent
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
                      <span className="font-extrabold text-slate-700 uppercase tracking-tight">
                        {job.contactName || "Direct Hire"}
                      </span>
                      <span className="text-slate-200 hidden sm:block">|</span>
                      <span className="flex items-center gap-1 font-semibold text-slate-500">
                        <MapPin size={11} className="text-rose-500" />
                        {location}
                      </span>
                    </div>

                    {/* Type tag */}
                    <div className="mt-2.5 flex gap-2">
                      <span
                        className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide"
                        style={{ background: "#eff6ff", color: "#2563eb" }}
                      >
                        {job.type || "Full Time"}
                      </span>
                      {isApplied && (
                        <span
                          className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide flex items-center gap-1"
                          style={{ background: "#f0fdf4", color: "#15803d" }}
                        >
                          <CheckCircle2 size={9} /> Applied
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    className="flex items-center gap-2.5 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6 shrink-0"
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
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wide border border-slate-200 bg-slate-50 text-slate-500 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all"
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
                      className={`flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all active:scale-95 ${
                        isApplying
                          ? "bg-slate-300 text-slate-500 cursor-wait"
                          : isApplied
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100 cursor-default"
                          : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100 pulse-apply"
                      }`}
                    >
                      {isApplied ? (
                        <><CheckCircle2 size={13} /> Applied</>
                      ) : isApplying ? (
                        "Applying…"
                      ) : (
                        <>Apply <ChevronRight size={13} /></>
                      )}
                    </button>
                  </div>
                </div>

                {/* Bottom accent bar */}
                <div
                  className="h-[3px] w-0 group-hover:w-full transition-all duration-500 ease-out"
                  style={{ background: "linear-gradient(90deg,#2563eb,#60a5fa)" }}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
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

// ── Helpers ──
function buildLocation(job) {
  if (!job) return "";
  const stateName = job.state
    ? State.getStateByCodeAndCountry(job.state, job.country || "IN")?.name
    : "";
  return [job.city, stateName].filter(Boolean).join(", ");
}

function formatSalaryRange(job) {
  const min = job?.minSalary?.toString().trim();
  const max = job?.maxSalary?.toString().trim();
  if (min && max) return `₹ ${min} - ${max}`;
  if (min) return `₹ ${min}`;
  if (max) return `₹ ${max}`;
  return "Negotiable";
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

function getJobTimestamp(value) {
  if (!value) return 0;
  const normalized = normalizeDateValue(value);
  const parsed = normalized ? new Date(normalized) : new Date(value);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}
