const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

const UPLOAD_ROOT = path.join(__dirname, "..", "uploads", "worker-docs");

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "application/pdf",
]);

const allowedExts = new Set([".jpg", ".jpeg", ".png", ".pdf"]);

function safeExtFromOriginal(name) {
  const ext = path.extname(String(name || "")).toLowerCase();
  if (!ext) return "";
  if (!/^\.[a-z0-9]{1,8}$/.test(ext)) return "";
  return ext;
}

function buildStorage() {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const workerId = req.worker?._id?.toString();
      if (!workerId) return cb(new Error("Missing worker context"));
      const dir = path.join(UPLOAD_ROOT, workerId);
      fs.mkdirSync(dir, { recursive: true });
      return cb(null, dir);
    },
    filename: (req, file, cb) => {
      const id = crypto.randomBytes(16).toString("hex");
      const ext = safeExtFromOriginal(file.originalname);
      const name = `${Date.now()}_${id}${ext}`;
      return cb(null, name);
    },
  });
}

function fileFilter(req, file, cb) {
  const ext = safeExtFromOriginal(file.originalname);
  if (ext && !allowedExts.has(ext)) {
    return cb(new Error("Unsupported file type"));
  }
  if (!allowedMimeTypes.has(file.mimetype)) {
    return cb(new Error("Unsupported file type"));
  }
  return cb(null, true);
}

const uploadWorkerDocs = multer({
  storage: buildStorage(),
  fileFilter,
  limits: {
    fileSize: Number(process.env.WORKER_DOC_MAX_BYTES || 5 * 1024 * 1024),
    files: 6,
  },
});

module.exports = { uploadWorkerDocs, UPLOAD_ROOT };
