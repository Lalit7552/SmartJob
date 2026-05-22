const crypto = require("crypto");

function generateNumericOtp(length) {
  const digits = [];
  for (let i = 0; i < length; i += 1) {
    digits.push(crypto.randomInt(0, 10));
  }
  return digits.join("");
}

function hashOtp({ otp, phone, purpose, secret }) {
  const h = crypto.createHash("sha256");
  h.update(String(purpose));
  h.update("|");
  h.update(String(phone));
  h.update("|");
  h.update(String(otp));
  h.update("|");
  h.update(String(secret || ""));
  return h.digest("hex");
}

function safeEqualHex(a, b) {
  const aBuf = Buffer.from(String(a), "hex");
  const bBuf = Buffer.from(String(b), "hex");
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

module.exports = {
  generateNumericOtp,
  hashOtp,
  safeEqualHex,
};

