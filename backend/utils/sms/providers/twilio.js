function formEncode(obj) {
  return Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
}

async function sendViaTwilio({ toE164, message }) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  if (!accountSid || !authToken || !from) {
    throw Object.assign(new Error("Twilio config missing (TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN/TWILIO_FROM)"), {
      code: "SMS_CONFIG_MISSING",
      statusCode: 500,
    });
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formEncode({ From: from, To: toE164, Body: message }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw Object.assign(new Error("Twilio SMS send failed"), {
      code: "SMS_SEND_FAILED",
      statusCode: 502,
      details: { status: res.status, body: text.slice(0, 500) },
    });
  }

  let parsed = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = null;
  }

  return { ok: true, provider: "twilio", sid: parsed?.sid };
}

module.exports = { sendViaTwilio };

