const express = require("express");
const { requestOtp, verifyOtp } = require("../controllers/workerAuthController");
const {
  saveProfile,
  saveSkills,
  uploadDocuments,
  me,
  onboardingStatus,
  updateProfileAuth,
  updateSkillsAuth,
} = require("../controllers/workerOnboardingController");
const { listWorkerJobs } = require("../controllers/jobController");
const {
  createJobEnquiry,
  listWorkerEnquiries,
  verifyEnquiryOtp,
  completeEnquiryWork,
} = require("../controllers/enquiryController");
const { listWorkerRatings } = require("../controllers/workerRatingController");
const { getWorkerWallet } = require("../controllers/walletController");
const { authSession } = require("../middleware/auth");
const { uploadWorkerDocs } = require("../middleware/uploadWorkerDocs");
const { uploadWorkerAssets } = require("../middleware/uploadWorkerAssets");

const router = express.Router();

router.post("/signup/request-otp", requestOtp);
router.post("/signup/verify-otp", verifyOtp);

router.get("/me", authSession({ kind: "auth" }), me);
router.put(
  "/profile",
  authSession({ kind: "auth" }),
  uploadWorkerAssets.fields([{ name: "profilePhoto", maxCount: 1 }]),
  updateProfileAuth
);
router.put("/skills", authSession({ kind: "auth" }), updateSkillsAuth);
router.get("/jobs", authSession({ kind: "auth" }), listWorkerJobs);
router.post("/jobs/:jobId/apply", authSession({ kind: "auth" }), createJobEnquiry);
router.get("/enquiries", authSession({ kind: "auth" }), listWorkerEnquiries);
router.post("/enquiries/:enquiryId/otp/verify", authSession({ kind: "auth" }), verifyEnquiryOtp);
router.post("/enquiries/:enquiryId/complete", authSession({ kind: "auth" }), completeEnquiryWork);
router.get("/ratings", authSession({ kind: "auth" }), listWorkerRatings);
router.get("/wallet", authSession({ kind: "auth" }), getWorkerWallet);

router.get("/onboarding/status", authSession({ kind: "onboarding" }), onboardingStatus);
router.post(
  "/onboarding/profile",
  authSession({ kind: "onboarding" }),
  uploadWorkerAssets.fields([{ name: "profilePhoto", maxCount: 1 }]),
  saveProfile
);
router.post("/onboarding/skills", authSession({ kind: "onboarding" }), saveSkills);
router.post(
  "/onboarding/documents",
  authSession({ kind: "onboarding" }),
  uploadWorkerDocs.fields([
    { name: "photo", maxCount: 1 },
    { name: "idProof", maxCount: 1 },
    { name: "addressProof", maxCount: 1 },
    { name: "certificate", maxCount: 3 },
  ]),
  uploadDocuments
);

module.exports = router;
