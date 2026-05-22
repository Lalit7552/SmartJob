const mongoose = require("mongoose");

const EmployerSessionSchema = new mongoose.Schema(
  {
    employerId: { type: mongoose.Schema.Types.ObjectId, ref: "Employer", required: true, index: true },
    kind: { type: String, enum: ["onboarding", "auth"], required: true, index: true },
    currentStep: { type: String, enum: ["profile", "done"] },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

EmployerSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("EmployerSession", EmployerSessionSchema);

