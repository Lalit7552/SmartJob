const Worker = require("../models/Worker");

async function listPendingWorkers(req, res, next) {
  try {
    const workers = await Worker.find({ profileStatus: "pending" })
      .sort({ updatedAt: -1 })
      .select("profile skills skillDetails phone countryCode status onboardingStep profileStatus createdAt updatedAt");

    return res.json({
      ok: true,
      data: {
        workers: workers.map((w) => ({
          id: w._id.toString(),
          profile: w.profile,
          skills: w.skills,
          skillDetails: w.skillDetails,
          phone: w.phone,
          countryCode: w.countryCode,
          status: w.status,
          onboardingStep: w.onboardingStep,
          profileStatus: w.profileStatus,
          createdAt: w.createdAt,
          updatedAt: w.updatedAt,
        })),
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function listWorkers(req, res, next) {
  try {
    const workers = await Worker.find()
      .sort({ updatedAt: -1 })
      .select("profile skills skillDetails phone countryCode status onboardingStep profileStatus createdAt updatedAt");

    return res.json({
      ok: true,
      data: {
        workers: workers.map((w) => ({
          id: w._id.toString(),
          profile: w.profile,
          skills: w.skills,
          skillDetails: w.skillDetails,
          phone: w.phone,
          countryCode: w.countryCode,
          status: w.status,
          onboardingStep: w.onboardingStep,
          profileStatus: w.profileStatus,
          createdAt: w.createdAt,
          updatedAt: w.updatedAt,
        })),
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function approveWorkerProfile(req, res, next) {
  try {
    const { id } = req.params;
    const worker = await Worker.findById(id);
    if (!worker) {
      return res.status(404).json({
        ok: false,
        error: { code: "NOT_FOUND", message: "Worker not found" },
      });
    }

    worker.profileStatus = "approved";
    worker.profileReviewedAt = new Date();
    await worker.save();

    return res.json({
      ok: true,
      data: { id: worker._id.toString(), profileStatus: worker.profileStatus },
    });
  } catch (err) {
    return next(err);
  }
}

async function rejectWorkerProfile(req, res, next) {
  try {
    const { id } = req.params;
    const worker = await Worker.findById(id);
    if (!worker) {
      return res.status(404).json({
        ok: false,
        error: { code: "NOT_FOUND", message: "Worker not found" },
      });
    }

    worker.profileStatus = "rejected";
    worker.profileReviewedAt = new Date();
    await worker.save();

    return res.json({
      ok: true,
      data: { id: worker._id.toString(), profileStatus: worker.profileStatus },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { listPendingWorkers, listWorkers, approveWorkerProfile, rejectWorkerProfile };
