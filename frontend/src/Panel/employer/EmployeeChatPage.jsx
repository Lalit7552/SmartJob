import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { ArrowLeft, Send, MessageCircle } from "lucide-react";
import { fetchEmployerProfile } from "../../api/employerApi";
import { fetchChatMessages, fetchChatThreads, getSocketUrl } from "../../api/chatApi";

function buildClientId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function EmployeeChatPage() {
  const navigate = useNavigate();
  const { workerId } = useParams();

  const [employer, setEmployer] = useState(null);
  const [workerName, setWorkerName] = useState("Worker");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const socketRef = useRef(null);
  const messagesRef = useRef(null);

  const employerId = employer?.id || employer?._id;

  useEffect(() => {
    let alive = true;
    const loadProfile = async () => {
      try {
        const res = await fetchEmployerProfile();
        if (alive) setEmployer(res?.data?.user || res?.data?.data?.user || null);
      } catch {
        if (alive) setEmployer(null);
      }
    };
    loadProfile();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let alive = true;
    const loadThreads = async () => {
      try {
        const res = await fetchChatThreads({ role: "employer" });
        const found = (res?.data?.threads || []).find(
          (t) => String(t.workerId) === String(workerId)
        );
        if (alive) setWorkerName(found?.fullName || "Worker");
      } catch {
        if (alive) setWorkerName("Worker");
      }
    };
    loadThreads();
    return () => { alive = false; };
  }, [workerId]);

  useEffect(() => {
    const token = localStorage.getItem("employerAuthToken");
    if (!token) return;
    const socket = io(getSocketUrl(), { auth: { token } });
    socketRef.current = socket;
    socket.on("chat:new", (msg) => {
      if (String(msg.workerId) !== String(workerId)) return;
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
  }, [workerId]);

  useEffect(() => {
    if (!employerId || !workerId) return;
    const loadMessages = async () => {
      try {
        setLoading(true);
        setMessages([]);
        const res = await fetchChatMessages({ workerId, employerId, role: "employer" });
        const allMessages = res?.data?.messages || [];
        setMessages(allMessages.filter(
          (m) => String(m.workerId) === String(workerId) && String(m.employerId) === String(employerId)
        ));
      } catch {
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    loadMessages();
    socketRef.current?.emit("chat:join", { workerId, employerId });
  }, [employerId, workerId]);

  useEffect(() => {
    if (!messagesRef.current) return;
    const el = messagesRef.current;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [messages]);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed || !employerId || !workerId) return;
    const clientId = buildClientId();
    const optimistic = {
      id: clientId,
      clientId,
      workerId,
      employerId,
      senderRole: "employer",
      senderId: employerId,
      text: trimmed,
      createdAt: new Date().toISOString(),
      pending: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    socketRef.current?.emit("chat:send", { workerId, employerId, text: trimmed, clientId });
    setInput("");
  };

  const initials = useMemo(
    () => (workerName || "W").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
    [workerName]
  );

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: "linear-gradient(135deg,#f0f4ff 0%,#f8fafc 55%,#eff6ff 100%)", fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
      `}</style>

      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-black">
          {initials}
        </div>
        <div>
          <p className="text-sm font-extrabold text-slate-900">{workerName}</p>
          <p className="text-[10px] text-emerald-500 font-bold">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
        {loading ? (
          <div className="text-center text-slate-400 text-sm font-semibold">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <MessageCircle size={40} className="mb-3 opacity-30" />
            <p className="text-sm font-bold">No messages yet</p>
            <p className="text-xs font-medium mt-1">Send a message to start chatting</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderRole === "employer";
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${msg.pending ? "opacity-70" : ""}`}
                  style={isMe ? { background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "white" } : { background: "white", border: "1px solid #e2e8f0", color: "#0f172a" }}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t border-slate-200/70 bg-white">
        <div className="flex items-center gap-2 rounded-2xl border px-4 py-2" style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none font-medium py-1"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)" }}
          >
            <Send size={15} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
