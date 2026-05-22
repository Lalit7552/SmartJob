require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

require("./config/cloudinary");
const workerRoutes = require("./routes/worker");
const employerRoutes = require("./routes/employer");
const adminRoutes = require("./routes/admin");
const chatRoutes = require("./routes/chat");
const { errorHandler } = require("./middleware/errorHandler");
const { verifySessionToken } = require("./utils/sessionAuth");
const ChatMessage = require("./models/ChatMessage");
const Enquiry = require("./models/Enquiry");
const { formatMessage } = require("./controllers/chatController");

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: true,
    credentials: true,
  },
});

/* Middlewares */
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));

/* ✅ Upload folder public karo */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* MongoDB Connection */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log("MongoDB Error:", err);
  });

/* Test Route */
app.get("/", (req, res) => {
  res.send("API Running...");
});

/* Routes */
app.use("/api/worker", workerRoutes);
app.use("/api/employer", employerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);

/* Error handler */
app.use(errorHandler);

/* Port */
const PORT = process.env.PORT || 5000;

io.use(async (socket, next) => {
  try {
    const authHeader = socket.handshake.headers?.authorization || "";
    const headerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.query?.token ||
      headerToken;
    const result = await verifySessionToken({ token, kind: "auth" });
    socket.data.actor = result.actor;
    socket.data.user = result.user;
    socket.data.userId = result.user._id.toString();
    return next();
  } catch (err) {
    const e = new Error(err?.message || "Unauthorized");
    e.data = { code: err?.code || "AUTH_INVALID" };
    return next(e);
  }
});

io.on("connection", (socket) => {
  socket.data.activeJobs = socket.data.activeJobs || {};
  socket.data.activeJobChecks = socket.data.activeJobChecks || {};

  socket.on("chat:join", ({ workerId, employerId } = {}) => {
    if (!workerId || !employerId) return;
    if (socket.data.actor === "worker" && socket.data.userId !== String(workerId)) return;
    if (socket.data.actor === "employer" && socket.data.userId !== String(employerId)) return;
    const room = `chat:${workerId}:${employerId}`;
    socket.join(room);
  });

  socket.on("chat:send", async ({ workerId, employerId, text, clientId } = {}) => {
    try {
      if (!workerId || !employerId) return;
      if (socket.data.actor === "worker" && socket.data.userId !== String(workerId)) return;
      if (socket.data.actor === "employer" && socket.data.userId !== String(employerId)) return;
      const trimmed = String(text || "").trim();
      if (!trimmed) return;

      const msg = await ChatMessage.create({
        workerId,
        employerId,
        senderRole: socket.data.actor,
        senderId: socket.data.userId,
        text: trimmed,
        clientId,
      });
      const room = `chat:${workerId}:${employerId}`;
      io.to(room).emit("chat:new", formatMessage(msg));
    } catch (err) {
      socket.emit("chat:error", { message: err?.message || "Failed to send message" });
    }
  });

  socket.on("job:join", async ({ jobId } = {}) => {
    try {
      const safeJobId = String(jobId || "");
      if (!mongoose.isValidObjectId(safeJobId)) return;
      const active = await ensureActiveJob({ socket, jobId: safeJobId });
      if (!active) {
        socket.emit("job:error", { message: "Job not active" });
        return;
      }
      const room = `job:${safeJobId}`;
      socket.join(room);
      socket.data.activeJobs[safeJobId] = true;
      socket.data.activeJobChecks[safeJobId] = Date.now();
      socket.emit("job:joined", { jobId: safeJobId });
    } catch (err) {
      socket.emit("job:error", { message: err?.message || "Unable to join job room" });
    }
  });

  socket.on("job:leave", ({ jobId } = {}) => {
    const safeJobId = String(jobId || "");
    if (!safeJobId) return;
    const room = `job:${safeJobId}`;
    socket.leave(room);
    delete socket.data.activeJobs[safeJobId];
    delete socket.data.activeJobChecks[safeJobId];
  });

  socket.on("job:location", async ({ jobId, lat, lng, accuracy, heading, speed, ts } = {}) => {
    try {
      const safeJobId = String(jobId || "");
      if (!mongoose.isValidObjectId(safeJobId)) return;
      if (!socket.data.activeJobs[safeJobId]) return;

      const now = Date.now();
      const lastCheck = socket.data.activeJobChecks[safeJobId] || 0;
      if (now - lastCheck > 8000) {
        const active = await ensureActiveJob({ socket, jobId: safeJobId });
        socket.data.activeJobChecks[safeJobId] = now;
        if (!active) {
          const room = `job:${safeJobId}`;
          socket.leave(room);
          delete socket.data.activeJobs[safeJobId];
          socket.emit("job:stopped", { jobId: safeJobId, reason: "job_inactive" });
          return;
        }
      }

      const latitude = Number(lat);
      const longitude = Number(lng);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

      const payload = {
        jobId: safeJobId,
        actor: socket.data.actor,
        userId: socket.data.userId,
        lat: latitude,
        lng: longitude,
        accuracy: Number.isFinite(accuracy) ? Number(accuracy) : null,
        heading: Number.isFinite(heading) ? Number(heading) : null,
        speed: Number.isFinite(speed) ? Number(speed) : null,
        ts: Number.isFinite(ts) ? Number(ts) : Date.now(),
      };
      const room = `job:${safeJobId}`;
      socket.to(room).emit("job:location", payload);
    } catch (err) {
      socket.emit("job:error", { message: err?.message || "Failed to send location" });
    }
  });
});

async function ensureActiveJob({ socket, jobId }) {
  const base = { jobId, workStatus: "in_progress" };
  if (socket.data.actor === "worker") {
    base.workerId = socket.data.userId;
  } else if (socket.data.actor === "employer") {
    base.employerId = socket.data.userId;
  } else {
    return false;
  }
  const enquiry = await Enquiry.findOne(base).select("_id").lean();
  return Boolean(enquiry);
}

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
