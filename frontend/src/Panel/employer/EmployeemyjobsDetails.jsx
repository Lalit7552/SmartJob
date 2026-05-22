import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  MapPin, Phone, ArrowLeft, Briefcase, Calendar,
  Building2, Zap, Users, CheckCircle2,
} from "lucide-react";
import { State } from "country-state-city";
import { fetchEmployerJobs } from "../../api/employerApi";

export default function EmployeemyjobsDetails() {
  const { jobId }  = useParams();
  const navigate   = useNavigate();
  const [job, setJob]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        setLoading(true);
        setError("");
        const res  = await fetchEmployerJobs();
        const list = res?.data?.jobs || [];
        const found = list.find((j) => String(j._id || j.id) === String(jobId));
        if (!alive) return;
        if (!found) { setError("Job not found."); return; }
        setJob(found);
      } catch (err) {
        if (!alive) return;
        setError(err?.message || "Failed to load job.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [jobId]);

  const summary = useMemo(() => {
    if (!job) return null;
    const stateName = job.state ? State.getStateByCodeAndCountry(job.state, job.country || "IN")?.name : "";
    const location  = [job.city, stateName, job.country].filter(Boolean).join(", ");
    const salary    = job.minSalary || job.maxSalary
      ? `₹${job.minSalary || "?"} – ₹${job.maxSalary || "?"}`
      : "Pay not specified";
    return {
      title:       job.title       || "Untitled Job",
      category:    job.category    || "General",
      type:        job.type        || "Work Type",
      location,
      address:     job.address     || "N/A",
      salary,
      applicants:  Number.isFinite(job.applicants) ? job.applicants : 0,
      contactName: job.contactName || "Employer",
      phone:       job.phone       || "N/A",
      status:      job.status      || "Active",
      createdAt:   job.createdAt
        ? new Date(job.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
        : "N/A",
    };
  }, [job]);

  const statusStyle = {
    Active:    { bg: "rgba(37,99,235,0.15)",  color: "#93c5fd", border: "rgba(96,165,250,0.22)" },
    Completed: { bg: "rgba(16,185,129,0.13)", color: "#6ee7b7", border: "rgba(52,211,153,0.22)" },
    Cancelled: { bg: "rgba(255,255,255,0.04)",color: "#475569", border: "rgba(255,255,255,0.07)" },
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen gap-3"
        style={{ background: "#0a0f0d", fontFamily: "'Sora', sans-serif" }}
      >
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700&display=swap'); @keyframes spin{to{transform:rotate(360deg)}} .spin{animation:spin .9s linear infinite;}`}</style>
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center spin"
          style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)" }}
        >
          <Zap size={20} className="text-white" fill="white" />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#475569" }}>Loading…</p>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div
        className="min-h-screen p-6"
        style={{ background: "#0a0f0d", fontFamily: "'Sora', sans-serif" }}
      >
        <button
          onClick={() => navigate("/employee/myjobs")}
          className="flex items-center gap-2 text-xs font-black uppercase mb-4"
          style={{ color: "#60a5fa" }}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <p className="text-sm" style={{ color: "#94a3b8" }}>{error}</p>
      </div>
    );
  }

  const ss = statusStyle[summary?.status] || statusStyle.Active;

  return (
    <div
      className="min-h-screen pb-16"
      style={{ background: "#0a0f0d", fontFamily: "'Sora', sans-serif", color: "white" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp .38s ease both; }
        .d1{animation-delay:.04s} .d2{animation-delay:.11s} .d3{animation-delay:.18s} .d4{animation-delay:.25s}
      `}</style>

      {/* ── NAVBAR ── */}
      <header
        className="sticky top-0 z-10 px-5 py-3 flex items-center gap-3"
        style={{
          background: "rgba(13,13,26,0.95)",
          backdropFilter: "saturate(180%) blur(18px)",
          WebkitBackdropFilter: "saturate(180%) blur(18px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <button
          onClick={() => navigate("/employee/myjobs")}
          className="group flex items-center gap-2 text-xs font-black uppercase transition-all"
          style={{ color: "#64748b" }}
          onMouseEnter={e => e.currentTarget.style.color = "#60a5fa"}
          onMouseLeave={e => e.currentTarget.style.color = "#64748b"}
        >
          <span
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <ArrowLeft size={15} />
          </span>
          Back
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 mt-6 space-y-4">

        {/* ── HERO CARD ── */}
        <div
          className="fade-up d1 rounded-3xl overflow-hidden relative"
          style={{
            background: "linear-gradient(120deg,#1e3a8a 0%,#1d4ed8 55%,#2563eb 100%)",
            boxShadow: "0 12px 40px -8px rgba(37,99,235,0.38)",
          }}
        >
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-20 pointer-events-none"
            style={{ background: "radial-gradient(circle,#93c5fd,transparent 70%)" }} />
          <div className="relative z-10 p-7">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider"
                style={{ background: "rgba(255,255,255,0.15)", color: "#bfdbfe" }}>
                {summary.type}
              </span>
              <span
                className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1"
                style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}
              >
                {summary.status === "Completed" && <CheckCircle2 size={9} />}
                {summary.status}
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1 uppercase">
              {summary.title}
            </h1>
            <p className="text-blue-200 text-sm font-semibold">
              {summary.category}
            </p>

            {/* Quick stats */}
            <div className="flex gap-3 mt-5">
              {[
                { label: "Salary",     value: summary.salary },
                { label: "Applicants", value: summary.applicants },
                { label: "Posted",     value: summary.createdAt },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-2xl px-3 py-2.5 flex-1 text-center"
                  style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(6px)" }}
                >
                  <p className="text-[9px] font-bold uppercase tracking-wide text-blue-200">{label}</p>
                  <p className="text-white font-extrabold text-xs mt-0.5 truncate">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── LOCATION + ADDRESS ── */}
        <div
          className="fade-up d2 rounded-3xl p-5 space-y-4"
          style={{ background: "#0d0d1a", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <InfoRow
            icon={<MapPin size={16} style={{ color: "#60a5fa" }} />}
            iconBg="rgba(37,99,235,0.12)"
            label="Location"
            value={summary.location || "N/A"}
          />
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }} className="pt-4">
            <InfoRow
              icon={<Building2 size={16} style={{ color: "#a78bfa" }} />}
              iconBg="rgba(139,92,246,0.12)"
              label="Address"
              value={summary.address}
            />
          </div>
        </div>

        {/* ── JOB DETAILS ── */}
        <div
          className="fade-up d3 rounded-3xl p-5 space-y-4"
          style={{ background: "#0d0d1a", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#334155" }}>
            Job Details
          </p>
          <div className="grid grid-cols-2 gap-4">
            <InfoRow
              icon={<Briefcase size={15} style={{ color: "#34d399" }} />}
              iconBg="rgba(16,185,129,0.12)"
              label="Salary"
              value={summary.salary}
            />
            <InfoRow
              icon={<Users size={15} style={{ color: "#fbbf24" }} />}
              iconBg="rgba(251,191,36,0.12)"
              label="Applicants"
              value={String(summary.applicants)}
            />
            <InfoRow
              icon={<Calendar size={15} style={{ color: "#60a5fa" }} />}
              iconBg="rgba(37,99,235,0.12)"
              label="Posted"
              value={summary.createdAt}
            />
          </div>
        </div>

        {/* ── CONTACT ── */}
        <div
          className="fade-up d4 rounded-3xl p-5"
          style={{ background: "#0d0d1a", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <p className="text-[9px] font-black uppercase tracking-widest mb-4" style={{ color: "#334155" }}>
            Contact
          </p>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(16,185,129,0.12)" }}
            >
              <Phone size={16} style={{ color: "#34d399" }} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{summary.contactName}</p>
              <p className="text-[11px]" style={{ color: "#475569" }}>{summary.phone}</p>
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
      <div
        className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center"
        style={{ background: iconBg }}
      >
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#334155" }}>{label}</p>
        <p className="text-sm font-semibold text-white mt-0.5">{value}</p>
      </div>
    </div>
  );
}