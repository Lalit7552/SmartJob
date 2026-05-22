const EmployerSession = require("../models/EmployerSession");
const { nextEmployerResponse } = require("../utils/nextStepEmployer");

function toInt(val) {
  const n = Number(val);
  if (!Number.isFinite(n)) return undefined;
  return n;
}

async function saveProfile(req, res, next) {
  try {
    const employer = req.employer;
    if (!employer || !req.session) {
      const err = new Error("Missing employer context");
      err.status = 401;
      throw err;
    }

    const { name, companyName, lastName, email, city, address, establishedYear, phone } = req.body || {};
    const companyValue = companyName || lastName;
    if (!name || !companyValue) {
      return res.status(400).json({
        ok: false,
        error: { code: "VALIDATION", message: "name and lastName are required" },
      });
    }

    const filesByField = req.files || {};
    const profilePhotoFile = filesByField.profilePhoto?.[0];
    const companyLogoFile = filesByField.companyLogo?.[0];

    function publicPathFor(file) {
      if (!file?.path) return undefined;
      const rel = require("path")
        .relative(require("path").join(__dirname, ".."), file.path)
        .replace(/\\/g, "/");
      return `/${rel}`;
    }

    employer.profile = {
      name: String(name),
      companyName: String(companyValue),
      email: email ? String(email) : employer.profile?.email,
      city: city ? String(city) : employer.profile?.city,
      address: address ? String(address) : employer.profile?.address,
      establishedYear: establishedYear ? toInt(establishedYear) : employer.profile?.establishedYear,
      profilePhoto: profilePhotoFile ? publicPathFor(profilePhotoFile) : employer.profile?.profilePhoto,
      companyLogo: companyLogoFile ? publicPathFor(companyLogoFile) : employer.profile?.companyLogo,
    };
    if (phone) {
      employer.phone = String(phone);
    }

    employer.onboardingStep = "done";
    employer.status = "active";
    await employer.save();

    req.session.revokedAt = new Date();
    req.session.currentStep = "done";
    await req.session.save();

    await EmployerSession.updateMany(
      { employerId: employer._id, kind: "auth", revokedAt: { $exists: false } },
      { $set: { revokedAt: new Date() } }
    );

    const authExpiresAt = new Date(Date.now() + Number(process.env.AUTH_SESSION_TTL_SEC || 7 * 24 * 60 * 60) * 1000);
    const authSession = await EmployerSession.create({
      employerId: employer._id,
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
        user: { id: employer._id.toString(), phone: employer.phone },
        session: { kind: "auth", token: authToken, expiresAt: authSession.expiresAt },
        next: nextEmployerResponse({ isNew: false, onboardingStep: "done", kind: "auth" }),
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function me(req, res, next) {
  try {
    const employer = req.employer;
    return res.json({
      ok: true,
      data: {
        user: {
          id: employer._id.toString(),
          phone: employer.phone,
          status: employer.status,
          onboardingStep: employer.onboardingStep,
          profile: employer.profile,
        },
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const employer = req.employer;

    const { name, companyName, lastName, email, city, address, establishedYear, phone } = req.body || {};
    const companyValue = companyName || lastName;

    const filesByField = req.files || {};
    const profilePhotoFile = filesByField.profilePhoto?.[0];
    const companyLogoFile = filesByField.companyLogo?.[0];

    function publicPathFor(file) {
      if (!file?.path) return undefined;
      const rel = require("path")
        .relative(require("path").join(__dirname, ".."), file.path)
        .replace(/\\/g, "/");
      return `/${rel}`;
    }

    employer.profile = {
      ...(employer.profile || {}),
      ...(name ? { name: String(name) } : {}),
      ...(companyValue ? { companyName: String(companyValue) } : {}),
      ...(email ? { email: String(email) } : {}),
      ...(city ? { city: String(city) } : {}),
      ...(address ? { address: String(address) } : {}),
      ...(establishedYear ? { establishedYear: toInt(establishedYear) } : {}),
      ...(profilePhotoFile ? { profilePhoto: publicPathFor(profilePhotoFile) } : {}),
      ...(companyLogoFile ? { companyLogo: publicPathFor(companyLogoFile) } : {}),
    };
    if (phone) {
      employer.phone = String(phone);
    }

    await employer.save();

    return res.json({
      ok: true,
      data: {
        user: {
          id: employer._id.toString(),
          phone: employer.phone,
          status: employer.status,
          onboardingStep: employer.onboardingStep,
          profile: employer.profile,
        },
      },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { saveProfile, me, updateProfile };
