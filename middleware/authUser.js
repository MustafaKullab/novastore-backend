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
        next();
      } catch (error) {
        console.log(error);
      }
    }
  });
};

module.exports = authUser;
