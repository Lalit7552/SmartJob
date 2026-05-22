function errorHandler(err, req, res, next) {
  const _next = next;

  let status = err?.statusCode || err?.status || 500;
  let code = err?.code || (status >= 500 ? "INTERNAL" : "BAD_REQUEST");
  let message = err?.message || (status >= 500 ? "Internal server error" : "Bad request");
  const details = {};

  if (err?.name === "MulterError") {
    status = 400;
    code = "UPLOAD_ERROR";
    if (err.code === "LIMIT_FILE_SIZE") message = "File too large";
    else if (err.code === "LIMIT_FILE_COUNT") message = "Too many files";
    else message = "Upload error";
    details.multer = err.code;
  } else if (message === "Unsupported file type") {
    status = 400;
    code = "UPLOAD_TYPE";
    message = "Unsupported file type";
  } else if (message === "Missing worker context") {
    status = 401;
    code = "AUTH_INVALID";
    message = "Invalid session";
  } else if (message === "Missing employer context") {
    status = 401;
    code = "AUTH_INVALID";
    message = "Invalid session";
  }

  if (status >= 500) {
    // Keep server logs for debugging; avoid leaking internals to clients.
    // eslint-disable-next-line no-console
    console.error(err);
    message = "Internal server error";
  }

  return res.status(status).json({
    ok: false,
    error: { code, message, ...(Object.keys(details).length ? { details } : {}) },
  });
}

module.exports = { errorHandler };
