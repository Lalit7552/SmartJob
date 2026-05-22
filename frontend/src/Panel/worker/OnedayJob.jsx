import { Calendar, Clock, MapPin, Wallet, ChevronRight, Briefcase, Zap, CheckCircle2, Sun } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { State } from "country-state-city";
import { applyToJob, fetchWorkerJobs } from "../../api/workerApi";

export default function OnedayJob() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [applyingJobId, setApplyingJobId] = useState("");
  const [appliedJobIds, setAppliedJobIds] = useState(() => new Set());

  const oneDayJobs = useMemo(
    () =>
      jobs.filter(
        (job) =>
          job.status === "Active" &&
          isOneDayJob(job)
      ),
    [jobs]
  );

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoadingJobs(true);
        const res = await fetchWorkerJobs();
        const fetchedJobs = res?.data?.jobs || [];
        setJobs(fetchedJobs);
        const appliedSet = new Set(
          fetchedJobs.filter((job) => job.applied).map((job) => String(job._id))
        );
        // merge with locally stored applied ids to prevent re-apply UI after refresh
        const localApplied = getLocalAppliedIds();
        localApplied.forEach((id) => appliedSet.add(id));
        setAppliedJobIds(appliedSet);
      } catch (err) {
        console.error("Worker One Day Jobs Load Error", err);
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

    await applyToJob(jobId);

    // 1. mark applied
    setAppliedJobIds((prev) => {
      const next = new Set(prev);
      next.add(String(jobId));
      return next;
    });

    addLocalAppliedId(String(jobId));

    // 2. thoda delay for smooth UX
    setTimeout(() => {
      navigate("/worker/appliedjob");
    }, 300);

  } catch (err) {
    console.error("Apply failed:", err);
  } finally {
    setApplyingJobId("");
  }
};

 

  return (
    <div
      className="min-h-screen pb-24"
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
        .fade-up { animation: fadeUp .4s ease both; }
        .fade-up:nth-child(1){ animation-delay:.04s }
        .fade-up:nth-child(2){ animation-delay:.10s }
        .fade-up:nth-child(3){ animation-delay:.16s }
        .fade-up:nth-child(4){ animation-delay:.22s }
        .fade-up:nth-child(5){ animation-delay:.28s }
        .fade-up:nth-child(6){ animation-delay:.34s }

        .shimmer-skel {
          background:linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%);
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
      `}</style>

      {/* ── HEADER ── */}
      <header
        className="border-b border-slate-200/70 px-6 pt-10 pb-6"
        style={{
          background: "rgba(255,255,255,0.82)",
          backdropFilter: "saturate(180%) blur(18px)",
          WebkitBackdropFilter: "saturate(180%) blur(18px)",
        }}
      >
        <div className="max-w-5xl mx-auto">
         

          {/* Hero banner */}
          <div
            className="rounded-3xl p-7 relative overflow-hidden"
            style={{
              background: "linear-gradient(120deg,#f59e0b 0%,#fbbf24 55%,#fcd34d 100%)",
              boxShadow: "0 12px 40px -8px rgba(245,158,11,0.35)",
            }}
          >
            {/* blobs */}
            <div
              className="absolute -top-8 -right-8 w-44 h-44 rounded-full opacity-20 pointer-events-none"
              style={{ background: "radial-gradient(circle,#fff7ed,transparent 70%)" }}
            />
            <div
              className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full opacity-10 pointer-events-none"
              style={{ background: "radial-gradient(circle,#fef3c7,transparent 70%)" }}
            />

            <div className="relative z-10 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sun size={15} className="text-amber-900/60" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-900/60">
                    Quick Gigs
                  </span>
                </div>
                <h1
                  className="text-2xl font-black text-amber-900 leading-tight"
                  style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400 }}
                >
                  One Day Jobs
                </h1>
                <p className="text-amber-800/70 text-sm font-medium mt-1">
                  Short gigs · Instant apply · Earn today
                </p>
              </div>

              {/* Count badge */}
              <div
                className="rounded-2xl px-5 py-3 text-center shrink-0"
                style={{ background: "rgba(255,255,255,0.3)", backdropFilter: "blur(6px)" }}
              >
                <p className="text-3xl font-black text-amber-900">{oneDayJobs.length}</p>
                <p className="text-[10px] font-black uppercase tracking-wide text-amber-800/70">Available</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── JOB LIST ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-4">

        {/* Loading */}
        {loadingJobs ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-3xl shimmer-skel border border-slate-100" />
          ))
        ) : oneDayJobs.length === 0 ? (
          /* Empty */
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-16 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "linear-gradient(135deg,#fffbeb,#fef3c7)" }}
            >
              <Briefcase size={28} className="text-amber-300" />
            </div>
            <p className="text-slate-700 font-extrabold text-base mb-1">No one day jobs right now</p>
            <p className="text-slate-400 text-xs font-medium">New gigs are posted daily — check back soon.</p>
          </div>
        ) : (
          oneDayJobs.map((job, idx) => {
            const location = buildLocation(job);
            const jobId = job._id || job.id;
            const strId = String(jobId);
            const isApplying = applyingJobId === strId;
            const isApplied = appliedJobIds.has(strId);

            return (
              <div
                key={jobId}
                onClick={() => navigate(`/worker/onedayjob/${jobId}`)}
                className="job-card fade-up group cursor-pointer bg-white rounded-3xl border border-slate-100 hover:border-amber-200 overflow-hidden"
                style={{ boxShadow: "0 2px 16px -4px rgba(30,58,138,0.07)" }}
              >
                <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">

               

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors uppercase tracking-tight truncate mb-1">
                      {job.contactName || job.title || "Untitled Job"}
                    </h3>

                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      {job.category || "General"}
                    </p>

                    {/* Meta chips */}
                    <div className="flex flex-wrap gap-2">
                      {job.date && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold" style={{ background: "#eff6ff", color: "#2563eb" }}>
                          <Calendar size={9} /> {job.date}
                        </span>
                      )}
                      {(job.startTime || job.endTime) && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold" style={{ background: "#f0fdf4", color: "#15803d" }}>
                          <Clock size={9} /> {[job.startTime, job.endTime].filter(Boolean).join(" – ")}
                        </span>
                      )}
                      {job.payment && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold" style={{ background: "#fffbeb", color: "#b45309" }}>
                          <Wallet size={9} /> {job.payment}
                        </span>
                      )}
                      {location && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold" style={{ background: "#fff1f2", color: "#e11d48" }}>
                          <MapPin size={9} /> {location}
                        </span>
                      )}
                      {/* One Day badge */}
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black" style={{ background: "#fef3c7", color: "#d97706" }}>
                        <Sun size={9} /> One Day
                      </span>
                    </div>
                  </div>

                  {/* Apply button */}
                  <div className="w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApply(jobId);
                      }}
                      disabled={isApplied || isApplying}
                      className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wide transition-all active:scale-95 ${
                        isApplying
                          ? "bg-slate-300 text-slate-500 cursor-wait"
                          : isApplied
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100 cursor-default"
                          : "bg-amber-400 hover:bg-amber-500 text-amber-900 shadow-lg shadow-amber-100 pulse-apply"
                      }`}
                    >
                      {isApplied ? (
                        <><CheckCircle2 size={13} /> Applied</>
                      ) : isApplying ? (
                        "Applying…"
                      ) : (
                        <>Apply Now <ChevronRight size={13} /></>
                      )}
                    </button>
                  </div>
                </div>

                {/* Bottom accent bar on hover */}
                <div
                  className="h-[3px] w-0 group-hover:w-full transition-all duration-500 ease-out"
                  style={{ background: "linear-gradient(90deg,#f59e0b,#fcd34d)" }}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function buildLocation(job) {
  if (!job) return "";
  if (!job.city && !job.state) return "";
  const stateName = job.state
    ? State.getStateByCodeAndCountry(job.state, job.country || "IN")?.name
    : "";
  return [job.city, stateName].filter(Boolean).join(", ");
}

function isOneDayJob(job) {
  const raw = String(job?.type || "").trim().toLowerCase();
  if (!raw) return false;
  if (raw === "one day job") return true;
  if (raw.includes("one day") || raw.includes("oneday")) return true;
  return false;
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
