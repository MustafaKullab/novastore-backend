const User = require("../models/user.js");
const Cart = require("../models/cart.js");
const Product = require("../models/product.js");

// Function to add new item to cart
const post_addToCart = async (req, res, next) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;

  try {
    let user = await User.findById(userId);

    // if user is not exist
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User is not found!" });
    }

    // Find the cart of user
    let cart = await Cart.findOne({ userId });

    // If there is not cart, create one
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    // Check if this item is exist
    const foundIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    //If quantity greather than stock
    const product = await Product.findById(productId);

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: "Stock of product is less than quantity",
      });
    }

    // if the product is exist in cart
    if (foundIndex > -1) {
      cart.items[foundIndex].quantity += quantity;
    } else {
      // if not
      cart.items.push({ productId, quantity });
    }

    await Product.findByIdAndUpdate(productId, { $inc: { stock: -quantity } });

    //Save the edit
    await cart.save();

    res.status(200).json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

// Function to remove from cart
const post_rmvFromCart = async (req, res, next) => {
  const userId = req.user._id;
  const { productId, quantity } = req.body;

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId.toString()
    );

    await Product.findByIdAndUpdate(productId, { $inc: { stock: +quantity } });

    await cart.save();

    res.status(200).json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

// Function to decrease the quantity of product
const post_decreaseQuantity = async (req, res, next) => {
  const userId = req.user._id;
  const { productId, quantity } = req.body;

  // Find the cart of user
  const cart = await Cart.findOne({ userId }).populate("items.productId");

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ success: false, message: "Cart is empty" });
  }

  // Decrease the quantity of product
  const theProduct = cart.items.find(
    (item) => item.productId._id.toString() === productId
  );

  if (theProduct.quantity <= quantity) {
    return res
      .status(400)
      .json({ success: false, message: "Minimum quantity is 1" });
  }

  theProduct.quantity -= quantity;

  await cart.save();
  res.status(200).json({
    success: true,
    cart,
  });
};

// Function to get the cart of user
const Get_cart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id }).populate(
      "items.productId"
    );
    res.status(200).json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  post_addToCart,
  post_rmvFromCart,
  post_decreaseQuantity,
  Get_cart,
};
