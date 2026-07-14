const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    validate: [isEmail, "Please enter a valid email"],
  },
  avatar: {
    type: String,
    default: null,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be equal at least 6 chars"],
  },
  confPass: {
    type: String,
    required: [true, "Confirm password is required"],
  },
  verificationCode: {
    type: String,
    default: null,
  },
  joinedAt: {
    type: String,
    default: () => new Date().toLocaleDateString("en-GB"),
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
});

//Before save in db
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  if (this.password !== this.confPass) {
    throw Error("Both passwords must be equal");
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.confPass = undefined;
});

// Function to login
userSchema.statics.login = async function (email, password) {
  const user = await User.findOne({ email });

  if (!user) throw Error("User is not found, please signup!");

  const auth = await bcrypt.compare(password, user.password);

  if (!auth) throw Error("Password is not correct");

  return user;
};

// Function to check if the user enter the correct password or not
userSchema.methods.checkPass = async function (currentPassword) {
  const auth = await bcrypt.compare(currentPassword, this.password);

  return auth;
};

const User = mongoose.model("user", userSchema);

module.exports = User;
