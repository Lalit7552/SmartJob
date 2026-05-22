async function sendViaConsole({ toE164, otp, ttlSec, purpose, message }) {
  const logOtp = String(process.env.OTP_LOG_TO_CONSOLE || "").toLowerCase() === "true";
  if (logOtp && process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log(`[SMS:console][${purpose || "otp"}] ${toE164} -> ${otp} (expires in ${ttlSec}s)`);
  }
  return { ok: true, provider: "console", messagePreview: message };
}

module.exports = { sendViaConsole };

