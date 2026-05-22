const path = require("path");
const WorkerSession = require("../models/WorkerSession");
const { nextResponse } = require("../utils/nextStep");

function toInt(val) {
  const n = Number(val);
  if (!Number.isFinite(n)) return undefined;
  return n;
}

const stepOrder = ["profile", "skills", "documents", "done"];
function isAtOrAfter(current, required) {
  return stepOrder.indexOf(current) >= stepOrder.indexOf(required);
}

async function saveProfile(req, res, next) {
  try {
    const worker = req.worker;

    const { fullName, age, gender, country, state, city, area, about } = req.body || {};
    if (!fullName || !age || !gender) {
      return res.status(400).json({
        ok: false,
        error: { code: "VALIDATION", message: "fullName, age, gender are required" },
      });
    }

    const filesByField = req.files || {};
    const profilePhotoFile = filesByField.profilePhoto?.[0];

    function publicPathFor(file) {
      if (!file?.path) return undefined;
      const rel = require("path")
        .relative(require("path").join(__dirname, ".."), file.path)
        .replace(/\\/g, "/");
      return `/${rel}`;
    }

    worker.profile = {
      fullName: String(fullName),
      age: toInt(age),
      gender: String(gender),
      country: country ? String(country) : worker.profile?.country,
      state: state ? String(state) : worker.profile?.state,
      city: city ? String(city) : worker.profile?.city,
      area: area ? String(area) : worker.profile?.area,
      about: about ? String(about) : worker.profile?.about,
      profilePhoto: profilePhotoFile
        ? publicPathFor(profilePhotoFile)
        : worker.profile?.profilePhoto,
    };
    worker.profileStatus = "pending";

    if (worker.onboardingStep === "profile") {
      worker.onboardingStep = "skills";
      req.session.currentStep = "skills";
      await req.session.save();
    }
    await worker.save();

    return res.json({
      ok: true,
      data: {
        user: { id: worker._id.toString(), phone: worker.phone },
        next: nextResponse({ isNew: false, onboardingStep: worker.onboardingStep, kind: "onboarding" }),
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function saveSkills(req, res, next) {
  try {
    const worker = req.worker;
    if (!isAtOrAfter(worker.onboardingStep, "skills")) {
      return res.status(409).json({
        ok: false,
        error: { code: "STEP_ORDER", message: "Complete previous steps first", requiredStep: worker.onboardingStep },
      });
    }
    const skills = req.body?.skills;
    const { experience, jobType, salary, preferredArea } = req.body || {};
    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({
        ok: false,
        error: { code: "VALIDATION", message: "skills must be a non-empty array" },
      });
    }

    worker.skills = skills.map((s) => String(s).trim()).filter(Boolean);
    worker.skillDetails = {
      experience: experience ? String(experience) : worker.skillDetails?.experience,
      jobType: jobType ? String(jobType) : worker.skillDetails?.jobType,
      expectedSalary: salary ? toInt(salary) : worker.skillDetails?.expectedSalary,
      preferredArea: preferredArea ? String(preferredArea) : worker.skillDetails?.preferredArea,
    };

    if (worker.onboardingStep === "skills") {
      worker.onboardingStep = "documents";
      req.session.currentStep = "documents";
      await req.session.save();
    }

    await worker.save();
    return res.json({
      ok: true,
      data: {
        user: { id: worker._id.toString(), phone: worker.phone },
        next: nextResponse({ isNew: false, onboardingStep: worker.onboardingStep, kind: "onboarding" }),
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function uploadDocuments(req, res, next) {
  try {
    const worker = req.worker;

    if (worker.status === "active" || worker.onboardingStep === "done") {
      return res.status(400).json({
        ok: false,
        error: { code: "ALREADY_COMPLETE", message: "Onboarding already complete" },
      });
    }

    if (!isAtOrAfter(worker.onboardingStep, "documents")) {
      return res.status(409).json({
        ok: false,
        error: { code: "STEP_ORDER", message: "Complete previous steps first", requiredStep: worker.onboardingStep },
      });
    }

    const filesByField = req.files || {};
    const acceptedFields = ["photo", "idProof", "addressProof", "certificate"];
    const added = [];

    for (const field of acceptedFields) {
      const arr = filesByField[field];
      if (!arr || arr.length === 0) continue;
      for (const f of arr) {
        const rel = path.relative(path.join(__dirname, ".."), f.path);
        worker.documents.push({
          kind: field,
          originalName: f.originalname,
          storedName: f.filename,
          mimeType: f.mimetype,
          sizeBytes: f.size,
          storage: "local",
          localPath: rel,
        });
        added.push({ kind: field, storedName: f.filename });
      }
    }

    if (added.length === 0) {
      return res.status(400).json({
        ok: false,
        error: { code: "VALIDATION", message: "No documents uploaded" },
      });
    }

    worker.onboardingStep = "done";
    worker.status = "active";
    await worker.save();

    req.session.revokedAt = new Date();
    await req.session.save();

    await WorkerSession.updateMany(
      { workerId: worker._id, kind: "auth", revokedAt: { $exists: false } },
      { $set: { revokedAt: new Date() } }
    );

    const authExpiresAt = new Date(Date.now() + Number(process.env.AUTH_SESSION_TTL_SEC || 7 * 24 * 60 * 60) * 1000);
    const authSession = await WorkerSession.create({
      workerId: worker._id,
      kind: "auth",
      currentStep: "done",
      expiresAt: authExpiresAt,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    const jwt = require("jsonwebtoken");
    const authToken = jwt.sign(
      { sid: authSession._id.toString(), typ: "auth" },
      process.env.JWT_SECRET,
      { expiresIn: Number(process.env.AUTH_SESSION_TTL_SEC || 7 * 24 * 60 * 60) }
    );

    return res.json({
      ok: true,
      data: {
        user: { id: worker._id.toString(), phone: worker.phone },
        documents: added,
        session: { kind: "auth", token: authToken, expiresAt: authSession.expiresAt },
        next: nextResponse({ isNew: false, onboardingStep: "done", kind: "auth" }),
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function me(req, res, next) {
  try {
    const worker = req.worker;
    return res.json({
      ok: true,
      data: {
        user: {
          id: worker._id.toString(),
          phone: worker.phone,
          status: worker.status,
          onboardingStep: worker.onboardingStep,
          profileStatus: worker.profileStatus,
          profile: worker.profile,
          skills: worker.skills,
          skillDetails: worker.skillDetails,
          documents: worker.documents?.map((d) => ({
            kind: d.kind,
            originalName: d.originalName,
            mimeType: d.mimeType,
            sizeBytes: d.sizeBytes,
            uploadedAt: d.uploadedAt,
          })),
        },
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function onboardingStatus(req, res, next) {
  try {
    const worker = req.worker;
    return res.json({
      ok: true,
      data: {
        user: {
          id: worker._id.toString(),
          phone: worker.phone,
          onboardingStep: worker.onboardingStep,
          status: worker.status,
          profileStatus: worker.profileStatus,
        },
        next: nextResponse({ isNew: false, onboardingStep: worker.onboardingStep, kind: "onboarding" }),
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function updateProfileAuth(req, res, next) {
  try {
    const worker = req.worker;

    const { fullName, age, gender, country, state, city, area, about } = req.body || {};

    const filesByField = req.files || {};
    const profilePhotoFile = filesByField.profilePhoto?.[0];

    function publicPathFor(file) {
      if (!file?.path) return undefined;
      const rel = require("path")
        .relative(require("path").join(__dirname, ".."), file.path)
        .replace(/\\/g, "/");
      return `/${rel}`;
    }

    worker.profile = {
      ...(worker.profile || {}),
      ...(fullName ? { fullName: String(fullName) } : {}),
      ...(age ? { age: toInt(age) } : {}),
      ...(gender ? { gender: String(gender) } : {}),
      ...(country ? { country: String(country) } : {}),
      ...(state ? { state: String(state) } : {}),
      ...(city ? { city: String(city) } : {}),
      ...(area ? { area: String(area) } : {}),
      ...(about ? { about: String(about) } : {}),
      ...(profilePhotoFile ? { profilePhoto: publicPathFor(profilePhotoFile) } : {}),
    };

    worker.profileStatus = "pending";
    await worker.save();

    return res.json({
      ok: true,
      data: {
        user: {
          id: worker._id.toString(),
          phone: worker.phone,
          status: worker.status,
          onboardingStep: worker.onboardingStep,
          profileStatus: worker.profileStatus,
          profile: worker.profile,
          skills: worker.skills,
          skillDetails: worker.skillDetails,
          documents: worker.documents?.map((d) => ({
            kind: d.kind,
            originalName: d.originalName,
            mimeType: d.mimeType,
            sizeBytes: d.sizeBytes,
            uploadedAt: d.uploadedAt,
          })),
        },
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function updateSkillsAuth(req, res, next) {
  try {
    const worker = req.worker;
    const skills = req.body?.skills;
    const { experience, jobType, salary, preferredArea } = req.body || {};

    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({
        ok: false,
        error: { code: "VALIDATION", message: "skills must be a non-empty array" },
      });
    }

    worker.skills = skills.map((s) => String(s).trim()).filter(Boolean);
    worker.skillDetails = {
      experience: experience ? String(experience) : worker.skillDetails?.experience,
      jobType: jobType ? String(jobType) : worker.skillDetails?.jobType,
      expectedSalary: salary ? toInt(salary) : worker.skillDetails?.expectedSalary,
      preferredArea: preferredArea ? String(preferredArea) : worker.skillDetails?.preferredArea,
    };

    worker.profileStatus = worker.profileStatus || "pending";
    await worker.save();

    return res.json({
      ok: true,
      data: {
        user: {
          id: worker._id.toString(),
          phone: worker.phone,
          status: worker.status,
          onboardingStep: worker.onboardingStep,
          profileStatus: worker.profileStatus,
          profile: worker.profile,
          skills: worker.skills,
          skillDetails: worker.skillDetails,
          documents: worker.documents?.map((d) => ({
            kind: d.kind,
            originalName: d.originalName,
            mimeType: d.mimeType,
            sizeBytes: d.sizeBytes,
            uploadedAt: d.uploadedAt,
          })),
        },
      },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { saveProfile, saveSkills, uploadDocuments, me, onboardingStatus, updateProfileAuth, updateSkillsAuth };
