const User = require("../models/user.js");
const Order = require("../models/order.js");
const Contact = require("../models/contact.js");

// Function to send user to frontend
const post_user = async (req, res, next) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId).select(
      "-password -confPass -verificationCode"
    );

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// Function to get the current user
const GET_getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password -confPass -verificationCode"
    );

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// Function to get the users
const GET_users = async (req, res, next) => {
  try {
    const users = await User.find().select(
      "-password -confPass -verificationCode"
    );

    res.status(200).json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

// Function to delete user
const delete_user = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const deletedUser = await User.findByIdAndDelete(userId);

    const deletOrders = await Order.deleteMany({ userId });

    const deletMessages = await Contact.deleteMany({ userId });

    res.status(200).json({ success: true, deletedUser });
  } catch (error) {
    next(error);
  }
};

// Function to change the user name
const Patch_changeUsername = async (req, res, next) => {
  const userId = req.user._id;
  const { newUsername } = req.body;

  try {
    if (!newUsername) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid username" });
    }

    const usernameUpdated = await User.findByIdAndUpdate(
      userId,
      {
        username: newUsername,
      },
      { new: true }
    );

    res.status(200).json({ success: true, usernameUpdated });
  } catch (error) {
    next(error);
  }
};

// Function to get total orders
const GET_totalUsers = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();

    res.status(200).json({ success: true, totalUsers });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  post_user,
  GET_getUser,
  GET_users,
  delete_user,
  Patch_changeUsername,
  GET_totalUsers,
};
