import { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, MapPin, Wallet, RefreshCw, Trash2, RotateCcw } from "lucide-react";
import { fetchAdminJobs, restoreAdminJob, trashAdminJob } from "../../api/adminApi";

export default function OneDayJobs() {

  const dateKey = (value = new Date()) => {
    const d = new Date(value);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const today = dateKey();

  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const [filterStatus, setFilterStatus] = useState("all");
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetchAdminJobs();
      const list = res?.data?.jobs || [];
      const onlyOneDay = list.filter((j) => j.type === "One Day Job");
      setJobs(onlyOneDay);
      setFilteredJobs(onlyOneDay);
    } catch (err) {
      alert(err.message || "Failed to load one day jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let data = [...jobs];
    switch (filterStatus) {
      case "active":    data = data.filter((j) => j.status === "Active"); break;
      case "cancelled": data = data.filter((j) => j.status === "Cancelled"); break;
      case "today":     data = data.filter((j) => dateKey(j.createdAt) === today); break;
      case "range":     data = data.filter((j) => { const d = dateKey(j.createdAt); return d >= fromDate && d <= toDate; }); break;
      default: break;
    }
    setFilteredJobs(data);
  }, [jobs, filterStatus, fromDate, toDate, today]);

  const formatDate = useMemo(() => (value) => {
    if (!value) return "N/A";
    try { return new Date(value).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "2-digit" }); }
    catch { return "N/A"; }
  }, []);

  const handleTrash = async (id) => {
    try {
      setActionId(id);
      await trashAdminJob(id);
      setJobs((prev) => prev.map((j) => j.id === id ? { ...j, status: "Cancelled" } : j));
    } catch (err) { alert(err.message || "Failed to trash job"); }
    finally { setActionId(null); }
  };

  const handleRestore = async (id) => {
    try {
      setActionId(id);
      await restoreAdminJob(id);
      setJobs((prev) => prev.map((j) => j.id === id ? { ...j, status: "Active" } : j));
    } catch (err) { alert(err.message || "Failed to restore job"); }
    finally { setActionId(null); }
  };

  const filters = ["today", "all", "active", "cancelled"];

  return (
    <div className="font-['Sora',sans-serif] text-white">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            One Day{" "}
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              Jobs
            </span>
          </h1>
          <p className="text-[11px] font-semibold text-slate-500 tracking-[1.5px] uppercase mt-1">
            Jobs created from employer one day job page
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10
                     text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition self-start sm:self-auto"
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex flex-wrap gap-2 mb-5">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilterStatus(f)}
            className={`px-4 py-1.5 text-[11px] font-bold rounded-xl uppercase tracking-wider transition
              ${filterStatus === f
                ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white"
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── Date Range ── */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <input
          type="date"
          value={fromDate}
          onChange={(e) => { setFromDate(e.target.value); setFilterStatus("range"); }}
          className="bg-[#13131f] border border-white/10 text-slate-300 text-xs px-3 py-2
                     rounded-xl focus:outline-none focus:border-violet-500 transition"
        />
        <span className="text-xs text-slate-500 font-semibold">to</span>
        <input
          type="date"
          value={toDate}
          onChange={(e) => { setToDate(e.target.value); setFilterStatus("range"); }}
          className="bg-[#13131f] border border-white/10 text-slate-300 text-xs px-3 py-2
                     rounded-xl focus:outline-none focus:border-violet-500 transition"
        />
      </div>

      {/* ── Job List ── */}
      <div className="bg-[#13131f] border border-white/5 rounded-2xl p-5 space-y-4">

        {loading ? (
          <div className="flex items-center gap-3 py-10 justify-center">
            <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500">Loading jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 mx-auto
                            flex items-center justify-center text-slate-600 mb-3">
              <Calendar size={20} strokeWidth={1.5} />
            </div>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">No jobs found</p>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const location = [job.city, job.state, job.country].filter(Boolean).join(", ");
            const salaryRange = job.minSalary || job.maxSalary
              ? `₹${job.minSalary || "?"} – ₹${job.maxSalary || "?"}`
              : "N/A";
            const isCancelled = job.status === "Cancelled";
            const timeRange = [job.startTime, job.endTime].filter(Boolean).join(" – ");

            return (
              <div
                key={job.id}
                className={`p-5 rounded-2xl border transition-all duration-200
                  ${isCancelled
                    ? "bg-rose-500/5 border-rose-500/10 hover:border-rose-500/20"
                    : "bg-[#0e0e1a] border-white/5 hover:border-violet-500/20"
                  }`}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">

                  {/* Left — Info */}
                  <div className="flex-1 min-w-0">

                    <p className="text-sm font-black text-white truncate">
                      {job.title || "Untitled Job"}
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                      {job.category || "General"} · {job.type || "One Day Job"}
                    </p>

                    {/* Meta grid */}
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-[11px] text-slate-500">
                      <span>Location: <span className="text-slate-300">{location || "N/A"}</span></span>
                      <span>Address: <span className="text-slate-300">{job.address || "N/A"}</span></span>
                      <span>Salary: <span className="text-slate-300">{salaryRange}</span></span>
                      <span>Applicants: <span className="text-slate-300">{job.applicants ?? 0}</span></span>
                      <span>Contact: <span className="text-slate-300">{job.contactName || "N/A"}</span></span>
                      <span>Phone: <span className="text-slate-300">{job.phone || "N/A"}</span></span>
                      <span>Posted: <span className="text-slate-300">{formatDate(job.createdAt)}</span></span>
                    </div>

                    {/* One Day Job badges */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {job.date && (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl
                                         bg-blue-500/10 border border-blue-500/20 text-blue-400
                                         text-[10px] font-bold uppercase tracking-wide">
                          <Calendar size={11} />
                          {job.date}
                        </span>
                      )}
                      {timeRange && (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl
                                         bg-emerald-500/10 border border-emerald-500/20 text-emerald-400
                                         text-[10px] font-bold uppercase tracking-wide">
                          <Clock size={11} />
                          {timeRange}
                        </span>
                      )}
                      {job.payment && (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl
                                         bg-amber-500/10 border border-amber-500/20 text-amber-400
                                         text-[10px] font-bold uppercase tracking-wide">
                          <Wallet size={11} />
                          {job.payment}
                        </span>
                      )}
                      {job.city && (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl
                                         bg-rose-500/10 border border-rose-500/20 text-rose-400
                                         text-[10px] font-bold uppercase tracking-wide">
                          <MapPin size={11} />
                          {job.city}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right — Badge + Action */}
                  <div className="flex flex-row md:flex-col items-center md:items-end gap-3 shrink-0">

                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border
                      ${job.status === "Active"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {job.status || "Active"}
                    </span>

                    {!isCancelled ? (
                      <button
                        onClick={() => handleTrash(job.id)}
                        disabled={actionId === job.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black
                                   uppercase tracking-wide text-white bg-rose-600 hover:bg-rose-500
                                   shadow-lg shadow-rose-500/20 transition disabled:opacity-50"
                      >
                        <Trash2 size={12} />
                        Trash
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRestore(job.id)}
                        disabled={actionId === job.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black
                                   uppercase tracking-wide text-white bg-emerald-600 hover:bg-emerald-500
                                   shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
                      >
                        <RotateCcw size={12} />
                        Restore
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}