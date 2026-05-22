const mongoose = require("mongoose");

const AdminWalletSchema = new mongoose.Schema(
  {
    key: { type: String, default: "primary", unique: true, index: true },
    balance: { type: Number, default: 0 },
    updatedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminWallet", AdminWalletSchema);
