const Employer = require("../models/Employer");

async function listEmployers(req, res, next) {
  try {
    const employers = await Employer.find()
      .sort({ updatedAt: -1 })
      .select("profile phone countryCode status adminStatus onboardingStep createdAt updatedAt");

    return res.json({
      ok: true,
      data: {
        employers: employers.map((e) => ({
          id: e._id.toString(),
          profile: e.profile,
          phone: e.phone,
          countryCode: e.countryCode,
          status: e.status,
          adminStatus: e.adminStatus,
          onboardingStep: e.onboardingStep,
          createdAt: e.createdAt,
          updatedAt: e.updatedAt,
        })),
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function trashEmployer(req, res, next) {
  try {
    const { id } = req.params;
    const employer = await Employer.findById(id);
    if (!employer) {
      return res.status(404).json({
        ok: false,
        error: { code: "NOT_FOUND", message: "Employer not found" },
      });
    }

    employer.adminStatus = "trashed";
    await employer.save();

    return res.json({
      ok: true,
      data: { id: employer._id.toString(), adminStatus: employer.adminStatus },
    });
  } catch (err) {
    return next(err);
  }
}

async function restoreEmployer(req, res, next) {
  try {
    const { id } = req.params;
    const employer = await Employer.findById(id);
    if (!employer) {
      return res.status(404).json({
        ok: false,
        error: { code: "NOT_FOUND", message: "Employer not found" },
      });
    }

    employer.adminStatus = "active";
    await employer.save();

    return res.json({
      ok: true,
      data: { id: employer._id.toString(), adminStatus: employer.adminStatus },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { listEmployers, trashEmployer, restoreEmployer };
