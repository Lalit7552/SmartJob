const mongoose = require("mongoose");

const ChatMessageSchema = new mongoose.Schema(
  {
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: "Worker", required: true, index: true },
    employerId: { type: mongoose.Schema.Types.ObjectId, ref: "Employer", required: true, index: true },
    senderRole: { type: String, enum: ["worker", "employer"], required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    clientId: { type: String },
  },
  { timestamps: true }
);

ChatMessageSchema.index({ workerId: 1, employerId: 1, createdAt: 1 });

module.exports = mongoose.model("ChatMessage", ChatMessageSchema);
