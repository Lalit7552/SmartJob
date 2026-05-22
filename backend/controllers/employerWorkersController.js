const Worker = require("../models/Worker");
const WorkerRating = require("../models/WorkerRating");
const mongoose = require("mongoose");

function toFixedNumber(value) {
  if (value === null || typeof value === "undefined") return 0;
  return Number(Number(value).toFixed(1));
}

async function listApprovedWorkers(req, res, next) {
  try {
    const workers = await Worker.find({ profileStatus: "approved" })
      .sort({ updatedAt: -1 })
      .select("profile skills skillDetails profileStatus updatedAt");

    const workerIds = workers.map((w) => w._id).filter(Boolean);
    let ratingMap = new Map();
    let overallSummary = { avgRating: 0, totalRatings: 0 };

    if (workerIds.length) {
      const [stats] = await WorkerRating.aggregate([
        { $match: { workerId: { $in: workerIds.map((id) => new mongoose.Types.ObjectId(id)) } } },
        {
          $facet: {
            perWorker: [
              {
                $group: {
                  _id: "$workerId",
                  avgRating: { $avg: "$rating" },
                  totalRatings: { $sum: 1 },
                },
              },
            ],
            overall: [
              {
                $group: {
                  _id: null,
                  avgRating: { $avg: "$rating" },
                  totalRatings: { $sum: 1 },
                },
              },
            ],
          },
        },
      ]);

      const perWorker = stats?.perWorker || [];
      ratingMap = new Map(
        perWorker.map((r) => [
          String(r._id),
          {
            avgRating: toFixedNumber(r.avgRating),
            totalRatings: r.totalRatings || 0,
          },
        ])
      );

      const overall = stats?.overall?.[0];
      if (overall) {
        overallSummary = {
          avgRating: toFixedNumber(overall.avgRating),
          totalRatings: overall.totalRatings || 0,
        };
      }
    }

    return res.json({
      ok: true,
      data: {
        workers: workers.map((w) => ({
          id: w._id.toString(),
          profile: w.profile,
          skills: w.skills,
          skillDetails: w.skillDetails,
          profileStatus: w.profileStatus,
          updatedAt: w.updatedAt,
          ...(ratingMap.get(w._id.toString()) || { avgRating: 0, totalRatings: 0 }),
        })),
        ratingsSummary: overallSummary,
      },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { listApprovedWorkers };
