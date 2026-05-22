const mongoose = require("mongoose");

const WalletTransactionSchema = new mongoose.Schema(
  {
    actor: { type: String, enum: ["worker", "admin"], required: true, index: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: "Worker" },
    enquiryId: { type: mongoose.Schema.Types.ObjectId, ref: "Enquiry" },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
    method: { type: String, enum: ["cash", "online"] },
    direction: { type: String, enum: ["credit", "debit"], required: true },
    grossAmount: { type: Number, default: 0 },
    feeAmount: { type: Number, default: 0 },
    netAmount: { type: Number, default: 0 },
    balanceAfter: { type: Number },
    note: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WalletTransaction", WalletTransactionSchema);
