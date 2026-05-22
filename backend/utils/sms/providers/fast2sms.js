function formEncode(obj) {
  return Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
}

async function sendViaFast2SmsOtp({ toE164, otp }) {
  const apiKey = process.env.FAST2SMS_API_KEY;
  const senderId = process.env.FAST2SMS_SENDER_ID;
  const baseUrl = process.env.FAST2SMS_BASE_URL || "https://www.fast2sms.com";

  if (!apiKey) {
    throw Object.assign(new Error("Fast2SMS config missing (FAST2SMS_API_KEY)"), {
      code: "SMS_CONFIG_MISSING",
      statusCode: 500,
    });
  }

  // Fast2SMS typically supports India numbers; keep digits only.
  const numbers = String(toE164 || "").replace(/\D/g, "").slice(-10);

  const body = formEncode({
    route: "otp",
    variables_values: String(otp),
    numbers,
    ...(senderId ? { sender_id: senderId } : {}),
  });

  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/dev/bulkV2`, {
    method: "POST",
    headers: {
      authorization: apiKey,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const text = await res.text();
  if (!res.ok) {
    throw Object.assign(new Error("Fast2SMS send failed"), {
      code: "SMS_SEND_FAILED",
      statusCode: 502,
      details: { status: res.status, body: text.slice(0, 500) },
    });
  }

  return { ok: true, provider: "fast2sms" };
}

module.exports = { sendViaFast2SmsOtp };

