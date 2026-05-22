const { verifySessionToken } = require("../utils/sessionAuth");

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

function authAny({ kind = "auth" } = {}) {
  return async (req, res, next) => {
    try {
      const token = getBearerToken(req);
      const result = await verifySessionToken({ token, kind });
      if (result.actor === "worker") {
        req.worker = result.user;
      } else {
        req.employer = result.user;
      }
      req.session = result.session;
      req.tokenPayload = result.tokenPayload;
      return next();
    } catch (err) {
      if (err?.status) {
        return res.status(err.status).json({
          ok: false,
          error: { code: err.code || "AUTH_INVALID", message: err.message || "Invalid session token" },
        });
      }
      return next(err);
    }
  };
}

module.exports = { authAny };
