const mongoose = require("mongoose");
const Enquiry = require("../models/Enquiry");
const Job = require("../models/Job");
const Worker = require("../models/Worker");
const WalletTransaction = require("../models/WalletTransaction");
const { getOrCreateAdminWallet } = require("./walletController");
const { generateNumericOtp, hashOtp, safeEqualHex } = require("../utils/otp");

function requireEmployer(req) {
  if (!req.employer) {
    const err = new Error("Missing employer context");
    err.status = 401;
    throw err;
  }
}

function requireWorker(req) {
  if (!req.worker) {
    const err = new Error("Missing worker context");
    err.status = 401;
    throw err;
  }
}

async function createJobEnquiry(req, res, next) {
  try {
    requireWorker(req);
    const jobId = req.params?.jobId;
    if (!jobId || !mongoose.isValidObjectId(jobId)) {
      const err = new Error("Valid jobId is required");
      err.status = 400;
      throw err;
    }

    const job = await Job.findById(jobId).select("employerId");
    if (!job) {
      const err = new Error("Job not found");
      err.status = 404;
      throw err;
    }

    const existing = await Enquiry.findOne({ jobId, workerId: req.worker._id });
    if (existing) {
      return res.json({ ok: true, data: { enquiry: existing, alreadyApplied: true } });
    }

    const enquiry = await Enquiry.create({
      employerId: job.employerId,
      workerId: req.worker._id,
      jobId,
      status: "new",
      workStatus: "applied",
    });

    await Job.updateOne({ _id: jobId }, { $inc: { applicants: 1 } });

    return res.json({ ok: true, data: { enquiry, alreadyApplied: false } });
  } catch (err) {
    if (err?.code === 11000) {
      return res.json({ ok: true, data: { alreadyApplied: true } });
    }
    return next(err);
  }
}

