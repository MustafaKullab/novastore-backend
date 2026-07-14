const authAdmin = (role) => {
  return (req, res, next) => {
    if (req.user.role === role) {
      next();
    } else {
      return res
        .status(403)
        .json({ success: false, message: "Not allowed to access this page" });
    }
  };
};

module.exports = authAdmin;
