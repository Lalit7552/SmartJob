const mongoose = require("mongoose");

const EmployerSchema = new mongoose.Schema(
  {
    countryCode: { type: String, default: "+91" },
    phone: { type: String, required: true, unique: true, index: true },

    status: { type: String, enum: ["onboarding", "active"], default: "onboarding" },
    adminStatus: {
      type: String,
      enum: ["active", "trashed"],
      default: "active",
      index: true,
    },
    onboardingStep: {
      type: String,
      enum: ["profile", "done"],
      default: "profile",
      index: true,
    },

    profile: {
      name: { type: String },
      companyName: { type: String },
      email: { type: String },
      city: { type: String },
      address: { type: String },
      establishedYear: { type: Number },

      profilePhoto: { type: String },   // 👈 add this
      companyLogo: { type: String }     // 👈 add this
    },

    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employer", EmployerSchema);
