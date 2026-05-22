const mongoose = require("mongoose");
const WorkerRating = require("../models/WorkerRating");
const Worker = require("../models/Worker");

function clampNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return n;
}

function formatSummary(summary) {
  if (!summary) return { avgRating: 0, totalRatings: 0 };
  const avg =
    summary.avgRating === null || typeof summary.avgRating === "undefined"
      ? 0
      : Number(Number(summary.avgRating).toFixed(1));
  return {
    avgRating: avg,
    totalRatings: summary.totalRatings || 0,
  };
}

async function computeWorkerSummary(workerId) {
  const [summary] = await WorkerRating.aggregate([
    { $match: { workerId: new mongoose.Types.ObjectId(workerId) } },
    { $group: { _id: null, avgRating: { $avg: "$rating" }, totalRatings: { $sum: 1 } } },
  ]);
  return formatSummary(summary);
}

async function upsertWorkerRating(req, res, next) {
  try {
    const employer = req.employer;
    if (!employer) {
      const err = new Error("Missing employer context");
      err.status = 401;
      throw err;
    }

    const workerId = String(req.params.workerId || "");
    if (!mongoose.isValidObjectId(workerId)) {
      return res.status(400).json({
        ok: false,
        error: { code: "BAD_REQUEST", message: "Invalid worker id" },
      });
    }

    const worker = await Worker.findById(workerId).select("_id profileStatus");
    if (!worker) {
      return res.status(404).json({
        ok: false,
        error: { code: "NOT_FOUND", message: "Worker not found" },
      });
    }

    const rating = clampNumber(req.body?.rating);
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        ok: false,
        error: { code: "BAD_REQUEST", message: "Rating must be between 1 and 5" },
      });
    }

    const review = String(req.body?.review || "").trim();
    if (review.length > 1000) {
      return res.status(400).json({
        ok: false,
        error: { code: "BAD_REQUEST", message: "Review is too long" },
      });
    }

    const ratingDoc = await WorkerRating.findOneAndUpdate(
      { workerId, employerId: employer._id },
      { rating, review },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const summary = await computeWorkerSummary(workerId);

    return res.json({
      ok: true,
      data: {
        rating: {
          id: ratingDoc._id.toString(),
          workerId: ratingDoc.workerId.toString(),
          employerId: ratingDoc.employerId.toString(),
          rating: ratingDoc.rating,
          review: ratingDoc.review,
          createdAt: ratingDoc.createdAt,
          updatedAt: ratingDoc.updatedAt,
        },
        summary,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function listWorkerRatings(req, res, next) {
  try {
    const worker = req.worker;
    if (!worker) {
      const err = new Error("Missing worker context");
      err.status = 401;
      throw err;
    }

    const ratings = await WorkerRating.find({ workerId: worker._id })
      .sort({ updatedAt: -1 })
      .populate("employerId", "profile");

    const summary = await computeWorkerSummary(worker._id);

    return res.json({
      ok: true,
      data: {
        summary,
        ratings: ratings.map((r) => ({
          id: r._id.toString(),
          rating: r.rating,
          review: r.review,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          employer: {
            id: r.employerId?._id?.toString?.() || null,
            name: r.employerId?.profile?.name || "Employer",
            companyName: r.employerId?.profile?.companyName || "",
            profilePhoto: r.employerId?.profile?.profilePhoto || "",
          },
        })),
      },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { upsertWorkerRating, listWorkerRatings };
