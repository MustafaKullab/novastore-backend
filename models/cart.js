const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = new Schema({
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
      quantity: {
        type: Number,
        required: [true, "Quantity of product is required"],
      },
    },
  ],
});

const Cart = mongoose.model("cart", cartSchema);

module.exports = Cart;
