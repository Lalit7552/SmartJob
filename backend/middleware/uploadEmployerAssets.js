const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

const UPLOAD_ROOT = path.join(__dirname, "..", "uploads", "employer-assets");

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const allowedExts = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function safeExtFromOriginal(name) {
  const ext = path.extname(String(name || "")).toLowerCase();
  if (!ext) return "";
  if (!/^\.[a-z0-9]{1,8}$/.test(ext)) return "";
  return ext;
}

function buildStorage() {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const employerId = req.employer?._id?.toString();
      if (!employerId) return cb(new Error("Missing employer context"));
      const dir = path.join(UPLOAD_ROOT, employerId);
      fs.mkdirSync(dir, { recursive: true });
      return cb(null, dir);
    },
    filename: (req, file, cb) => {
      const id = crypto.randomBytes(12).toString("hex");
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

const uploadEmployerAssets = multer({
  storage: buildStorage(),
  fileFilter,
  limits: {
    fileSize: Number(process.env.EMPLOYER_ASSET_MAX_BYTES || 3 * 1024 * 1024),
    files: 2,
  },
});

module.exports = { uploadEmployerAssets, UPLOAD_ROOT };
