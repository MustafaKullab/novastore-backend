const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  name: {
    type: String,
    required: [true, "Category name is required"],
    trim: true,
  },

  description: {
    type: String,
    required: [true, "Category description is required"],
    trim: true,
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  image: {
    type: String,
    default: null,
  },

  createdAt: {
    type: Date,
    default: () => Date.now(),
  },
});

const Category = mongoose.model("category", categorySchema);

module.exports = Category;
