const AdminWallet = require("../models/AdminWallet");
const ChatMessage = require("../models/ChatMessage");
const Employer = require("../models/Employer");
const EmployerSession = require("../models/EmployerSession");
const Enquiry = require("../models/Enquiry");
const Job = require("../models/Job");
const OtpChallenge = require("../models/OtpChallenge");
const WalletTransaction = require("../models/WalletTransaction");
const Worker = require("../models/Worker");
const WorkerRating = require("../models/WorkerRating");
const WorkerSession = require("../models/WorkerSession");

const DEFAULT_CONFIRM = "DELETE ALL";

async function wipeDatabase(req, res) {
  const allowWipe = String(process.env.ALLOW_ADMIN_DB_WIPE || "").toLowerCase() === "true";
  if (!allowWipe) {
    return res.status(403).json({
      ok: false,
      error: { code: "DB_WIPE_DISABLED", message: "Database wipe is disabled" },
    });
  }

  const expected = process.env.ADMIN_DB_WIPE_CONFIRM || DEFAULT_CONFIRM;
  const confirm = String(req.body?.confirm || "").trim();
  if (confirm !== expected) {
    return res.status(400).json({
      ok: false,
      error: { code: "CONFIRM_MISMATCH", message: "Invalid confirmation phrase" },
    });
  }

  const [
    adminWallet,
    chatMessages,
    employers,
    employerSessions,
    enquiries,
    jobs,
    otpChallenges,
    walletTransactions,
    workers,
    workerRatings,
    workerSessions,
  ] = await Promise.all([
    AdminWallet.deleteMany({}),
    ChatMessage.deleteMany({}),
    Employer.deleteMany({}),
    EmployerSession.deleteMany({}),
    Enquiry.deleteMany({}),
    Job.deleteMany({}),
    OtpChallenge.deleteMany({}),
    WalletTransaction.deleteMany({}),
    Worker.deleteMany({}),
    WorkerRating.deleteMany({}),
    WorkerSession.deleteMany({}),
  ]);

  return res.json({
    ok: true,
    data: {
      deleted: {
        adminWallet: adminWallet?.deletedCount || 0,
        chatMessages: chatMessages?.deletedCount || 0,
        employers: employers?.deletedCount || 0,
        employerSessions: employerSessions?.deletedCount || 0,
        enquiries: enquiries?.deletedCount || 0,
        jobs: jobs?.deletedCount || 0,
        otpChallenges: otpChallenges?.deletedCount || 0,
        walletTransactions: walletTransactions?.deletedCount || 0,
        workers: workers?.deletedCount || 0,
        workerRatings: workerRatings?.deletedCount || 0,
        workerSessions: workerSessions?.deletedCount || 0,
      },
    },
  });
}

module.exports = { wipeDatabase };
