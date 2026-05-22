const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema(
  {
    kind: { type: String, required: true }, // e.g. photo, idProof, addressProof
    originalName: { type: String, required: true },
    storedName: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    storage: { type: String, enum: ["local"], default: "local" },
    localPath: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const WorkerSchema = new mongoose.Schema(
  {
    countryCode: { type: String, default: "+91" },
    phone: { type: String, required: true, unique: true, index: true },

    status: { type: String, enum: ["onboarding", "active"], default: "onboarding" },
    onboardingStep: {
      type: String,
      enum: ["profile", "skills", "documents", "done"],
      default: "profile",
      index: true,
    },
    profileStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    profileReviewedAt: { type: Date },

    profile: {
      fullName: { type: String },
      age: { type: Number },
      gender: { type: String, enum: ["Male", "Female", "Other"] },
      country: { type: String },
      state: { type: String },
      city: { type: String },
      area: { type: String },
      about: { type: String },
      profilePhoto: { type: String },
    },

    skills: [{ type: String }],
    skillDetails: {
      experience: { type: String },
      jobType: { type: String },
      expectedSalary: { type: Number },
      preferredArea: { type: String },
    },

    documents: [DocumentSchema],

    walletBalance: { type: Number, default: 0 },
    walletUpdatedAt: { type: Date },

    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Worker", WorkerSchema);
