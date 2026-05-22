const Job = require("../models/Job");
const Enquiry = require("../models/Enquiry");

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

function normalizeJobPayload(body, employerProfile = {}) {
  return {
    title: body?.title || "New Requirement",
    category: body?.category || "General",
    type: normalizeJobType(body?.type) || "Full Time",
    country: body?.country || "IN",
    state: body?.state || "",
    city: body?.city || "",
    address: body?.address || "",
    date: body?.date || "",
    startTime: body?.startTime || "",
    endTime: body?.endTime || "",
    payment: body?.payment || "",
    minSalary: body?.minSalary || "",
    maxSalary: body?.maxSalary || "",
    contactName: body?.contactName || employerProfile?.name || employerProfile?.companyName || "Employer",
    phone: body?.phone || "",
    status: body?.status || "Active",
    applicants: Number.isFinite(body?.applicants) ? body.applicants : 0,
  };
}

function normalizeJobType(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const lower = raw.toLowerCase();
  if (lower.includes("one day") || lower.includes("oneday")) return "One Day Job";
  if (lower.includes("full time")) return "Full Time";
  if (lower.includes("part time")) return "Part Time";
  return raw;
}

async function createJob(req, res, next) {
  try {
    requireEmployer(req);
    const payload = normalizeJobPayload(req.body, req.employer?.profile);
    const job = await Job.create({
      ...payload,
      employerId: req.employer._id,
    });
    return res.json({ ok: true, data: { job } });
  } catch (err) {
    return next(err);
  }
}

async function listEmployerJobs(req, res, next) {
  try {
    requireEmployer(req);
    const jobs = await Job.find({ employerId: req.employer._id }).sort({ createdAt: -1 });
    return res.json({ ok: true, data: { jobs } });
  } catch (err) {
    return next(err);
  }
}

async function listWorkerJobs(req, res, next) {
  try {
    requireWorker(req);
    const jobs = await Job.find({ status: "Active" }).sort({ createdAt: -1 }).lean();
    const enquiries = await Enquiry.find({ workerId: req.worker._id }).select("jobId").lean();
    const appliedSet = new Set(enquiries.map((e) => String(e.jobId)));

    const jobsWithApplied = jobs.map((job) => ({
      ...job,
      applied: appliedSet.has(String(job._id)),
    }));

    return res.json({ ok: true, data: { jobs: jobsWithApplied } });
  } catch (err) {
    return next(err);
  }
}

async function deleteEmployerJob(req, res, next) {
  try {
    requireEmployer(req);
    const jobId = req.params?.jobId;
    if (!jobId) {
      const err = new Error("Job id is required");
      err.status = 400;
      throw err;
    }
    const deletedJob = await Job.findOneAndDelete({ _id: jobId, employerId: req.employer._id });
    if (!deletedJob) {
      const err = new Error("Job not found");
      err.status = 404;
      throw err;
    }
    return res.json({ ok: true, data: { job: deletedJob } });
  } catch (err) {
    return next(err);
  }
}

module.exports = { createJob, listEmployerJobs, listWorkerJobs, deleteEmployerJob };
