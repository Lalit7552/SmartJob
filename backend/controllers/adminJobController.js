const Job = require("../models/Job");

async function listJobs(req, res, next) {
  try {
    const jobs = await Job.find()
      .sort({ createdAt: -1 })
      .select(
        "employerId title category type country state city address date startTime endTime payment minSalary maxSalary contactName phone status applicants createdAt updatedAt"
      );

    return res.json({
      ok: true,
      data: {
        jobs: jobs.map((j) => ({
          id: j._id.toString(),
          employerId: j.employerId?.toString(),
          title: j.title,
          category: j.category,
          type: j.type,
          country: j.country,
          state: j.state,
          city: j.city,
          address: j.address,
          date: j.date,
          startTime: j.startTime,
          endTime: j.endTime,
          payment: j.payment,
          minSalary: j.minSalary,
          maxSalary: j.maxSalary,
          contactName: j.contactName,
          phone: j.phone,
          status: j.status,
          applicants: j.applicants,
          createdAt: j.createdAt,
          updatedAt: j.updatedAt,
        })),
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function trashJob(req, res, next) {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({
        ok: false,
        error: { code: "NOT_FOUND", message: "Job not found" },
      });
    }

    job.status = "Cancelled";
    await job.save();

    return res.json({
      ok: true,
      data: { id: job._id.toString(), status: job.status },
    });
  } catch (err) {
    return next(err);
  }
}

async function restoreJob(req, res, next) {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({
        ok: false,
        error: { code: "NOT_FOUND", message: "Job not found" },
      });
    }

    job.status = "Active";
    await job.save();

    return res.json({
      ok: true,
      data: { id: job._id.toString(), status: job.status },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { listJobs, trashJob, restoreJob };
