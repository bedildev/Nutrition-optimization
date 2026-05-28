function notFoundHandler(req, res, next) {
  res.status(404).json({
    status: "fail",
    message: "Route not found",
    data: {}
  });
}

module.exports = { notFoundHandler };