async function listEmployerEnquiries(req, res, next) {
  try {
    requireEmployer(req);
    const enquiries = await Enquiry.find({ employerId: req.employer._id })
      .sort({ createdAt: -1 })
      .populate("workerId", "profile skills skillDetails profileStatus phone countryCode updatedAt")
      .populate("jobId", "title type city state country");

    return res.json({
      ok: true,
      data: {
        enquiries: enquiries.map((e) => ({
          id: e._id.toString(),
          status: e.status,
          workStatus: e.workStatus,
          otpGeneratedAt: e.otpGeneratedAt,
          otpExpiresAt: e.otpExpiresAt,
          otpVerifiedAt: e.otpVerifiedAt,
          createdAt: e.createdAt,
          worker: e.workerId
            ? {
                id: e.workerId._id.toString(),
                phone: e.workerId.phone,
                countryCode: e.workerId.countryCode,
                profile: e.workerId.profile,
                skills: e.workerId.skills,
                skillDetails: e.workerId.skillDetails,
                profileStatus: e.workerId.profileStatus,
                updatedAt: e.workerId.updatedAt,
              }
            : null,
          job: e.jobId
            ? {
                id: e.jobId._id.toString(),
                title: e.jobId.title,
                type: e.jobId.type,
                city: e.jobId.city,
                state: e.jobId.state,
                country: e.jobId.country,
              }
            : null,
        })),
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function listWorkerEnquiries(req, res, next) {
  try {
    requireWorker(req);
    const enquiries = await Enquiry.find({ workerId: req.worker._id })
      .sort({ createdAt: -1 })
      .populate("jobId", "title category type city state country date startTime endTime payment contactName");

    return res.json({
      ok: true,
      data: {
        enquiries: enquiries.map((e) => ({
          id: e._id.toString(),
          status: e.status,
          workStatus: e.workStatus,
          otpGeneratedAt: e.otpGeneratedAt,
          otpExpiresAt: e.otpExpiresAt,
          otpVerifiedAt: e.otpVerifiedAt,
          createdAt: e.createdAt,
          job: e.jobId
            ? {
                id: e.jobId._id.toString(),
                title: e.jobId.title,
                category: e.jobId.category,
                type: e.jobId.type,
                city: e.jobId.city,
                state: e.jobId.state,
                country: e.jobId.country,
                date: e.jobId.date,
                startTime: e.jobId.startTime,
                endTime: e.jobId.endTime,
                payment: e.jobId.payment,
                contactName: e.jobId.contactName,
              }
            : null,
        })),
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function generateEnquiryOtp(req, res, next) {
  try {
    requireEmployer(req);
    const enquiryId = req.params?.enquiryId;
    if (!enquiryId || !mongoose.isValidObjectId(enquiryId)) {
      const err = new Error("Valid enquiryId is required");
      err.status = 400;
      throw err;
    }

    const enquiry = await Enquiry.findOne({ _id: enquiryId, employerId: req.employer._id });
    if (!enquiry) {
      const err = new Error("Enquiry not found");
      err.status = 404;
      throw err;
    }
    if (enquiry.workStatus === "done") {
      const err = new Error("Work already completed");
      err.status = 400;
      throw err;
    }

    const otpLength = Number(process.env.ENQUIRY_OTP_LENGTH || process.env.OTP_LENGTH || 4);
    const ttlSec = Number(process.env.ENQUIRY_OTP_TTL_SEC || process.env.OTP_TTL_SEC || 300);
    const otp = generateNumericOtp(otpLength);
    const otpSecret = process.env.OTP_SECRET || process.env.JWT_SECRET || "";
    const otpHash = hashOtp({
      otp,
      phone: String(enquiry.workerId),
      purpose: "enquiry_otp",
      secret: otpSecret,
    });

    enquiry.otpHash = otpHash;
    enquiry.otpGeneratedAt = new Date();
    enquiry.otpExpiresAt = new Date(Date.now() + ttlSec * 1000);
    enquiry.workStatus = "otp_generated";
    await enquiry.save();

    return res.json({
      ok: true,
      data: {
        enquiryId: enquiry._id.toString(),
        otp,
        expiresAt: enquiry.otpExpiresAt,
        workStatus: enquiry.workStatus,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function verifyEnquiryOtp(req, res, next) {
  try {
    requireWorker(req);
    const enquiryId = req.params?.enquiryId;
    const otp = String(req.body?.otp || "").replace(/\D/g, "");
    if (!enquiryId || !mongoose.isValidObjectId(enquiryId)) {
      const err = new Error("Valid enquiryId is required");
      err.status = 400;
      throw err;
    }
    if (!otp) {
      const err = new Error("OTP is required");
      err.status = 400;
      throw err;
    }

    const enquiry = await Enquiry.findOne({ _id: enquiryId, workerId: req.worker._id });
    if (!enquiry) {
      const err = new Error("Enquiry not found");
      err.status = 404;
      throw err;
    }
    if (!enquiry.otpHash || !enquiry.otpExpiresAt) {
      const err = new Error("OTP not generated");
      err.status = 400;
      throw err;
    }
    if (enquiry.otpExpiresAt.getTime() < Date.now()) {
      const err = new Error("OTP expired");
      err.status = 400;
      throw err;
    }

    const otpSecret = process.env.OTP_SECRET || process.env.JWT_SECRET || "";
    const computed = hashOtp({
      otp,
      phone: String(enquiry.workerId),
      purpose: "enquiry_otp",
      secret: otpSecret,
    });
    const ok = safeEqualHex(computed, enquiry.otpHash);
    if (!ok) {
      const err = new Error("Invalid OTP");
      err.status = 400;
      throw err;
    }

    enquiry.otpVerifiedAt = new Date();
    enquiry.workStatus = "in_progress";
    await enquiry.save();

    return res.json({
      ok: true,
      data: {
        enquiryId: enquiry._id.toString(),
        workStatus: enquiry.workStatus,
        otpVerifiedAt: enquiry.otpVerifiedAt,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function completeEnquiryWork(req, res, next) {
  try {
    requireWorker(req);
    const enquiryId = req.params?.enquiryId;
    const paymentMethod = String(req.body?.paymentMethod || "").toLowerCase();
    if (!enquiryId || !mongoose.isValidObjectId(enquiryId)) {
      const err = new Error("Valid enquiryId is required");
      err.status = 400;
      throw err;
    }
    if (!["cash", "online"].includes(paymentMethod)) {
      const err = new Error("Payment method must be cash or online");
      err.status = 400;
      throw err;
    }

    const enquiry = await Enquiry.findOne({ _id: enquiryId, workerId: req.worker._id });
    if (!enquiry) {
      const err = new Error("Enquiry not found");
      err.status = 404;
      throw err;
    }
    if (!enquiry.otpVerifiedAt) {
      const err = new Error("OTP not verified");
      err.status = 400;
      throw err;
    }
    if (enquiry.workStatus === "done") {
      return res.json({
        ok: true,
        data: { enquiryId: enquiry._id.toString(), workStatus: enquiry.workStatus },
      });
    }

    const job = await Job.findById(enquiry.jobId).select("payment minSalary maxSalary");
    const amount = parseJobAmount(job);
    if (!Number.isFinite(amount) || amount <= 0) {
      const err = new Error("Unable to determine job amount");
      err.status = 400;
      throw err;
    }

    const feeAmount = roundTo2(amount * 0.1);
    const payoutAmount = roundTo2(amount - feeAmount);
    const workerDelta = paymentMethod === "cash" ? -feeAmount : payoutAmount;

    const adminWallet = await getOrCreateAdminWallet();
    adminWallet.balance = roundTo2((adminWallet.balance || 0) + feeAmount);
    adminWallet.updatedAt = new Date();
    await adminWallet.save();

    const worker = await Worker.findById(req.worker._id);
    const nextBalance = roundTo2((worker?.walletBalance || 0) + workerDelta);
    await Worker.updateOne(
      { _id: req.worker._id },
      { $set: { walletBalance: nextBalance, walletUpdatedAt: new Date() } }
    );

    await WalletTransaction.create([
      {
        actor: "worker",
        workerId: req.worker._id,
        enquiryId: enquiry._id,
        jobId: enquiry.jobId,
        method: paymentMethod,
        direction: workerDelta >= 0 ? "credit" : "debit",
        grossAmount: amount,
        feeAmount,
        netAmount: workerDelta,
        balanceAfter: nextBalance,
        note: paymentMethod === "cash" ? "Platform fee on cash payment" : "Payout credited",
      },
      {
        actor: "admin",
        enquiryId: enquiry._id,
        jobId: enquiry.jobId,
        method: paymentMethod,
        direction: "credit",
        grossAmount: amount,
        feeAmount,
        netAmount: feeAmount,
        balanceAfter: adminWallet.balance,
        note: "Platform fee",
      },
    ]);

    enquiry.workStatus = "done";
    enquiry.status = "closed";
    enquiry.paymentMethod = paymentMethod;
    enquiry.paymentAmount = amount;
    enquiry.feeAmount = feeAmount;
    enquiry.payoutAmount = payoutAmount;
    enquiry.paidAt = new Date();
    await enquiry.save();

    return res.json({
      ok: true,
      data: {
        enquiryId: enquiry._id.toString(),
        workStatus: enquiry.workStatus,
        paymentMethod,
        paymentAmount: amount,
        feeAmount,
        payoutAmount,
        walletDelta: workerDelta,
      },
    });
  } catch (err) {
    return next(err);
  }
}

function parseJobAmount(job) {
  if (!job) return 0;
  if (Number.isFinite(job.payment)) return Number(job.payment);
  const paymentText = String(job.payment || "");
  const match = paymentText.match(/(\d+(\.\d+)?)/);
  if (match) return Number(match[1]);
  if (Number.isFinite(job.maxSalary)) return Number(job.maxSalary);
  if (Number.isFinite(job.minSalary)) return Number(job.minSalary);
  return 0;
}

function roundTo2(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

module.exports = {
  createJobEnquiry,
  listEmployerEnquiries,
  listWorkerEnquiries,
  generateEnquiryOtp,
  verifyEnquiryOtp,
  completeEnquiryWork,
};
