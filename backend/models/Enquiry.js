const mongoose = require("mongoose");

const EnquirySchema = new mongoose.Schema(
  {
    employerId: { type: mongoose.Schema.Types.ObjectId, ref: "Employer", required: true, index: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: "Worker", required: true, index: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    status: { type: String, enum: ["new", "viewed", "closed"], default: "new", index: true },
    workStatus: {
      type: String,
      enum: ["applied", "otp_generated", "in_progress", "done"],
      default: "applied",
      index: true,
    },
    otpHash: { type: String },
    otpGeneratedAt: { type: Date },
    otpExpiresAt: { type: Date },
    otpVerifiedAt: { type: Date },
    paymentMethod: { type: String, enum: ["cash", "online"] },
    paymentAmount: { type: Number },
    feeAmount: { type: Number },
    payoutAmount: { type: Number },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

EnquirySchema.index({ jobId: 1, workerId: 1 }, { unique: true });

module.exports = mongoose.model("Enquiry", EnquirySchema);
