const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { isEmail } = require("validator");

const contactSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  fullName: {
    type: String,
    required: [true, "Please enter a full name"],
  },
  email: {
    type: String,
    required: [true, "Please enter a full name"],
    validate: [isEmail, "Please enter a valid email"],
  },
  subject: {
    type: String,
    required: [true, "Please enter a subject"],
  },
  message: {
    type: String,
    required: [true, "Please enter your message"],
  },
  status: {
    type: String,
    enum: ["Read", "Unread"],
    default: "Unread",
  },
  isRelpied: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: String,
    default: () => new Date().toLocaleDateString("en-GB"),
  },
});

const Contact = mongoose.model("contact", contactSchema);

module.exports = Contact;
