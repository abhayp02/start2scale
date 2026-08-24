export function notFound(req, res) {
  res.status(404).json({ message: "API route not found" });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    next(error);
    return;
  }

  const isProduction = process.env.NODE_ENV === "production";
  const status = error.status || error.statusCode || 500;

  res.status(status).json({
    message:
      isProduction && status === 500
        ? "An unexpected server error occurred"
        : error.message || "An unexpected server error occurred",
  });
}
