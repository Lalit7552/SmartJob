import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Trash2, RotateCcw, Building2 } from "lucide-react";
import { fetchEmployers, restoreEmployer, trashEmployer } from "../../api/adminApi";

export default function UserManagement() {

  const dateKey = (value = new Date()) => {
    const d = new Date(value);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const today = dateKey();

  const [employers, setEmployers] = useState([]);
  const [filteredEmployers, setFilteredEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const [filterStatus, setFilterStatus] = useState("all");
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetchEmployers();
      const list = res?.data?.employers || [];
      setEmployers(list);
      setFilteredEmployers(list);
    } catch (err) {
      alert(err.message || "Failed to load employers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let data = [...employers];
    switch (filterStatus) {
      case "active":  data = data.filter((e) => e.adminStatus !== "trashed"); break;
      case "trashed": data = data.filter((e) => e.adminStatus === "trashed"); break;
      case "today":   data = data.filter((e) => dateKey(e.createdAt) === today); break;
      case "range":   data = data.filter((e) => { const d = dateKey(e.createdAt); return d >= fromDate && d <= toDate; }); break;
      default: break;
    }
    setFilteredEmployers(data);
  }, [employers, filterStatus, fromDate, toDate, today]);

  const formatDate = useMemo(() => (value) => {
    if (!value) return "N/A";
    try { return new Date(value).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "2-digit" }); }
    catch { return "N/A"; }
  }, []);

  const handleTrash = async (id) => {
    try {
      setActionId(id);
      await trashEmployer(id);
      setEmployers((prev) => prev.map((e) => e.id === id ? { ...e, adminStatus: "trashed" } : e));
    } catch (err) { alert(err.message || "Failed to trash user"); }
    finally { setActionId(null); }
  };

  const handleRestore = async (id) => {
    try {
      setActionId(id);
      await restoreEmployer(id);
      setEmployers((prev) => prev.map((e) => e.id === id ? { ...e, adminStatus: "active" } : e));
    } catch (err) { alert(err.message || "Failed to restore user"); }
    finally { setActionId(null); }
  };

  const filters = ["today", "all", "active", "trashed"];

  return (
    <div className="font-['Sora',sans-serif] text-white">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Employer{" "}
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              Management
            </span>
          </h1>
          <p className="text-[11px] font-semibold text-slate-500 tracking-[1.5px] uppercase mt-1">
            Manage employer accounts
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

      {/* ── List ── */}
      <div className="bg-[#13131f] border border-white/5 rounded-2xl p-5 space-y-4">

        {loading ? (
          <div className="flex items-center gap-3 py-10 justify-center">
            <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500">Loading employers...</p>
          </div>
        ) : filteredEmployers.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-10">No employers found.</p>
        ) : (
          filteredEmployers.map((e) => {
            const profile = e.profile || {};
            const phoneNumber = e.phone ? `${e.countryCode || "+91"}${e.phone}` : "N/A";
            const isTrashed = e.adminStatus === "trashed";

            return (
              <div
                key={e.id}
                className={`p-5 rounded-2xl border transition-all duration-200
                  ${isTrashed
                    ? "bg-rose-500/5 border-rose-500/10 hover:border-rose-500/20"
                    : "bg-[#0e0e1a] border-white/5 hover:border-violet-500/20"
                  }`}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">

                  {/* Left — Info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">

                    {/* Avatar */}
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-white/5 border border-white/10
                                    flex items-center justify-center text-slate-400">
                      <Building2 size={20} strokeWidth={1.8} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-white truncate">
                        {profile?.name || "Unnamed Employer"}
                      </p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                        {profile?.companyName || "Company not set"}
                      </p>

                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-[11px] text-slate-500">
                        <span>Email: <span className="text-slate-300">{profile?.email || "N/A"}</span></span>
                        <span>Phone: <span className="text-slate-300">{phoneNumber}</span></span>
                        <span>City: <span className="text-slate-300">{profile?.city || "N/A"}</span></span>
                        <span>Address: <span className="text-slate-300">{profile?.address || "N/A"}</span></span>
                        <span>Est: <span className="text-slate-300">{profile?.establishedYear || "N/A"}</span></span>
                        <span>Joined: <span className="text-slate-300">{formatDate(e.createdAt)}</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Right — Badge + Action */}
                  <div className="flex flex-row md:flex-col items-center md:items-end gap-3 shrink-0">

                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border
                      ${isTrashed
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}
                    >
                      {isTrashed ? "trashed" : "active"}
                    </span>

                    {!isTrashed ? (
                      <button
                        onClick={() => handleTrash(e.id)}
                        disabled={actionId === e.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black
                                   uppercase tracking-wide text-white bg-rose-600 hover:bg-rose-500
                                   shadow-lg shadow-rose-500/20 transition disabled:opacity-50"
                      >
                        <Trash2 size={12} />
                        Trash
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRestore(e.id)}
                        disabled={actionId === e.id}
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