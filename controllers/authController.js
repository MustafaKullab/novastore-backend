const User = require("../models/user.js");
const sendEmail = require("../utils/sendEmail.js");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const handleErrors = require("../utils/handleErrors.js");

// Function to create tokens
const createAccessToken = (id) => {
  return jwt.sign({ id }, process.env.ACCESS_TOKEN, { expiresIn: "15m" });
};

const createRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN, { expiresIn: "7d" });
};

// Function to sign new user
const post_signup = async (req, res) => {
  const { username, email, password, confPass } = req.body;

  // if there is error comes from router
  const errors = {};
  const result = validationResult(req);
  if (!result.isEmpty()) {
    result.array().map((error) => {
      errors[error.path] = error.msg;
    });
    return res.status(400).json({ success: false, errors });
  }

  //If there is avatar store it
  const avatar = req.file ? `uploads/${req.file.filename}` : null;

  //Create verification code
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  try {
    const user = await User.create({
      username,
      email,
      avatar,
      password,
      confPass,
      verificationCode,
    });

    //Send email
    await sendEmail({
      to: email,
      subject: `مرحبا ${username}, كود تأكيد الحساب`,
      text: `كود تأكيد حسابك هو ${verificationCode}`,
    });

    res.status(201).json({ success: true, user });
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({ success: false, errors });
  }
};

// Function to verify the code
const post_verify = async (req, res, next) => {
  const { code, userId } = req.body;
  try {
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User is not found" });
    }

    if (user.verificationCode !== code) {
      return res
        .status(400)
        .json({ success: false, message: "Code is not correct" });
    }

    //Update user
    await User.findByIdAndUpdate(userId, {
      verificationCode: null,
      isVerified: true,
    });

    // create tokens
    const accessToken = createAccessToken(userId);
    const refreshToken = createRefreshToken(userId);

    // Send Cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// Function to login user
const post_login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);

    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Your password is correct, but your account needs activation",
      });
    }

    // create tokens
    const accessToken = createAccessToken(user._id);
    const refreshToken = createRefreshToken(user._id);

    // Send Cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({ success: false, errors });
  }
};

// Function to handle with forgot password
const post_forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User is not found" });
    }

    const resetPasswordCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Send Email
    await sendEmail({
      to: email,
      subject: `مرحبا ${user.username}, كود تغيير كلمة المرور`,
      text: `كود تغيير كلمة المرور هو : ${resetPasswordCode}`,
    });

    await User.findByIdAndUpdate(user._id, {
      verificationCode: resetPasswordCode,
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// Function to reset password
const post_resetPassword = async (req, res, next) => {
  const { userId, code, newPassword, retypePassword } = req.body;

  if (newPassword !== retypePassword) {
    return res
      .status(400)
      .json({ success: false, message: "Both passwords must be equals" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be contains at least 6 chars",
    });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User is not found" });
    }

    if (user.verificationCode !== code) {
      return res
        .status(400)
        .json({ success: false, message: "Code is not correct" });
    }

    // Update password
    user.verificationCode = null;
    user.password = newPassword;
    user.confPass = newPassword;
    await user.save();

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// Function to reset the password from profile page
const post_resetProfilePassword = async (req, res, next) => {
  const userId = req.user._id;
  const { currentPassword, newPassword, confNewPassword } = req.body;

  try {
    const user = await User.findById(userId);

    const authCurrentUser = await user.checkPass(currentPassword);

    if (!authCurrentUser) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is not correct!" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be equal at least 6 chars",
      });
    }

    if (newPassword !== confNewPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Both passwords must be equal" });
    }

    // لفحص هل كلمة المرور الجديدة نفس القديمة ؟
    const samePassword = await user.checkPass(newPassword);

    if (samePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    user.password = newPassword;
    user.confPass = newPassword;

    await user.save();

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// Function to refresh token
const post_refresh = (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ success: false, message: "No token" });
  }

  jwt.verify(token, process.env.REFRESH_TOKEN, (err, decodedURI) => {
    if (err) {
      return res.status(401).json({ success: false });
    } else {
      const accessToken = createAccessToken(decodedURI.id);
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        maxAge: 15 * 60 * 1000,
      });
      res.status(200).json({ success: true });
    }
  });
};

// Function to logout user
const post_logout = (req, res) => {
  res.cookie("accessToken", "", { maxAge: 1 });
  res.cookie("refreshToken", "", { maxAge: 1 });

  res.status(200).json({ success: true });
};

module.exports = {
  post_signup,
  post_verify,
  post_login,
  post_forgotPassword,
  post_resetPassword,
  post_resetProfilePassword,
  post_refresh,
  post_logout,
};
