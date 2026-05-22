import { useEffect, useState } from "react";
import { ArrowDownLeft, Wallet as WalletIcon, CalendarClock } from "lucide-react";
import { fetchWorkerWallet } from "../../api/workerApi";

export default function Wallet() {
  const [balance, setBalance] = useState(0);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadWallet = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetchWorkerWallet();
        setBalance(res?.data?.balance || 0);
        setUpdatedAt(res?.data?.updatedAt || null);
        setTransactions(res?.data?.transactions || []);
      } catch (err) {
        setError(err?.message || "Failed to load wallet");
        setBalance(0);
        setUpdatedAt(null);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    loadWallet();
  }, []);

  const lastUpdated = updatedAt
    ? new Date(updatedAt).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div
      className="min-h-screen pb-28"
      style={{
        background: "linear-gradient(135deg,#eef2ff 0%,#f8fafc 55%,#eff6ff 100%)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-500px 0} 100%{background-position:500px 0} }
        .fade-up { animation: fadeUp .4s ease both; }
        .shimmer-skel { background:linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%); background-size:500px 100%; animation:shimmer 1.4s infinite linear; }
      `}</style>

      <header
        className="border-b border-slate-200/70 px-6 pt-10 pb-6"
        style={{
          background: "rgba(255,255,255,0.82)",
          backdropFilter: "saturate(180%) blur(18px)",
          WebkitBackdropFilter: "saturate(180%) blur(18px)",
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div
            className="rounded-3xl p-7 relative overflow-hidden"
            style={{
              background: "linear-gradient(120deg,#0f172a 0%,#1e293b 55%,#334155 100%)",
              boxShadow: "0 12px 40px -8px rgba(15,23,42,0.35)",
            }}
          >
            <div
              className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-20 pointer-events-none"
              style={{ background: "radial-gradient(circle,#c7d2fe,transparent 70%)" }}
            />
            <div className="relative z-10 flex items-center justify-between gap-6 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <WalletIcon size={14} className="text-indigo-200" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">
                    Your Wallet
                  </span>
                </div>
                <h1 className="text-2xl font-black text-white mb-1">Wallet Balance</h1>
                <p className="text-indigo-200 text-sm font-medium">
                  Earnings from completed work
                </p>

                {lastUpdated && (
                  <div className="flex items-center gap-2 mt-3 text-[11px] text-indigo-200">
                    <CalendarClock size={12} />
                    <span>Updated {lastUpdated}</span>
                  </div>
                )}
              </div>

              <div className="rounded-2xl px-5 py-3 text-center" style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(6px)" }}>
                <p className="text-[10px] font-black uppercase tracking-wide text-indigo-200">Balance</p>
                <p className="text-3xl font-black text-white">
                  {loading ? "₹ —" : `₹${Number(balance || 0).toLocaleString("en-IN")}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-3xl shimmer-skel border border-slate-100" />
          ))
        ) : error ? (
          <div className="rounded-3xl border border-dashed border-red-200 bg-white/60 p-14 text-center">
            <p className="font-extrabold text-slate-600 mb-1">Unable to load wallet</p>
            <p className="text-xs text-slate-400">{error}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-14 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "linear-gradient(135deg,#e0e7ff,#c7d2fe)" }}>
              <WalletIcon size={26} className="text-indigo-400" />
            </div>
            <p className="text-slate-700 font-extrabold text-sm mb-1">No transactions yet</p>
            <p className="text-slate-400 text-xs font-medium">Complete jobs to see wallet credits.</p>
          </div>
        ) : (
          transactions.map((txn, idx) => {
            const amount = Number(txn.netAmount ?? txn.amount ?? 0);
            const isDebit = amount < 0;
            const timeLabel = txn.createdAt
              ? new Date(txn.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "";

            return (
              <div
                key={txn._id || `${txn.createdAt}-${idx}`}
                className="fade-up bg-white rounded-3xl border border-slate-100 p-5"
                style={{ boxShadow: "0 2px 16px -4px rgba(30,58,138,0.07)", animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isDebit
                          ? "bg-rose-50 border border-rose-100 text-rose-500"
                          : "bg-emerald-50 border border-emerald-100 text-emerald-500"
                      }`}
                    >
                      <ArrowDownLeft size={18} />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">
                        {isDebit ? "Cash Fee" : "Work Credit"}
                      </p>
                      <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest">
                        {txn.method || txn.type || (isDebit ? "Cash" : "Wallet")}
                      </p>
                      {timeLabel && (
                        <p className="text-[11px] text-slate-300 font-medium mt-0.5">{timeLabel}</p>
                      )}
                    </div>
                  </div>

                  <div
                    className={`text-sm font-black ${
                      isDebit ? "text-rose-600" : "text-emerald-600"
                    }`}
                  >
                    {isDebit ? "-" : "+"}₹{Math.abs(amount).toLocaleString("en-IN")}
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
