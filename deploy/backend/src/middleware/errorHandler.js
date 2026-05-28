function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  if (statusCode === 500) {
    console.error('[ErrorHandler]', err.stack || err.message);
  }

  res.status(statusCode).json({
    status: "fail",
    message,
    data: {}
  });
}

module.exports = { errorHandler };
