async function sendViaMsg91Flow({ toE164, otp }) {
  const authKey = process.env.MSG91_AUTHKEY;
  const flowId = process.env.MSG91_FLOW_ID;
  const otpVarName = process.env.MSG91_OTP_VAR_NAME || "otp";
  const baseUrl = process.env.MSG91_BASE_URL || "https://api.msg91.com";

  if (!authKey || !flowId) {
    throw Object.assign(new Error("MSG91 config missing (MSG91_AUTHKEY/MSG91_FLOW_ID)"), {
      code: "SMS_CONFIG_MISSING",
      statusCode: 500,
    });
  }

  const mobile = String(toE164 || "").replace(/^\+/, "");

  const payload = {
    flow_id: flowId,
    recipients: [{ mobiles: mobile, [otpVarName]: String(otp) }],
  };

  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/api/v5/flow/`, {
    method: "POST",
    headers: {
      authkey: authKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  if (!res.ok) {
    throw Object.assign(new Error("MSG91 SMS send failed"), {
      code: "SMS_SEND_FAILED",
      statusCode: 502,
      details: { status: res.status, body: text.slice(0, 500) },
    });
  }

  return { ok: true, provider: "msg91" };
}

module.exports = { sendViaMsg91Flow };

