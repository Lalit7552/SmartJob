const mongoose = require("mongoose");

const WorkerRatingSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: true,
      index: true,
    },
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employer",
      required: true,
      index: true,
    },
    rating: { type: Number, min: 1, max: 5, required: true },
    review: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

WorkerRatingSchema.index({ workerId: 1, employerId: 1 }, { unique: true });

module.exports = mongoose.model("WorkerRating", WorkerRatingSchema);
