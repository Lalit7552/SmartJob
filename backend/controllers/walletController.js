const AdminWallet = require("../models/AdminWallet");
const WalletTransaction = require("../models/WalletTransaction");
const Worker = require("../models/Worker");

function requireWorker(req) {
  if (!req.worker) {
    const err = new Error("Missing worker context");
    err.status = 401;
    throw err;
  }
}

async function getOrCreateAdminWallet() {
  let wallet = await AdminWallet.findOne({ key: "primary" });
  if (!wallet) {
    wallet = await AdminWallet.create({ key: "primary", balance: 0 });
  }
  return wallet;
}

async function getWorkerWallet(req, res, next) {
  try {
    requireWorker(req);
    const worker = await Worker.findById(req.worker._id).select("walletBalance walletUpdatedAt");
    const txns = await WalletTransaction.find({ actor: "worker", workerId: req.worker._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return res.json({
      ok: true,
      data: {
        balance: worker?.walletBalance || 0,
        updatedAt: worker?.walletUpdatedAt || worker?.updatedAt,
        transactions: txns,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function getAdminWallet(req, res, next) {
  try {
    const wallet = await getOrCreateAdminWallet();
    const txns = await WalletTransaction.find({ actor: "admin" })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.json({
      ok: true,
      data: {
        balance: wallet.balance || 0,
        updatedAt: wallet.updatedAt,
        transactions: txns,
      },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getWorkerWallet, getAdminWallet, getOrCreateAdminWallet };
