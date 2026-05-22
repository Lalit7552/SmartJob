import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import { fetchEmployerProfile } from "../../api/employerApi";
import { fetchChatMessages, fetchChatThreads, getSocketUrl } from "../../api/chatApi";
import { Send, MessageCircle, Wifi, WifiOff, ChevronRight, Zap } from "lucide-react";

function buildClientId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function EmployeeChats() {
  const [employer, setEmployer]           = useState(null);
  const [threads, setThreads]             = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [messages, setMessages]           = useState([]);
  const [input, setInput]                 = useState("");
  const [loading, setLoading]             = useState(false);
  const [socketError, setSocketError]     = useState("");
  const [searchParams, setSearchParams]   = useSearchParams();
  const employerId = employer?.id || employer?._id;

  const socketRef    = useRef(null);
  const bottomRef    = useRef(null);
  const messagesRef  = useRef(null);
  const employerIdRef = useRef(null);
  const workerIdRef  = useRef(null);

  const workerList = useMemo(() => {
    const workerId = searchParams.get("workerId");
    const list = (threads || []).map((thread) => ({
      id: thread.workerId,
      profile: { fullName: thread.fullName || "Worker", city: thread.city || "" },
      lastMessage: thread.lastMessage || null,
    }));
    if (!workerId) return list;
    const found = list.find((w) => String(w.id) === String(workerId));
    if (!found) {
      return [{ id: workerId, profile: { fullName: "Worker", city: "" }, lastMessage: null }, ...list];
    }
    return list;
  }, [threads, searchParams]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const profileRes = await fetchEmployerProfile();
        setEmployer(profileRes?.data?.user || null);
      } catch (err) {
        console.error("Employer chat load error:", err);
        setEmployer(null);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const loadThreads = async () => {
      try {
        const res = await fetchChatThreads({ role: "employer" });
        setThreads(res?.data?.threads || []);
      } catch (err) {
        console.error("Chat threads load error:", err);
        setThreads([]);
      }
    };
    loadThreads();
  }, []);

  useEffect(() => {
    const workerId = searchParams.get("workerId");
    if (!workerId || workerList.length === 0) return;
    const foundWorker = workerList.find((w) => String(w.id) === String(workerId));
    if (foundWorker && (!selectedWorker || String(selectedWorker.id) !== String(workerId))) {
      setSelectedWorker(foundWorker);
    }
  }, [workerList, searchParams, selectedWorker]);

  useEffect(() => {
    const token = localStorage.getItem("employerAuthToken");
    if (!token) return;
    const socket = io(getSocketUrl(), { auth: { token } });
    socketRef.current = socket;
    socket.on("connect_error", (err) => setSocketError(err?.message || "Socket connection failed"));
    socket.on("chat:new", (msg) => {
      const currentEmployerId = employerIdRef.current;
      if (!currentEmployerId || String(msg.employerId) !== String(currentEmployerId)) return;
      setThreads((prev) => {
        const lastMessage = { text: msg.text, createdAt: msg.createdAt, senderRole: msg.senderRole };
        const existingIndex = prev.findIndex((t) => String(t.workerId) === String(msg.workerId));
        if (existingIndex >= 0) {
          const updated = { ...prev[existingIndex], lastMessage };
          return [updated, ...prev.filter((_, idx) => idx !== existingIndex)];
        }
        return [{ workerId: msg.workerId, fullName: "Worker", city: "", lastMessage }, ...prev];
      });
      const currentWorkerId = workerIdRef.current;
      if (!currentWorkerId || String(msg.workerId) !== String(currentWorkerId)) return;
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

  useEffect(() => { employerIdRef.current = employerId || null; }, [employerId]);
  useEffect(() => { workerIdRef.current = selectedWorker?.id || null; }, [selectedWorker?.id]);

  useEffect(() => {
    if (!selectedWorker || !employerId) return;
    const loadMessages = async () => {
      try {
        setLoading(true);
        setMessages([]);
        const res = await fetchChatMessages({ workerId: selectedWorker.id, employerId, role: "employer" });
        const allMessages = res?.data?.messages || [];
        setMessages(allMessages.filter(
          (m) => String(m.workerId) === String(selectedWorker.id) && String(m.employerId) === String(employerId)
        ));
      } catch (err) {
        console.error("Chat history load error:", err);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    loadMessages();
    socketRef.current?.emit("chat:join", { workerId: selectedWorker.id, employerId });
  }, [selectedWorker, employerId]);

  useEffect(() => {
    if (!messagesRef.current) return;
    const el = messagesRef.current;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [messages, selectedWorker]);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed || !selectedWorker || !employerId) return;
    const clientId = buildClientId();
    const optimistic = {
      id: clientId, clientId,
      workerId: selectedWorker.id, employerId,
      senderRole: "employer", senderId: employerId,
      text: trimmed, createdAt: new Date().toISOString(), pending: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setThreads((prev) => {
      const lastMessage = { text: trimmed, createdAt: optimistic.createdAt, senderRole: "employer" };
      const idx = prev.findIndex((t) => String(t.workerId) === String(selectedWorker.id));
      if (idx >= 0) {
        const updated = { ...prev[idx], lastMessage };
        return [updated, ...prev.filter((_, i) => i !== idx)];
      }
      return [{ workerId: selectedWorker.id, fullName: selectedWorker.profile?.fullName || "Worker", city: selectedWorker.profile?.city || "", lastMessage }, ...prev];
    });
    socketRef.current?.emit("chat:send", { workerId: selectedWorker.id, employerId, text: trimmed, clientId });
    setInput("");
  };

  // Helpers
  const initials = (name) => (name || "W").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const avatarGradient = (str) => {
    const n = [...(str || "W")].reduce((a, c) => a + c.charCodeAt(0), 0);
    return `linear-gradient(135deg,hsl(${(n * 47) % 360},65%,45%),hsl(${(n * 47 + 30) % 360},60%,35%))`;
  };

  return (
    <div
      className="flex flex-col h-full min-h-screen"
      style={{
        fontFamily: "'Sora', sans-serif",
        background: "linear-gradient(135deg,#f0f4ff 0%,#f8fafc 55%,#eff6ff 100%)",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes msgIn { from{opacity:0;transform:translateY(8px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        .fade-up { animation: fadeUp .32s ease both; }
        .msg-in  { animation: msgIn .20s ease both; }
        .shimmer-dark {
          background: linear-gradient(90deg,#1e293b 25%,#273549 50%,#1e293b 75%);
          background-size:400px 100%;
          animation: shimmer 1.4s infinite linear;
        }
        .thread-btn { transition: background .15s, border-color .15s; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 8px; }
      `}</style>

      {/* ── TOP HEADER ── */}
      <header
        className="shrink-0 flex items-center justify-between px-5 py-3.5"
        style={{
          background: "#ffffff",
          backdropFilter: "saturate(180%) blur(18px)",
          WebkitBackdropFilter: "saturate(180%) blur(18px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shadow"
            style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)" }}
          >
            <Zap size={15} className="text-white" fill="white" />
          </div>
          <div>
            <p className="text-[13px] font-black text-white tracking-tight leading-none">
              Employer<span style={{ color: "#60a5fa" }}>Hub</span>
            </p>
            <p className="text-[9px] font-bold uppercase" style={{ color: "#334155", letterSpacing: "1.5px" }}>
              Employer Chats
            </p>
          </div>
        </div>

       
      </header>

      {/* ── BODY ── */}
      <div
        className="flex-1 grid grid-cols-1 lg:grid-cols-[290px_1fr] gap-3 p-3 sm:p-4 min-h-0 overflow-hidden"
        style={{ height: "calc(100vh - 60px - 76px)" }}
      >

        {/* ── THREAD SIDEBAR ── */}
        <div
          className="flex flex-col rounded-2xl overflow-hidden"
          style={{ background: "#ffffff", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          {/* Header */}
          <div className="px-4 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center gap-2">
              <MessageCircle size={14} style={{ color: "#60a5fa" }} />
              <h2 className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#475569" }}>
                Workers
              </h2>
            </div>
            <p className="text-[10px] font-medium mt-0.5" style={{ color: "#334155" }}>
              {workerList.length} worker{workerList.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
            {workerList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2">
                <MessageCircle size={26} style={{ color: "#1e293b" }} />
                <p className="text-[11px] font-medium" style={{ color: "#334155" }}>No workers yet</p>
              </div>
            ) : (
              workerList.map((w, idx) => {
                const active  = selectedWorker?.id === w.id;
                const preview = w.lastMessage?.text || "No messages yet";
                const timeAgo = w.lastMessage?.createdAt
                  ? new Date(w.lastMessage.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                  : "";

                return (
                  <button
                    key={w.id}
                    onClick={() => {
                      setSelectedWorker(w);
                      setSearchParams((prev) => {
                        const next = new URLSearchParams(prev);
                        next.set("workerId", w.id);
                        return next;
                      });
                    }}
                    className="thread-btn w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 fade-up"
                    style={{
                      animationDelay: `${idx * 0.05}s`,
                      background: active ? "rgba(37,99,235,0.14)" : "rgba(255,255,255,0.02)",
                      border: active ? "1px solid rgba(96,165,250,0.25)" : "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    {/* Avatar */}
                    <div
                      className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-xs font-black text-white shadow"
                      style={{ background: avatarGradient(w.profile?.fullName) }}
                    >
                      {initials(w.profile?.fullName)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className="text-sm font-bold truncate"
                          style={{ color: active ? "#93c5fd" : "#94a3b8" }}
                        >
                          {w.profile?.fullName || "Worker"}
                        </span>
                        {timeAgo && (
                          <span className="text-[9px] shrink-0" style={{ color: "#334155" }}>{timeAgo}</span>
                        )}
                      </div>
                      <p className="text-[11px] truncate font-medium mt-0.5" style={{ color: "#334155" }}>
                        {preview}
                      </p>
                    </div>

                    {active && <ChevronRight size={12} style={{ color: "#60a5fa" }} className="shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── CHAT PANEL ── */}
        <div
          className="flex flex-col rounded-2xl overflow-hidden"
          style={{ background: "#ffffff", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          {/* Chat Header */}
          <div
            className="px-5 py-3.5 flex items-center gap-3 shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            {selectedWorker ? (
              <>
                <div
                  className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-xs font-black text-white shadow"
                  style={{ background: avatarGradient(selectedWorker.profile?.fullName) }}
                >
                  {initials(selectedWorker.profile?.fullName)}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{selectedWorker.profile?.fullName || "Worker"}</p>
                  <p className="text-[10px] font-bold flex items-center gap-1" style={{ color: "#34d399" }}>
                    <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#34d399" }} />
                    Online · Chat active
                  </p>
                </div>
              </>
            ) : (
              <div>
                <p className="text-sm font-bold" style={{ color: "#475569" }}>Select a conversation</p>
                <p className="text-[10px] font-medium" style={{ color: "#334155" }}>Choose a worker from the left</p>
              </div>
            )}
          </div>

          {/* Messages */}
          <div ref={messagesRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {loading ? (
              <div className="space-y-3 pt-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                    <div className={`h-10 rounded-2xl shimmer-dark ${i % 2 === 0 ? "w-48" : "w-36"}`} />
                  </div>
                ))}
              </div>
            ) : !selectedWorker ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(37,99,235,0.10)", border: "1px solid rgba(96,165,250,0.12)" }}
                >
                  <MessageCircle size={24} style={{ color: "#1e3a5f" }} />
                </div>
                <p className="text-sm font-bold" style={{ color: "#334155" }}>No chat selected</p>
                <p className="text-xs font-medium" style={{ color: "#1e293b" }}>Pick a worker to start chatting</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(37,99,235,0.10)", border: "1px solid rgba(96,165,250,0.12)" }}
                >
                  <MessageCircle size={24} style={{ color: "#1e3a5f" }} />
                </div>
                <p className="text-sm font-bold" style={{ color: "#334155" }}>No messages yet</p>
                <p className="text-xs font-medium" style={{ color: "#1e293b" }}>Send a message to get started</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = msg.senderRole === "employer";
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
                        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
                        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#334155" }}>
                          {new Date(msg.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
                      </div>
                    )}

                    <div className={`flex msg-in ${isMe ? "justify-end" : "justify-start"}`}>
                      {!isMe && (
                        <div
                          className="w-7 h-7 rounded-xl shrink-0 flex items-center justify-center text-[10px] font-black text-white mr-2 self-end mb-1"
                          style={{ background: avatarGradient(selectedWorker?.profile?.fullName) }}
                        >
                          {initials(selectedWorker?.profile?.fullName)}
                        </div>
                      )}

                      <div
                        className={`max-w-[72%] rounded-2xl px-4 py-3 text-sm ${msg.pending ? "opacity-60" : ""}`}
                        style={isMe ? {
                          background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
                          borderBottomRightRadius: "4px",
                          color: "white",
                        } : {
                          background: "#131c2e",
                          border: "1px solid rgba(255,255,255,0.06)",
                          borderBottomLeftRadius: "4px",
                          color: "#cbd5e1",
                        }}
                      >
                        <p className="leading-relaxed">{msg.text}</p>
                        <p
                          className="text-[9px] mt-1.5 font-semibold"
                          style={{ color: isMe ? "rgba(191,219,254,0.7)" : "#334155" }}
                        >
                          {timeLabel}{msg.pending ? " · Sending" : ""}
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
          <div className="px-4 py-3 shrink-0" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
            <div
              className="flex items-center gap-2 rounded-xl px-4 py-2 transition-all"
              style={{
                background: "#0f172a",
                border: input ? "1px solid rgba(30,64,175,0.35)" : "1px solid rgba(15,23,42,0.35)",
                boxShadow: input ? "0 0 0 3px rgba(30,64,175,0.15)" : "none",
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={selectedWorker ? "Type a message…" : "Select a worker first"}
                className="flex-1 bg-transparent text-sm outline-none font-medium py-1"
                style={{ color: "#e2e8f0", caretColor: "#93c5fd" }}
                disabled={!selectedWorker}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              />
              <button
                onClick={sendMessage}
                disabled={!selectedWorker || !input.trim()}
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-90 disabled:opacity-25"
                style={{
                  background: input.trim() && selectedWorker
                    ? "linear-gradient(135deg,#0f172a,#1e293b)"
                    : "rgba(15,23,42,0.25)",
                }}
              >
                <Send size={15} style={{ color: input.trim() && selectedWorker ? "#e2e8f0" : "#94a3b8" }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
