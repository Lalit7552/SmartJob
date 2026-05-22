const jwt = require("jsonwebtoken");
const Worker = require("../models/Worker");
const OtpChallenge = require("../models/OtpChallenge");
const WorkerSession = require("../models/WorkerSession");
const { generateNumericOtp, hashOtp, safeEqualHex } = require("../utils/otp");
const { nextResponse } = require("../utils/nextStep");
const { sendOtpSms } = require("../utils/sms");

const PURPOSE = "worker_signup";

function parsePhone(phone) {
  const p = String(phone || "").replace(/\D/g, "");
  if (p.length < 10 || p.length > 15) return null;
  return p;
}

function secondsBetween(a, b) {
  return Math.max(0, Math.ceil((b.getTime() - a.getTime()) / 1000));
}

async function revokeSessions({ workerId, kind }) {
  await WorkerSession.updateMany(
    { workerId, kind, revokedAt: { $exists: false } },
    { $set: { revokedAt: new Date() } }
  );
}

async function createSession({ workerId, kind, currentStep, ttlSec, req }) {
  const expiresAt = new Date(Date.now() + ttlSec * 1000);
  const session = await WorkerSession.create({
    workerId,
    kind,
    currentStep,
    expiresAt,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  const token = jwt.sign(
    { sid: session._id.toString(), typ: kind },
    process.env.JWT_SECRET,
    { expiresIn: ttlSec }
  );

  return { session, token };
}

async function requestOtp(req, res, next) {
  try {
    const phone = parsePhone(req.body.phone);
    const countryCode = String(req.body.countryCode || "+91");
    if (!phone) {
      return res.status(400).json({
        ok: false,
        error: { code: "VALIDATION", message: "Invalid phone" },
      });
    }

    const now = new Date();
    const otpLength = Number(process.env.OTP_LENGTH || 4);
    const ttlSec = Number(process.env.OTP_TTL_SEC || 300);
    const cooldownSec = Number(process.env.OTP_RESEND_COOLDOWN_SEC || 60);
    const maxPerHour = Number(process.env.OTP_SEND_MAX_PER_HOUR || 5);

    let challenge = await OtpChallenge.findOne({ purpose: PURPOSE, phone });
    if (!challenge) {
      challenge = new OtpChallenge({
        purpose: PURPOSE,
        countryCode,
        phone,
        otpHash: "init",
        expiresAt: now,
        sendWindowStartAt: now,
        sendCountInWindow: 0,
        resendAvailableAt: now,
        verifyAttempts: 0,
      });
    }

    if (challenge.blockedUntil && challenge.blockedUntil.getTime() > Date.now()) {
      return res.status(429).json({
        ok: false,
        error: {
          code: "OTP_BLOCKED",
          message: "Too many attempts. Try later.",
          retryAfterSec: secondsBetween(now, challenge.blockedUntil),
        },
      });
    }

    const hourMs = 60 * 60 * 1000;
    if (now.getTime() - challenge.sendWindowStartAt.getTime() >= hourMs) {
      challenge.sendWindowStartAt = now;
      challenge.sendCountInWindow = 0;
    }

    if (challenge.resendAvailableAt && challenge.resendAvailableAt.getTime() > Date.now()) {
      return res.status(429).json({
        ok: false,
        error: {
          code: "OTP_RESEND_COOLDOWN",
          message: "Please wait before requesting another OTP.",
          retryAfterSec: secondsBetween(now, challenge.resendAvailableAt),
        },
      });
    }

    if (challenge.sendCountInWindow >= maxPerHour) {
      const windowEnd = new Date(challenge.sendWindowStartAt.getTime() + hourMs);
      return res.status(429).json({
        ok: false,
        error: {
          code: "OTP_RESEND_LIMIT",
          message: "OTP request limit reached. Try later.",
          retryAfterSec: secondsBetween(now, windowEnd),
        },
      });
    }

    const otp = generateNumericOtp(otpLength);
    const otpSecret = process.env.OTP_SECRET || process.env.JWT_SECRET || "";
    challenge.otpHash = hashOtp({ otp, phone, purpose: PURPOSE, secret: otpSecret });
    challenge.expiresAt = new Date(Date.now() + ttlSec * 1000);
    challenge.resendAvailableAt = new Date(Date.now() + cooldownSec * 1000);
    challenge.sendCountInWindow += 1;
    challenge.verifyAttempts = 0;
    challenge.blockedUntil = undefined;
    await challenge.save();

    try {
      await sendOtpSms({ phone, countryCode, otp, ttlSec, purpose: PURPOSE });
    } catch (smsErr) {
      // eslint-disable-next-line no-console
      console.error(smsErr);
      return res.status(502).json({
        ok: false,
        error: { code: "SMS_SEND_FAILED", message: "Failed to send OTP. Please try again." },
      });
    }

    return res.json({
      ok: true,
      data: {
        phone,
        countryCode,
        expiresInSec: ttlSec,
        resendAvailableInSec: cooldownSec,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function verifyOtp(req, res, next) {
  try {
    const phone = parsePhone(req.body.phone);
    const countryCode = String(req.body.countryCode || "+91");
    const otp = String(req.body.otp || "").replace(/\D/g, "");
    if (!phone || !otp) {
      return res.status(400).json({
        ok: false,
        error: { code: "VALIDATION", message: "Phone and OTP are required" },
      });
    }

    const now = new Date();
    const maxVerifyAttempts = Number(process.env.OTP_VERIFY_MAX_ATTEMPTS || 5);
    const blockMinutes = Number(process.env.OTP_BLOCK_MINUTES || 15);

    const challenge = await OtpChallenge.findOne({ purpose: PURPOSE, phone });
    if (!challenge) {
      return res.status(400).json({
        ok: false,
        error: { code: "OTP_NOT_FOUND", message: "OTP not requested" },
      });
    }

    if (challenge.blockedUntil && challenge.blockedUntil.getTime() > Date.now()) {
      return res.status(429).json({
        ok: false,
        error: {
          code: "OTP_BLOCKED",
          message: "Too many attempts. Try later.",
          retryAfterSec: secondsBetween(now, challenge.blockedUntil),
        },
      });
    }

    if (challenge.expiresAt.getTime() <= Date.now()) {
      return res.status(400).json({
        ok: false,
        error: { code: "OTP_EXPIRED", message: "OTP expired. Request a new one." },
      });
    }

    const otpSecret = process.env.OTP_SECRET || process.env.JWT_SECRET || "";
    const computed = hashOtp({ otp, phone, purpose: PURPOSE, secret: otpSecret });
    const ok = safeEqualHex(computed, challenge.otpHash);

    if (!ok) {
      challenge.verifyAttempts += 1;
      if (challenge.verifyAttempts >= maxVerifyAttempts) {
        challenge.blockedUntil = new Date(Date.now() + blockMinutes * 60 * 1000);
      }
      await challenge.save();
      return res.status(400).json({
        ok: false,
        error: {
          code: "OTP_INVALID",
          message: "Invalid OTP",
          attemptsRemaining: Math.max(0, maxVerifyAttempts - challenge.verifyAttempts),
          ...(challenge.blockedUntil ? { retryAfterSec: secondsBetween(now, challenge.blockedUntil) } : {}),
        },
      });
    }

    await OtpChallenge.deleteOne({ _id: challenge._id });

    let worker = await Worker.findOne({ phone });
    let isNew = false;
    if (!worker) {
      isNew = true;
      worker = await Worker.create({
        phone,
        countryCode,
        status: "onboarding",
        onboardingStep: "profile",
      });
    }

    const isComplete = worker.status === "active" || worker.onboardingStep === "done";
    if (isComplete) {
      await revokeSessions({ workerId: worker._id, kind: "auth" });
      const { token, session } = await createSession({
        workerId: worker._id,
        kind: "auth",
        currentStep: "done",
        ttlSec: Number(process.env.AUTH_SESSION_TTL_SEC || 7 * 24 * 60 * 60),
        req,
      });
      worker.lastLoginAt = new Date();
      await worker.save();
      return res.json({
        ok: true,
        data: {
          user: { id: worker._id.toString(), isNew: false, phone: worker.phone },
          session: { kind: "auth", token, expiresAt: session.expiresAt },
          next: nextResponse({ isNew: false, onboardingStep: "done", kind: "auth" }),
        },
      });
    }

    await revokeSessions({ workerId: worker._id, kind: "onboarding" });
    const { token, session } = await createSession({
      workerId: worker._id,
      kind: "onboarding",
      currentStep: worker.onboardingStep,
      ttlSec: Number(process.env.ONBOARDING_SESSION_TTL_SEC || 24 * 60 * 60),
      req,
    });

    return res.json({
      ok: true,
      data: {
        user: { id: worker._id.toString(), isNew, phone: worker.phone },
        session: { kind: "onboarding", token, expiresAt: session.expiresAt },
        next: nextResponse({ isNew, onboardingStep: worker.onboardingStep, kind: "onboarding" }),
      },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { requestOtp, verifyOtp };
