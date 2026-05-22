const mongoose = require("mongoose");

const WorkerSessionSchema = new mongoose.Schema(
  {
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: "Worker", required: true, index: true },
    kind: { type: String, enum: ["onboarding", "auth"], required: true, index: true },
    currentStep: { type: String, enum: ["profile", "skills", "documents", "done"] },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

WorkerSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("WorkerSession", WorkerSessionSchema);
