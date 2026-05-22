const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const WorkerSession = require("../models/WorkerSession");
const EmployerSession = require("../models/EmployerSession");
const Worker = require("../models/Worker");
const Employer = require("../models/Employer");

function requireEnv(name, fallback) {
  const v = process.env[name] || fallback;
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

function buildAuthError(code, message, status = 401) {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  return err;
}

async function verifySessionToken({ token, kind = "auth" }) {
  if (!token) {
    throw buildAuthError("AUTH_MISSING", "Missing Authorization bearer token", 401);
  }

  let payload;
  try {
    payload = jwt.verify(token, requireEnv("JWT_SECRET"));
  } catch {
    throw buildAuthError("AUTH_INVALID", "Invalid or expired token", 401);
  }

  if (!payload?.sid || payload?.typ !== kind) {
    throw buildAuthError("AUTH_INVALID", "Invalid session token", 401);
  }

  if (!mongoose.isValidObjectId(payload.sid)) {
    throw buildAuthError("AUTH_INVALID", "Invalid session token", 401);
  }

  const workerSession = await WorkerSession.findById(payload.sid);
  if (workerSession && workerSession.kind === kind) {
    if (workerSession.revokedAt) throw buildAuthError("AUTH_INVALID", "Session not found or revoked", 401);
    if (workerSession.expiresAt.getTime() <= Date.now()) throw buildAuthError("AUTH_EXPIRED", "Session expired", 401);
    const worker = await Worker.findById(workerSession.workerId);
    if (!worker) throw buildAuthError("AUTH_INVALID", "Worker not found", 401);
    return { actor: "worker", user: worker, session: workerSession, tokenPayload: payload };
  }

  const employerSession = await EmployerSession.findById(payload.sid);
  if (employerSession && employerSession.kind === kind) {
    if (employerSession.revokedAt) throw buildAuthError("AUTH_INVALID", "Session not found or revoked", 401);
    if (employerSession.expiresAt.getTime() <= Date.now()) throw buildAuthError("AUTH_EXPIRED", "Session expired", 401);
    const employer = await Employer.findById(employerSession.employerId);
    if (!employer) throw buildAuthError("AUTH_INVALID", "Employer not found", 401);
    return { actor: "employer", user: employer, session: employerSession, tokenPayload: payload };
  }

  throw buildAuthError("AUTH_INVALID", "Invalid session token", 401);
}

module.exports = { verifySessionToken, buildAuthError };
