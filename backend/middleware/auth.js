const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const WorkerSession = require("../models/WorkerSession");
const Worker = require("../models/Worker");
const EmployerSession = require("../models/EmployerSession");
const Employer = require("../models/Employer");

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

function requireEnv(name, fallback) {
  const v = process.env[name] || fallback;
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

function authSession({ kind, actor = "worker" }) {
  return async (req, res, next) => {
    try {
      const token = getBearerToken(req);
      if (!token) {
        return res.status(401).json({
          ok: false,
          error: { code: "AUTH_MISSING", message: "Missing Authorization bearer token" },
        });
      }

      let payload;
      try {
        payload = jwt.verify(token, requireEnv("JWT_SECRET"));
      } catch {
        return res.status(401).json({
          ok: false,
          error: { code: "AUTH_INVALID", message: "Invalid or expired token" },
        });
      }

      if (!payload?.sid || payload?.typ !== kind) {
        return res.status(401).json({
          ok: false,
          error: { code: "AUTH_INVALID", message: "Invalid session token" },
        });
      }

      if (!mongoose.isValidObjectId(payload.sid)) {
        return res.status(401).json({
          ok: false,
          error: { code: "AUTH_INVALID", message: "Invalid session token" },
        });
      }

      const actorConfig =
        actor === "employer"
          ? { Session: EmployerSession, User: Employer, sessionUserIdKey: "employerId", reqKey: "employer", notFoundLabel: "Employer" }
          : { Session: WorkerSession, User: Worker, sessionUserIdKey: "workerId", reqKey: "worker", notFoundLabel: "Worker" };

      const session = await actorConfig.Session.findById(payload.sid);
      if (!session || session.revokedAt || session.kind !== kind) {
        return res.status(401).json({
          ok: false,
          error: { code: "AUTH_INVALID", message: "Session not found or revoked" },
        });
      }
      if (session.expiresAt.getTime() <= Date.now()) {
        return res.status(401).json({
          ok: false,
          error: { code: "AUTH_EXPIRED", message: "Session expired" },
        });
      }

      const user = await actorConfig.User.findById(session[actorConfig.sessionUserIdKey]);
      if (!user) {
        return res.status(401).json({
          ok: false,
          error: { code: "AUTH_INVALID", message: `${actorConfig.notFoundLabel} not found` },
        });
      }

      req[actorConfig.reqKey] = user;
      req.session = session;
      req.tokenPayload = payload;
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = { authSession };
