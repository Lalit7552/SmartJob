function getBearerToken(req) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

function requireAdmin(req, res, next) {
  const token = getBearerToken(req) || req.headers["x-admin-token"];
  const expected = process.env.ADMIN_TOKEN || "admin-login-success";

  if (!token || token !== expected) {
    return res.status(401).json({
      ok: false,
      error: { code: "AUTH_INVALID", message: "Invalid admin token" },
    });
  }

  return next();
}

module.exports = { requireAdmin };
