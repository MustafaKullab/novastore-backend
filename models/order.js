const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  items: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: "product",
      },
      price: {
        type: Number,
        required: [true, "Price of product is required"],
      },
      quantity: {
        type: Number,
        required: [true, "Quantity of product is required"],
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: [true, "Total price is required"],
  },
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  createdAt: {
    type: String,
    default: () => new Date().toLocaleDateString("en-GB"),
  },
  time: {
    type: String,
    default: () =>
      new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
  },
});

const Order = mongoose.model("order", orderSchema);

module.exports = Order;
