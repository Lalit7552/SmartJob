const { sendViaConsole } = require("./providers/console");
const { sendViaTwilio } = require("./providers/twilio");
const { sendViaMsg91Flow } = require("./providers/msg91");
const { sendViaFast2SmsOtp } = require("./providers/fast2sms");

function normalizeProvider(value) {
  return String(value || "").trim().toLowerCase();
}

function getProvider() {
  const raw = process.env.SMS_PROVIDER;
  if (!raw) return process.env.NODE_ENV === "production" ? "none" : "console";
  return normalizeProvider(raw);
}

function buildOtpMessage({ otp, ttlSec }) {
  const minutes = Math.max(1, Math.ceil(Number(ttlSec || 300) / 60));
  return `Your KaamWala OTP is ${otp}. It expires in ${minutes} minute(s).`;
}

async function sendOtpSms({ phone, countryCode, otp, ttlSec, purpose }) {
  const provider = getProvider();
  const toE164 = `${countryCode || "+91"}${phone}`;
  const message = buildOtpMessage({ otp, ttlSec });

  if (provider === "none") return { ok: true, provider: "none" };
  if (provider === "console") return sendViaConsole({ toE164, otp, ttlSec, purpose, message });
  if (provider === "twilio") return sendViaTwilio({ toE164, message });
  if (provider === "msg91") return sendViaMsg91Flow({ toE164, otp });
  if (provider === "fast2sms") return sendViaFast2SmsOtp({ toE164, otp });

  throw Object.assign(new Error(`Unsupported SMS_PROVIDER: ${provider}`), {
    code: "SMS_PROVIDER_UNSUPPORTED",
    statusCode: 500,
  });
}

module.exports = { sendOtpSms };

