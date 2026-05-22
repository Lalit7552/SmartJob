const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema(
  {
    employerId: { type: mongoose.Schema.Types.ObjectId, ref: "Employer", required: true, index: true },

    title: { type: String, trim: true },
    category: { type: String, trim: true },
    type: { type: String, trim: true },
    country: { type: String, trim: true, default: "IN" },
    state: { type: String, trim: true },
    city: { type: String, trim: true },
    address: { type: String, trim: true },

    date: { type: String, trim: true },
    startTime: { type: String, trim: true },
    endTime: { type: String, trim: true },
    payment: { type: String, trim: true },

    minSalary: { type: String, trim: true },
    maxSalary: { type: String, trim: true },

    contactName: { type: String, trim: true },
    phone: { type: String, trim: true },

    status: {
      type: String,
      enum: ["Active", "Completed", "Cancelled"],
      default: "Active",
      index: true,
    },
    applicants: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", JobSchema);
