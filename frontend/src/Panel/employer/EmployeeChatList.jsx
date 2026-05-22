import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, ChevronRight, Search } from "lucide-react";
import { fetchChatThreads } from "../../api/chatApi";

export default function EmployeeChatList() {
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let alive = true;
    const loadThreads = async () => {
      try {
        setLoading(true);
        const res = await fetchChatThreads({ role: "employer" });
        if (alive) setThreads(res?.data?.threads || []);
      } catch {
        if (alive) setThreads([]);
      } finally {
        if (alive) setLoading(false);
      }
    };
    loadThreads();
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter((t) =>
      String(t?.fullName || "Worker").toLowerCase().includes(q)
    );
  }, [threads, query]);

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(135deg,#f0f4ff 0%,#f8fafc 55%,#eff6ff 100%)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
      `}</style>

      <div className="max-w-5xl mx-auto px-5 pt-10 pb-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Chats</h1>
            <p className="text-xs text-slate-400 font-semibold mt-1">
              Your recent conversations
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
            <Search size={14} className="text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name"
              className="text-sm outline-none bg-transparent text-slate-700 placeholder-slate-400"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-28">
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-sm font-semibold">
            Loading chats...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-16 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "linear-gradient(135deg,#eff6ff,#dbeafe)" }}>
              <MessageCircle size={24} className="text-blue-300" />
            </div>
            <p className="text-slate-700 font-extrabold text-base mb-1">No conversations yet</p>
            <p className="text-slate-400 text-xs font-medium">
              Start a chat from any worker card.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((t) => {
              const workerId = t.workerId;
              const name = t.fullName || "Worker";
              const last = t.lastMessage?.text || "No messages yet";
              const time = t.lastMessage?.createdAt
                ? new Date(t.lastMessage.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                : "";
              return (
                <button
                  key={workerId}
                  onClick={() => navigate(`/employee/chat/${workerId}`)}
                  className="w-full text-left bg-white border border-slate-100 rounded-2xl px-4 py-4 flex items-center gap-3 hover:border-blue-200 hover:shadow-sm transition-all"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white"
                    style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)" }}
                  >
                    {name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-extrabold text-slate-900 truncate">{name}</p>
                      {time && <span className="text-[10px] text-slate-400 font-semibold">{time}</span>}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-1">{last}</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
