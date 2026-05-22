import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { fetchWorkerProfile } from "../../api/workerApi";
import { fetchChatMessages, fetchChatThreads, getSocketUrl } from "../../api/chatApi";
import { useSearchParams } from "react-router-dom";
import { Send, Zap, MessageCircle, Wifi, WifiOff, ChevronRight } from "lucide-react";

function buildClientId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function WorkerChat() {
  const [worker, setWorker] = useState(null);
  const [threads, setThreads] = useState([]);
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [socketError, setSocketError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const workerId = worker?.id || worker?._id;

  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const messagesRef = useRef(null);
  const workerIdRef = useRef(null);
  const employerIdRef = useRef(null);

  const employers = useMemo(() => {
    const employerId = searchParams.get("employerId");
    const list = (threads || []).map((thread) => ({
      employerId: thread.employerId,
      contactName: thread.contactName || "Employer",
      city: thread.city || "",
      lastMessage: thread.lastMessage || null,
    }));
    if (!employerId) return list;
    const found = list.find((e) => String(e.employerId) === String(employerId));
    if (!found) {
      return [{ employerId, contactName: "Employer", city: "", lastMessage: null }, ...list];
    }
    return list;
  }, [threads, searchParams]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const profileRes = await fetchWorkerProfile();
        setWorker(profileRes?.data?.user || null);
      } catch (err) {
        console.error("Worker chat load error:", err);
        setWorker(null);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const loadThreads = async () => {
      try {
        const res = await fetchChatThreads({ role: "worker" });
        setThreads(res?.data?.threads || []);
      } catch (err) {
        setThreads([]);
      }
    };
    loadThreads();
  }, []);

  useEffect(() => {
    const employerId = searchParams.get("employerId");
    if (!employerId || employers.length === 0) return;
    const found = employers.find((e) => String(e.employerId) === String(employerId));
    if (found && (!selectedEmployer || String(selectedEmployer.employerId) !== String(employerId))) {
      setSelectedEmployer(found);
    }
  }, [employers, searchParams, selectedEmployer]);

  useEffect(() => {
    const token = localStorage.getItem("workerAuthToken");
    if (!token) return;
    const socket = io(getSocketUrl(), { auth: { token } });
    socketRef.current = socket;
    socket.on("connect_error", (err) => setSocketError(err?.message || "Socket connection failed"));
    socket.on("chat:new", (msg) => {
      const currentWorkerId = workerIdRef.current;
      if (!currentWorkerId || String(msg.workerId) !== String(currentWorkerId)) return;
      setThreads((prev) => {
        const lastMessage = { text: msg.text, createdAt: msg.createdAt, senderRole: msg.senderRole };
        const existingIndex = prev.findIndex((t) => String(t.employerId) === String(msg.employerId));
        if (existingIndex >= 0) {
          const updated = { ...prev[existingIndex], lastMessage };
          const without = prev.filter((_, idx) => idx !== existingIndex);
          return [updated, ...without];
        }
        return [{ employerId: msg.employerId, contactName: "Employer", city: "", lastMessage }, ...prev];
      });
      const currentEmployerId = employerIdRef.current;
      if (!currentEmployerId || String(msg.employerId) !== String(currentEmployerId)) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        if (msg.clientId) {
          const idx = prev.findIndex((m) => m.clientId === msg.clientId);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], ...msg, pending: false };
            return next;
          }
        }
        return [...prev, msg];
      });
    });
    return () => socket.disconnect();
  }, []);

  useEffect(() => { workerIdRef.current = worker?.id || worker?._id || null; }, [worker?.id, worker?._id]);
  useEffect(() => { employerIdRef.current = selectedEmployer?.employerId || null; }, [selectedEmployer?.employerId]);

  useEffect(() => {
    if (!selectedEmployer || !workerId) return;
    const loadMessages = async () => {
      try {
        setLoading(true);
        setMessages([]);
        const res = await fetchChatMessages({ workerId, employerId: selectedEmployer.employerId, role: "worker" });
        const allMessages = res?.data?.messages || [];
        setMessages(allMessages.filter(
          (m) => String(m.workerId) === String(workerId) && String(m.employerId) === String(selectedEmployer.employerId)
        ));
      } catch (err) {
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    loadMessages();
    socketRef.current?.emit("chat:join", { workerId, employerId: selectedEmployer.employerId });
  }, [selectedEmployer, workerId]);

  useEffect(() => {
    if (!messagesRef.current) return;
    const el = messagesRef.current;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [messages, selectedEmployer]);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed || !selectedEmployer || !workerId) return;
    const clientId = buildClientId();
    const optimistic = {
      id: clientId, clientId, workerId,
      employerId: selectedEmployer.employerId,
      senderRole: "worker", senderId: workerId,
      text: trimmed, createdAt: new Date().toISOString(), pending: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setThreads((prev) => {
      const lastMessage = { text: trimmed, createdAt: optimistic.createdAt, senderRole: "worker" };
      const idx = prev.findIndex((t) => String(t.employerId) === String(selectedEmployer.employerId));
      if (idx >= 0) {
        const updated = { ...prev[idx], lastMessage };
        return [updated, ...prev.filter((_, i) => i !== idx)];
      }
      return [{ employerId: selectedEmployer.employerId, contactName: selectedEmployer.contactName || "Employer", city: selectedEmployer.city || "", lastMessage }, ...prev];
    });
    socketRef.current?.emit("chat:send", { workerId, employerId: selectedEmployer.employerId, text: trimmed, clientId });
    setInput("");
  };

  // Initials helper
  const initials = (name) => (name || "E").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const avatarGradient = (str) => {
    const n = [...(str || "E")].reduce((a, c) => a + c.charCodeAt(0), 0);
    return `linear-gradient(135deg,hsl(${(n * 47) % 360},65%,50%),hsl(${(n * 47 + 30) % 360},60%,40%))`;
  };

  return (
    <div
      className="flex flex-col h-full min-h-screen"
      style={{ fontFamily: "'DM Sans', sans-serif", background: "linear-gradient(135deg,#f0f4ff 0%,#f8fafc 55%,#eff6ff 100%)" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes msgIn { from{opacity:0;transform:translateY(8px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        .fade-up { animation: fadeUp .35s ease both; }
        .msg-in  { animation: msgIn .22s ease both; }
        .shimmer-skel {
          background:linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%);
          background-size:400px 100%;
          animation:shimmer 1.4s infinite linear;
        }
        .thread-btn { transition: background .18s, border-color .18s, box-shadow .18s; }
        .thread-btn:hover { box-shadow: 0 4px 16px -4px rgba(37,99,235,0.12); }
        .send-btn { transition: background .15s, transform .12s; }
        .send-btn:not(:disabled):hover { background: #1d4ed8; }
        .send-btn:not(:disabled):active { transform: scale(.93); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 8px; }
      `}</style>

      {/* ── TOP HEADER ── */}
      <header
        className="shrink-0 border-b border-slate-200/70 px-6 py-4 flex items-center justify-between"
        style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "saturate(180%) blur(18px)", WebkitBackdropFilter: "saturate(180%) blur(18px)" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow" style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)" }}>
            <Zap size={15} className="text-white" fill="white" />
          </div>
          <span className="text-base font-black tracking-[-0.04em]">
            <span className="text-blue-600">WORKER</span><span className="text-slate-800">PRO</span>
          </span>
        </div>

       
      </header>

      {/* ── BODY ── */}
      <div
        className="flex-1 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 p-4 sm:p-6 pb-6 min-h-0 overflow-hidden"
        style={{ height: "calc(100vh - 68px - var(--worker-bottombar-h))" }}
      >

        {/* ── SIDEBAR ── */}
        <div
          className="flex flex-col rounded-3xl border border-slate-100 overflow-hidden"
          style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", boxShadow: "0 4px 24px -6px rgba(30,58,138,0.07)" }}
        >
          {/* Sidebar Header */}
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MessageCircle size={15} className="text-blue-500" />
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Conversations</h2>
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{employers.length} employer{employers.length !== 1 ? "s" : ""}</p>
          </div>

          {/* Thread list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {employers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-slate-400 text-xs font-medium">
                <MessageCircle size={28} className="mb-2 opacity-20" />
                No conversations yet
              </div>
            ) : (
              employers.map((emp, idx) => {
                const active = selectedEmployer?.employerId === emp.employerId;
                const preview = emp.lastMessage?.text || "No messages yet";
                const timeAgo = emp.lastMessage?.createdAt
                  ? new Date(emp.lastMessage.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                  : "";

                return (
                  <button
                    key={emp.employerId}
                    onClick={() => {
                      setSelectedEmployer(emp);
                      setSearchParams((prev) => {
                        const next = new URLSearchParams(prev);
                        next.set("employerId", emp.employerId);
                        return next;
                      });
                    }}
                    className={`thread-btn w-full text-left px-3.5 py-3 rounded-2xl border flex items-center gap-3 fade-up ${
                      active
                        ? "border-blue-200 bg-blue-50 shadow-sm shadow-blue-100"
                        : "border-slate-100 bg-white hover:border-blue-100 hover:bg-slate-50"
                    }`}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    {/* Avatar */}
                    <div
                      className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-xs font-black text-white shadow"
                      style={{ background: avatarGradient(emp.contactName) }}
                    >
                      {initials(emp.contactName)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-sm font-extrabold truncate ${active ? "text-blue-700" : "text-slate-800"}`}>
                          {emp.contactName}
                        </span>
                        {timeAgo && <span className="text-[9px] text-slate-400 shrink-0">{timeAgo}</span>}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate font-medium mt-0.5">
                        {preview}{emp.city ? ` · ${emp.city}` : ""}
                      </p>
                    </div>

                    {active && <ChevronRight size={13} className="text-blue-400 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── CHAT PANEL ── */}
        <div
          className="flex flex-col rounded-3xl border border-slate-100 overflow-hidden"
          style={{ background: "rgba(255,255,255,0.90)", backdropFilter: "blur(12px)", boxShadow: "0 4px 24px -6px rgba(30,58,138,0.07)" }}
        >
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 shrink-0">
            {selectedEmployer ? (
              <>
                <div
                  className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-xs font-black text-white shadow"
                  style={{ background: avatarGradient(selectedEmployer.contactName) }}
                >
                  {initials(selectedEmployer.contactName)}
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-900">{selectedEmployer.contactName}</p>
                  <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    Online · Chat active
                  </p>
                </div>
              </>
            ) : (
              <div>
                <p className="text-sm font-extrabold text-slate-400">Select a conversation</p>
                <p className="text-[10px] text-slate-300 font-medium">Choose an employer from the left</p>
              </div>
            )}
          </div>

          {/* Messages */}
          <div ref={messagesRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
            {loading ? (
              <div className="space-y-3 pt-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                    <div className={`h-10 rounded-2xl shimmer-skel ${i % 2 === 0 ? "w-48" : "w-36"}`} />
                  </div>
                ))}
              </div>
            ) : !selectedEmployer ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-300">
                <MessageCircle size={48} className="mb-3 opacity-30" />
                <p className="text-sm font-bold">No chat selected</p>
                <p className="text-xs font-medium mt-1">Pick an employer to start chatting</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-300">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow"
                  style={{ background: "linear-gradient(135deg,#eff6ff,#dbeafe)" }}
                >
                  <MessageCircle size={24} className="text-blue-300" />
                </div>
                <p className="text-sm font-bold text-slate-400">No messages yet</p>
                <p className="text-xs text-slate-300 font-medium mt-1">Send a message to get started</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = msg.senderRole === "worker";
                const timeLabel = msg.createdAt
                  ? new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                  : "Sending…";
                const showDate =
                  idx === 0 ||
                  new Date(msg.createdAt).toDateString() !== new Date(messages[idx - 1]?.createdAt).toDateString();

                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div className="flex items-center gap-3 my-3">
                        <div className="flex-1 h-px bg-slate-100" />
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                          {new Date(msg.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                        <div className="flex-1 h-px bg-slate-100" />
                      </div>
                    )}
                    <div className={`flex msg-in ${isMe ? "justify-end" : "justify-start"}`}>
                      {!isMe && (
                        <div
                          className="w-7 h-7 rounded-xl shrink-0 flex items-center justify-center text-[10px] font-black text-white mr-2 self-end mb-1 shadow"
                          style={{ background: avatarGradient(selectedEmployer?.contactName) }}
                        >
                          {initials(selectedEmployer?.contactName)}
                        </div>
                      )}
                      <div
                        className={`max-w-[72%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                          isMe
                            ? "rounded-br-sm text-white"
                            : "rounded-bl-sm text-slate-800 border border-slate-100 bg-slate-50"
                        } ${msg.pending ? "opacity-70" : ""}`}
                        style={isMe ? { background: "linear-gradient(135deg,#2563eb,#1d4ed8)" } : {}}
                      >
                        <p className="leading-relaxed">{msg.text}</p>
                        <p className={`text-[9px] mt-1.5 font-semibold ${isMe ? "text-blue-200" : "text-slate-400"}`}>
                          {timeLabel} {msg.pending ? "· Sending" : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* ── INPUT BAR ── */}
          <div className="px-4 py-4 border-t border-slate-200/70 shrink-0">
            <div
              className="flex items-center gap-2 rounded-2xl border px-4 py-2 transition-all"
              style={{
                background: "#0f172a",
                borderColor: input ? "rgba(30,64,175,0.35)" : "rgba(15,23,42,0.35)",
                boxShadow: input ? "0 0 0 3px rgba(30,64,175,0.15)" : "none",
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={selectedEmployer ? "Type a message…" : "Select an employer first"}
                className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-400 outline-none font-medium py-1"
                disabled={!selectedEmployer}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              />
              <button
                onClick={sendMessage}
                disabled={!selectedEmployer || !input.trim()}
                className="send-btn w-9 h-9 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-30"
                style={{ background: input.trim() && selectedEmployer ? "linear-gradient(135deg,#0f172a,#1e293b)" : "rgba(15,23,42,0.25)" }}
              >
                <Send size={15} className={input.trim() && selectedEmployer ? "text-slate-200" : "text-slate-400"} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
