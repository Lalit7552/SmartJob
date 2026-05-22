const express = require("express");
const { requireAdmin } = require("../middleware/adminAuth");
const { listPendingWorkers, listWorkers, approveWorkerProfile, rejectWorkerProfile } = require("../controllers/adminWorkerController");
const { listEmployers, trashEmployer, restoreEmployer } = require("../controllers/adminEmployerController");
const { listJobs, trashJob, restoreJob } = require("../controllers/adminJobController");
const { getAdminWallet } = require("../controllers/walletController");
const { wipeDatabase } = require("../controllers/adminSystemController");

const router = express.Router();

router.get("/workers/pending", requireAdmin, listPendingWorkers);
router.get("/workers", requireAdmin, listWorkers);
router.post("/workers/:id/profile-approve", requireAdmin, approveWorkerProfile);
router.post("/workers/:id/profile-reject", requireAdmin, rejectWorkerProfile);
router.get("/employers", requireAdmin, listEmployers);
router.post("/employers/:id/trash", requireAdmin, trashEmployer);
router.post("/employers/:id/restore", requireAdmin, restoreEmployer);
router.get("/jobs", requireAdmin, listJobs);
router.post("/jobs/:id/trash", requireAdmin, trashJob);
router.post("/jobs/:id/restore", requireAdmin, restoreJob);
router.get("/wallet", requireAdmin, getAdminWallet);
router.post("/db/wipe", requireAdmin, wipeDatabase);

module.exports = router;
