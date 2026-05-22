import { Calendar, Clock, MapPin, Wallet, Briefcase, ChevronRight, Zap, CheckCircle2, Sun, KeyRound, Loader2, LocateFixed } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { State } from "country-state-city";
import {
  completeEnquiryWork,
  fetchWorkerEnquiries,
  verifyEnquiryOtp,
} from "../../api/workerApi";
import LiveJobMap from "../../component/LiveJobMap";

export default function Appliedjob() {
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterDate, setFilterDate] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // all | oneday | job (non-one-day)
  const [otpInputs, setOtpInputs] = useState({});
  const [verifyingId, setVerifyingId] = useState("");
  const [completingId, setCompletingId] = useState("");
  const [paymentPromptId, setPaymentPromptId] = useState("");
  const [paymentMethodByEnquiry, setPaymentMethodByEnquiry] = useState({});
  const [trackingOpenByEnquiry, setTrackingOpenByEnquiry] = useState({});

  const loadJobs = useCallback(async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoadingJobs(true);
      }
      const res = await fetchWorkerEnquiries();
      setEnquiries(res?.data?.enquiries || []);
    } catch (err) {
      console.error("Applied Jobs Load Error", err);
      setEnquiries([]);
    } finally {
      if (silent) {
        setRefreshing(false);
      } else {
        setLoadingJobs(false);
      }
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    const handleFocus = () => loadJobs({ silent: true });
    const handleVisibility = () => {
      if (!document.hidden) loadJobs({ silent: true });
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [loadJobs]);

const filteredEnquiries = useMemo(() => {
  let next = enquiries;

  // 🔹 Type Filter
  if (typeFilter === "oneday") {
    next = next.filter((e) => e?.job?.type === "One Day Job");
  }

  if (typeFilter === "job") {
    next = next.filter((e) => e?.job?.type !== "One Day Job");
  }

  // 🔹 Date Filter
  if (!filterDate) return next;

  return next.filter((e) => {
    const jobDate = normalizeDateValue(e?.job?.date);

    // normal jobs (without date) ko hide mat karo
    if (!jobDate) return true;

    return jobDate === filterDate;
  });
}, [enquiries, filterDate, typeFilter]);

  const handleVerifyOtp = async (enquiryId) => {
    const otp = otpInputs[enquiryId];
    if (!enquiryId || verifyingId || !otp) return;
    try {
      setVerifyingId(String(enquiryId));
      const res = await verifyEnquiryOtp(enquiryId, otp);
      const workStatus = res?.data?.workStatus || "in_progress";
      setEnquiries((prev) =>
        prev.map((e) =>
          (e.id || e._id) === enquiryId
            ? { ...e, workStatus, otpVerifiedAt: res?.data?.otpVerifiedAt || new Date().toISOString() }
            : e
        )
      );
      setOtpInputs((prev) => ({ ...prev, [enquiryId]: "" }));
    } catch (err) {
      console.error("OTP verification failed", err);
    } finally {
      setVerifyingId("");
    }
  };

  const handleComplete = async (enquiryId) => {
    const method = paymentMethodByEnquiry[enquiryId];
    if (!enquiryId || completingId || !method) return;
    try {
      setCompletingId(String(enquiryId));
      const res = await completeEnquiryWork(enquiryId, method);
      const workStatus = res?.data?.workStatus || "done";
      setEnquiries((prev) =>
        prev.map((e) => ((e.id || e._id) === enquiryId ? { ...e, workStatus } : e))
      );
      setPaymentPromptId("");
    } catch (err) {
      console.error("Complete work failed", err);
    } finally {
      setCompletingId("");
    }
  };

  const avatarGradient = (str, idx) => {
    const n = idx * 71 + 200;
    return `linear-gradient(135deg,hsl(${n % 360},68%,50%),hsl(${(n + 28) % 360},62%,42%))`;
  };

  const statusConfig = {
    applied:     { label: "Waiting for OTP", bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0" },
    otp_generated: { label: "Enter OTP",     bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
    in_progress: { label: "In Progress",     bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
    done:        { label: "Accomplished",    bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  };

  return (
    <div
      className="min-h-screen pb-28"
      style={{ background: "linear-gradient(135deg,#f0f4ff 0%,#f8fafc 55%,#eff6ff 100%)", fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=DM+Serif+Display&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
        .fade-up { animation: fadeUp .4s ease both; }
        .fade-up:nth-child(1){animation-delay:.04s} .fade-up:nth-child(2){animation-delay:.10s}
        .fade-up:nth-child(3){animation-delay:.16s} .fade-up:nth-child(4){animation-delay:.22s}
        .fade-up:nth-child(5){animation-delay:.28s} .fade-up:nth-child(6){animation-delay:.34s}
        .shimmer-skel { background:linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%); background-size:600px 100%; animation:shimmer 1.4s infinite linear; }
        .job-card { transition:transform .22s cubic-bezier(.4,0,.2,1),box-shadow .22s cubic-bezier(.4,0,.2,1),border-color .2s; }
        .job-card:hover { transform:translateY(-3px) scale(1.004); box-shadow:0 20px 48px -8px rgba(59,130,246,0.12); }
        input[type="date"]::-webkit-calendar-picker-indicator { opacity:.5; cursor:pointer; }
      `}</style>

      {/* ── HEADER ── */}
      <header
        className="border-b border-slate-200/70 px-6 pt-10 pb-6"
        style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "saturate(180%) blur(18px)", WebkitBackdropFilter: "saturate(180%) blur(18px)" }}
      >
        <div className="max-w-5xl mx-auto">
          {/* Logo
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow" style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)" }}>
              <Zap size={15} className="text-white" fill="white" />
            </div>
            <span className="text-sm font-black tracking-[-0.04em]">
              <span className="text-blue-600">WORKER</span><span className="text-slate-800">PRO</span>
            </span>
          </div> */}

          {/* Hero banner */}
          <div
            className="rounded-3xl p-7 relative overflow-hidden"
            style={{ background: "linear-gradient(120deg,#f59e0b 0%,#fbbf24 55%,#fcd34d 100%)", boxShadow: "0 12px 40px -8px rgba(245,158,11,0.30)" }}
          >
            <div className="absolute -top-8 -right-8 w-44 h-44 rounded-full opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle,#fff7ed,transparent 70%)" }} />
            <div className="relative z-10 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sun size={14} className="text-amber-900/60" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-900/60">Applied Gigs</span>
                </div>
                <h1 className="text-2xl font-black text-amber-900 leading-tight" style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400 }}>
                  Applied Jobs
                </h1>
                <p className="text-amber-800/70 text-sm font-medium mt-1">Track your gigs · Verify OTP · Complete work</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl px-5 py-3 text-center shrink-0" style={{ background: "rgba(255,255,255,0.30)", backdropFilter: "blur(6px)" }}>
                  <p className="text-3xl font-black text-amber-900">{filteredEnquiries.length}</p>
                  <p className="text-[10px] font-black uppercase tracking-wide text-amber-800/70">Jobs</p>
                </div>
                <button
                  onClick={() => loadJobs({ silent: true })}
                  disabled={refreshing}
                  className={`h-10 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all ${
                    refreshing
                      ? "bg-white/50 text-amber-900/40 border-white/30 cursor-wait"
                      : "bg-white/70 text-amber-900 border-white/60 hover:bg-white"
                  }`}
                >
                  {refreshing ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>
          </div>

          {/* Date & type filter */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Filter by date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
            >
              <option value="all">All</option>
              <option value="oneday">One Day Job</option>
              <option value="job">Job</option>
            </select>
          </div>
        </div>
      </header>

      {/* ── LIST ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-4">

        {loadingJobs ? (
          [1, 2, 3].map((i) => <div key={i} className="h-36 rounded-3xl shimmer-skel border border-slate-100" />)
        ) : filteredEnquiries.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-16 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "linear-gradient(135deg,#fffbeb,#fef3c7)" }}>
              <Briefcase size={28} className="text-amber-300" />
            </div>
            <p className="text-slate-700 font-extrabold text-base mb-1">No applied jobs for this date</p>
            <p className="text-slate-400 text-xs font-medium">Try a different date or apply to new gigs.</p>
          </div>
        ) : (
          filteredEnquiries.map((enquiry, idx) => {
            const job = enquiry?.job || {};
            const location = buildLocation(job);
            const jobId = job._id || job.id;
            const enquiryId = enquiry?.id || enquiry?._id;
            const workStatus = enquiry?.workStatus || "applied";
            const amount = parsePaymentAmount(job?.payment);
            const fee = amount ? roundTo2(amount * 0.1) : 0;
            const sc = statusConfig[workStatus] || statusConfig.applied;
            const isOneDayJob = job?.type === "One Day Job";

            return (
              <div
                key={enquiryId || jobId}
                onClick={() => navigate(isOneDayJob ? `/worker/onedayjob/${jobId}` : `/worker/job/${jobId}`)}
                className="job-card fade-up group cursor-pointer bg-white rounded-3xl border border-slate-100 hover:border-amber-200 overflow-hidden"
                style={{ boxShadow: "0 2px 16px -4px rgba(30,58,138,0.07)" }}
              >
                <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5">


                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-base font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors uppercase tracking-tight">
                        {job.contactName || "Untitled Job"}
                      </h3>
                      {/* Status pill */}
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border" style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}>
                        {sc.label}
                      </span>
                    </div>

                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{job.category || "General"}</p>

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
                    </div>
                  </div>

                  {/* Action Area */}
                  <div
                    className="w-full sm:w-auto sm:min-w-[180px] border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-5 space-y-2.5 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >

                    {/* ── OTP Input ── */}
                    {workStatus === "otp_generated" && (
                      <>
                        <div className="flex items-center gap-1.5 mb-1">
                          <KeyRound size={12} className="text-blue-400" />
                          <span className="text-[10px] font-black uppercase tracking-wide text-slate-400">Enter OTP</span>
                        </div>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="6-digit OTP"
                          value={otpInputs[enquiryId] || ""}
                          onChange={(e) => setOtpInputs((prev) => ({ ...prev, [enquiryId]: e.target.value }))}
                          className="w-full h-10 rounded-xl border border-blue-200 bg-blue-50 px-3 text-sm font-bold text-blue-800 placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                        <button
                          onClick={() => handleVerifyOtp(enquiryId)}
                          disabled={verifyingId === String(enquiryId) || !otpInputs[enquiryId]}
                          className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wide transition-all active:scale-95 ${
                            verifyingId === String(enquiryId) ? "bg-slate-300 text-slate-500 cursor-wait" : "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-100"
                          }`}
                        >
                          {verifyingId === String(enquiryId) ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                          Verify OTP
                        </button>
                      </>
                    )}

                    {/* ── In Progress ── */}
                    {workStatus === "in_progress" && (
                      <>
                        <button
                          onClick={() => setPaymentPromptId((prev) => (prev === enquiryId ? "" : enquiryId))}
                          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wide bg-amber-400 hover:bg-amber-500 text-amber-900 shadow-md shadow-amber-100 transition-all active:scale-95"
                        >
                          In Progress <ChevronRight size={13} />
                        </button>

                        {!!jobId && (
                          <button
                            onClick={() =>
                              setTrackingOpenByEnquiry((prev) => ({
                                ...prev,
                                [enquiryId]: !prev[enquiryId],
                              }))
                            }
                            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wide bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-200 transition-all active:scale-95"
                          >
                            <LocateFixed size={13} />
                            {trackingOpenByEnquiry[enquiryId] ? "Hide Live Map" : "Live Track"}
                          </button>
                        )}

                        {paymentPromptId === enquiryId && (
                          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Method</p>
                            <div className="flex gap-2">
                              {["online", "cash"].map((method) => (
                                <button
                                  key={method}
                                  onClick={() => setPaymentMethodByEnquiry((prev) => ({ ...prev, [enquiryId]: method }))}
                                  className={`flex-1 h-9 rounded-xl text-[10px] font-black uppercase tracking-wide border transition-all ${
                                    paymentMethodByEnquiry[enquiryId] === method
                                      ? "bg-slate-900 text-white border-slate-900"
                                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                                  }`}
                                >
                                  {method}
                                </button>
                              ))}
                            </div>

                            {paymentMethodByEnquiry[enquiryId] === "online" && (
                              <div className="rounded-xl border border-dashed border-slate-200 p-3 text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Scan QR</p>
                                <img src={getCashQrUrl()} alt="QR" className="mx-auto h-24 w-24 object-contain" />
                                <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mt-2">
                                  Platform Fee: {fee ? `₹${fee}` : "10%"}
                                </p>
                              </div>
                            )}

                            <button
                              onClick={() => handleComplete(enquiryId)}
                              disabled={completingId === String(enquiryId) || !paymentMethodByEnquiry[enquiryId]}
                              className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wide transition-all active:scale-95 ${
                                completingId === String(enquiryId) ? "bg-slate-300 text-slate-500 cursor-wait" : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-100"
                              }`}
                            >
                              {completingId === String(enquiryId) ? "Confirming…" : "Confirm Completion"}
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    {/* ── Done ── */}
                    {workStatus === "done" && (
                      <div className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wide bg-emerald-500 text-white shadow-md shadow-emerald-100">
                        <CheckCircle2 size={13} /> Accomplished
                      </div>
                    )}

                    {/* ── Applied / Waiting ── */}
                    {workStatus === "applied" && (
                      <div className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wide bg-slate-100 text-slate-400 border border-slate-200">
                        <KeyRound size={12} /> Waiting for OTP
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom accent */}
                <div className="h-[3px] w-0 group-hover:w-full transition-all duration-500 ease-out" style={{ background: "linear-gradient(90deg,#f59e0b,#fcd34d)" }} />
                {workStatus === "in_progress" && trackingOpenByEnquiry[enquiryId] && jobId && (
                  <div
                    className="border-t border-slate-100 bg-slate-50/60 p-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <LiveJobMap jobId={jobId} role="worker" active height={220} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Helpers ──
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
function parsePaymentAmount(value) {
  if (value == null) return 0;
  if (Number.isFinite(value)) return Number(value);
  const m = String(value).match(/(\d+(\.\d+)?)/);
  return m ? Number(m[1]) : 0;
}
function roundTo2(value) { return Math.round((Number(value) || 0) * 100) / 100; }
function getCashQrUrl() {
  return import.meta.env.VITE_CASH_QR_URL ||
    "data:image/svg+xml;utf8," + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
        <rect width="120" height="120" rx="16" fill="#f8fafc"/>
        <rect x="14" y="14" width="32" height="32" rx="6" fill="#0f172a"/>
        <rect x="74" y="14" width="32" height="32" rx="6" fill="#0f172a"/>
        <rect x="14" y="74" width="32" height="32" rx="6" fill="#0f172a"/>
        <rect x="52" y="52" width="16" height="16" rx="4" fill="#334155"/>
        <rect x="74" y="74" width="10" height="10" rx="2" fill="#334155"/>
        <rect x="90" y="90" width="8" height="8" rx="2" fill="#64748b"/>
      </svg>`
    );
}
function buildLocation(job) {
  if (!job || (!job.city && !job.state)) return "";
  const stateName = job.state ? State.getStateByCodeAndCountry(job.state, job.country || "IN")?.name : "";
  return [job.city, stateName].filter(Boolean).join(", ");
}
