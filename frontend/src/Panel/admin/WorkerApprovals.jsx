import { useEffect, useState } from "react";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";
import {
  fetchWorkers,
  approveWorkerProfile,
  rejectWorkerProfile,
} from "../../api/adminApi";

export default function WorkerApprovals() {
  const [workers, setWorkers] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const today = new Date().toISOString().split("T")[0];
  const [filterStatus, setFilterStatus] = useState("today");
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetchWorkers();
      const list = res?.data?.workers || [];
      setWorkers(list);
      setFilteredWorkers(list);
    } catch (err) {
      alert(err.message || "Failed to load workers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let data = [...workers];
    if (filterStatus === "pending")  data = data.filter((w) => w.profileStatus === "pending");
    if (filterStatus === "approved") data = data.filter((w) => w.profileStatus === "approved");
    if (filterStatus === "rejected") data = data.filter((w) => w.profileStatus === "rejected");
    if (filterStatus === "today")    data = data.filter((w) => new Date(w.createdAt).toISOString().split("T")[0] === today);
    if (filterStatus === "range")    data = data.filter((w) => {
      const d = new Date(w.createdAt).toISOString().split("T")[0];
      return d >= fromDate && d <= toDate;
    });
    setFilteredWorkers(data);
  }, [workers, filterStatus, fromDate, toDate, today]);

  const handleApprove = async (id) => {
    try {
      setActionId(id);
      await approveWorkerProfile(id);
      setWorkers((prev) => prev.map((w) => w.id === id ? { ...w, profileStatus: "approved" } : w));
    } catch (err) { alert(err.message || "Failed to approve worker"); }
    finally { setActionId(null); }
  };

  const handleReject = async (id) => {
    try {
      setActionId(id);
      await rejectWorkerProfile(id);
      setWorkers((prev) => prev.map((w) => w.id === id ? { ...w, profileStatus: "rejected" } : w));
    } catch (err) { alert(err.message || "Failed to reject worker"); }
    finally { setActionId(null); }
  };

  const handleDisapprove = async (id) => {
    try {
      setActionId(id);
      setWorkers((prev) => prev.map((w) => w.id === id ? { ...w, profileStatus: "pending" } : w));
    } catch (err) { alert("Failed to disapprove worker"); }
    finally { setActionId(null); }
  };

  const handleRestore = async (id) => {
    try {
      setActionId(id);
      setWorkers((prev) => prev.map((w) => w.id === id ? { ...w, profileStatus: "pending" } : w));
    } catch (err) { alert("Failed to restore worker"); }
    finally { setActionId(null); }
  };

  const filters = [
    { key: "today",    label: "Today" },
    { key: "all",      label: "All" },
    { key: "pending",  label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
  ];

  const statusStyle = {
    approved: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    rejected: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
    pending:  "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  };

  return (
    <div className="font-['Sora',sans-serif] text-white">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Worker{" "}
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              Approvals
            </span>
          </h1>
          <p className="text-[11px] font-semibold text-slate-500 tracking-[1.5px] uppercase mt-1">
            Approve or reject profiles before they appear to employers
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
            key={f.key}
            onClick={() => setFilterStatus(f.key)}
            className={`px-4 py-1.5 text-[11px] font-bold rounded-xl uppercase tracking-wider transition
              ${filterStatus === f.key
                ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white"
              }`}
          >
            {f.label}
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
          <div className="flex items-center gap-3 py-8 justify-center">
            <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500">Loading profiles...</p>
          </div>
        ) : filteredWorkers.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-10">No profiles found.</p>
        ) : (
          filteredWorkers.map((w) => {
            const skills = Array.isArray(w.skills) ? w.skills : w.skills?.split(",") || [];
            const skill = w.skillDetails || {};
            const phoneNumber = w.phone ? `${w.countryCode || "+91"}${w.phone}` : null;
            const isApproved = w.profileStatus === "approved";
            const isRejected = w.profileStatus === "rejected";
            const status = w.profileStatus || "pending";

            return (
              <div
                key={w.id}
                className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5
                           p-5 bg-[#0e0e1a] rounded-2xl border border-white/5
                           hover:border-violet-500/20 transition-all duration-200"
              >
                {/* Left — Avatar + Info */}
                <div className="flex items-start gap-4 flex-1 min-w-0">

                  {/* Avatar */}
                  <div className="w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-white/5
                                  border border-white/10 flex items-center justify-center">
                    {w.profile?.profilePhoto ? (
                      <img
                        src={`http://localhost:5000${w.profile.profilePhoto}`}
                        alt={w.profile?.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-black text-slate-400">
                        {w.profile?.fullName?.charAt(0) || "W"}
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-white truncate">
                      {w.profile?.fullName || "Unnamed Worker"}
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                      {w.profile?.city || "Unknown City"}
                      {w.profile?.state ? ` · ${w.profile.state}` : ""}
                    </p>

                    {/* Skills */}
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {skills.length > 0
                        ? skills.slice(0, 10).map((s) => (
                            <span key={s} className="px-2 py-0.5 text-[10px] font-bold uppercase
                                                      rounded-full bg-white/5 border border-white/10 text-slate-400">
                              {s}
                            </span>
                          ))
                        : <span className="text-[10px] text-slate-600 uppercase font-bold">No skills listed</span>
                      }
                    </div>

                    {/* Meta grid */}
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-[11px] text-slate-500">
                      <span>Age: <span className="text-slate-300">{w.profile?.age || "N/A"}</span></span>
                      <span>Gender: <span className="text-slate-300">{w.profile?.gender || "N/A"}</span></span>
                      <span>Area: <span className="text-slate-300">{w.profile?.area || "N/A"}</span></span>
                      <span>Country: <span className="text-slate-300">{w.profile?.country || "N/A"}</span></span>
                      <span>Exp: <span className="text-slate-300">{skill?.experience || "N/A"}</span></span>
                      <span>Type: <span className="text-slate-300">{skill?.jobType || "N/A"}</span></span>
                      <span>Salary: <span className="text-slate-300">{skill?.expectedSalary ? `₹${skill.expectedSalary}` : "N/A"}</span></span>
                      <span>Pref Area: <span className="text-slate-300">{skill?.preferredArea || "N/A"}</span></span>
                      {phoneNumber && <span>Phone: <span className="text-slate-300">{phoneNumber}</span></span>}
                    </div>
                  </div>
                </div>

                {/* Right — Status + Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">

                  <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${statusStyle[status] || statusStyle.pending}`}>
                    {status}
                  </span>

                  <button
                    onClick={() => isApproved ? handleDisapprove(w.id) : handleApprove(w.id)}
                    disabled={actionId === w.id}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black
                                uppercase tracking-wide text-white transition disabled:opacity-50
                                ${isApproved
                                  ? "bg-slate-600 hover:bg-slate-500"
                                  : "bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20"
                                }`}
                  >
                    <CheckCircle size={13} />
                    {isApproved ? "Disapprove" : "Approve"}
                  </button>

                  <button
                    onClick={() => isRejected ? handleRestore(w.id) : handleReject(w.id)}
                    disabled={actionId === w.id}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black
                                uppercase tracking-wide text-white transition disabled:opacity-50
                                ${isRejected
                                  ? "bg-blue-600 hover:bg-blue-500"
                                  : "bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-500/20"
                                }`}
                  >
                    <XCircle size={13} />
                    {isRejected ? "Restore" : "Reject"}
                  </button>

                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}