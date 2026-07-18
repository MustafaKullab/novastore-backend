const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
  },
  description: {
    type: String,
    required: [true, "Product description is required"],
  },
  price: {
    type: Number,
    required: [true, "Product price is required"],
  },
  image: {
    type: String,
    default: null,
  },
  stock: {
    type: Number,
    default: 0,
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: "category",
  },
  createdAt: {
    type: Date,
    default: () => Date.now(),
  },
});

const Product = mongoose.model("product", productSchema);

module.exports = Product;
