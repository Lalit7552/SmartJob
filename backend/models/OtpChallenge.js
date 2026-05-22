const mongoose = require("mongoose");

const OtpChallengeSchema = new mongoose.Schema(
  {
    purpose: { type: String, required: true, index: true }, // e.g. worker_signup
    countryCode: { type: String, default: "+91" },
    phone: { type: String, required: true, index: true },

    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },

    sendWindowStartAt: { type: Date, required: true },
    sendCountInWindow: { type: Number, required: true, default: 0 },
    resendAvailableAt: { type: Date, required: true },

    verifyAttempts: { type: Number, required: true, default: 0 },
    blockedUntil: { type: Date },
  },
  { timestamps: true }
);

OtpChallengeSchema.index({ purpose: 1, phone: 1 }, { unique: true });
OtpChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("OtpChallenge", OtpChallengeSchema);
