const handleError = (err, req, res, next) => {
  const status = err.status || 500;

  return res
    .status(status)
    .json({ success: false, message: err.message || "Something went error" });
};

module.exports = handleError;
