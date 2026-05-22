const express = require("express");
const { requestOtp, verifyOtp } = require("../controllers/employerAuthController");
const { saveProfile, me, updateProfile } = require("../controllers/employerOnboardingController");
const { listApprovedWorkers } = require("../controllers/employerWorkersController");
const { upsertWorkerRating } = require("../controllers/workerRatingController");
const { listEmployerEnquiries, generateEnquiryOtp } = require("../controllers/enquiryController");
const { createJob, listEmployerJobs, deleteEmployerJob } = require("../controllers/jobController");
const { authSession } = require("../middleware/auth");
const { uploadEmployerAssets } = require("../middleware/uploadEmployerAssets");

const router = express.Router();

router.post("/signup/request-otp", requestOtp);
router.post("/signup/verify-otp", verifyOtp);

router.get("/me", authSession({ actor: "employer", kind: "auth" }), me);
router.put(
  "/profile",
  authSession({ actor: "employer", kind: "auth" }),
  uploadEmployerAssets.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "companyLogo", maxCount: 1 },
  ]),
  updateProfile
);
router.get("/workers", authSession({ actor: "employer", kind: "auth" }), listApprovedWorkers);
router.post(
  "/workers/:workerId/ratings",
  authSession({ actor: "employer", kind: "auth" }),
  upsertWorkerRating
);
router.get("/enquiries", authSession({ actor: "employer", kind: "auth" }), listEmployerEnquiries);
router.post(
  "/enquiries/:enquiryId/otp",
  authSession({ actor: "employer", kind: "auth" }),
  generateEnquiryOtp
);
router.get("/jobs", authSession({ actor: "employer", kind: "auth" }), listEmployerJobs);
router.post("/jobs", authSession({ actor: "employer", kind: "auth" }), createJob);
router.delete("/jobs/:jobId", authSession({ actor: "employer", kind: "auth" }), deleteEmployerJob);
router.post(
  "/onboarding/profile",
  authSession({ actor: "employer", kind: "onboarding" }),
  (req, res, next) => {
    if (!req.is("multipart/form-data")) return next();
    return uploadEmployerAssets.fields([
      { name: "profilePhoto", maxCount: 1 },
      { name: "companyLogo", maxCount: 1 },
    ])(req, res, next);
  },
  saveProfile
);

module.exports = router;
