const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authUser = async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ success: false, message: "No token" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN, async (err, decodeURI) => {
    if (err) {
      return res
        .status(401)
        .json({ success: false, message: "Something went error" });
    } else {
      try {
        req.user = await User.findById(decodeURI.id);
        if (!req.user) {
          return res
            .status(401)
            .json({ success: false, message: "User not found" });
        }
        next();
      } catch (error) {
        return next(error);
      }
    }
  });
};

module.exports = authUser;
