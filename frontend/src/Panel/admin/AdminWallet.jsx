import { useEffect, useState } from "react";
import { fetchAdminWallet } from "../../api/adminApi";
import { Wallet, ArrowUpRight, TrendingUp } from "lucide-react";

export default function AdminWallet() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchAdminWallet();
        setBalance(res?.data?.balance || 0);
        setTransactions(res?.data?.transactions || []);
      } catch (err) {
        console.error("Admin wallet load failed", err);
        setBalance(0);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="font-['Sora',sans-serif] text-white">

      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Admin{" "}
          <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            Wallet
          </span>
        </h1>
        <p className="text-[11px] font-semibold text-slate-500 tracking-[1.5px] uppercase mt-1">
          Platform fees &amp; summary
        </p>
      </div>

      <div className="space-y-5 max-w-3xl">

        {/* ── Balance Card ── */}
        <div className="relative bg-[#13131f] border border-white/5 rounded-2xl p-6 overflow-hidden
                        flex items-center justify-between">

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[2px] text-slate-500 mb-2">
              Total Platform Fees
            </p>
            <p className="text-4xl sm:text-5xl font-extrabold tracking-tighter text-white">
              {loading ? (
                <span className="text-slate-600 animate-pulse">₹ —</span>
              ) : (
                <>₹{balance.toLocaleString("en-IN")}</>
              )}
            </p>
            <div className="flex items-center gap-1.5 mt-3">
              <TrendingUp size={12} className="text-emerald-400" />
              <span className="text-[11px] font-bold text-emerald-400">
                {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20
                          flex items-center justify-center text-violet-400 shrink-0">
            <Wallet size={28} strokeWidth={1.8} />
          </div>

          {/* Decorative bg */}
          <div className="absolute -right-6 -bottom-6 opacity-[0.04]">
            <Wallet size={120} strokeWidth={1} />
          </div>
        </div>

        {/* ── Transactions List ── */}
        <div className="bg-[#13131f] border border-white/5 rounded-2xl p-5">

          <h2 className="text-[11px] font-bold uppercase tracking-[2px] text-slate-500 mb-5">
            Recent Fees
          </h2>

          {loading ? (
            <div className="flex items-center gap-3 py-10 justify-center">
              <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 mx-auto
                              flex items-center justify-center text-slate-600 mb-3">
                <Wallet size={20} strokeWidth={1.5} />
              </div>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">
                No transactions yet
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((txn) => (
                <div
                  key={txn._id || `${txn.createdAt}-${txn.netAmount}`}
                  className="flex items-center justify-between bg-[#0e0e1a] border border-white/5
                             rounded-xl px-4 py-3 hover:border-violet-500/20 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">

                    {/* Dot icon */}
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20
                                    flex items-center justify-center text-emerald-400 shrink-0">
                      <ArrowUpRight size={16} />
                    </div>

                    <div>
                      <p className="text-[12px] font-black text-white uppercase tracking-wide">
                        Platform Fee
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">
                        {txn.method || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="text-sm font-black text-emerald-400">
                    +₹{Math.abs(txn.netAmount || 0).toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}