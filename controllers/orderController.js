const Cart = require("../models/cart.js");
const Order = require("../models/order.js");

// Function to confirm the order
const post_order = async (req, res, next) => {
  const userId = req.user._id;

  try {
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    //Items of order
    const orderItems = cart.items.map((item) => {
      return {
        productId: item.productId._id,
        price: item.productId.price,
        quantity: item.quantity,
      };
    });

    //Store the total price in variable
    const totalPrice = cart.items.reduce(
      (acc, item) => acc + item.quantity * item.productId.price,
      0
    );

    const order = await Order.create({ userId, items: orderItems, totalPrice });

    //discharge the cart
    cart.items = [];

    //Save changes
    await cart.save();

    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// Function to get the latest 5 orders
const GET_latestOrders = async (req, res, next) => {
  try {
    //لتحصل على اخر 5 اوردرات
    const latestOrders = await Order.find()
      .populate("userId", "-password -confPass -verificationCode")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      latestOrders,
    });
  } catch (error) {
    next(error);
  }
};

// Function to get the order
const post_getOrder = async (req, res, next) => {
  const { orderId } = req.body;
  const userId = req.user._id;

  try {
    const order = await Order.findById(orderId)
      .populate("items.productId")
      .populate("userId", "-password -confPass -verificationCode");

    if (!order) {
      return res
        .status(400)
        .json({ success: false, message: "Order not found" });
    }

    if (
      order.userId._id.toString() !== userId.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// Function to get total orders
const GET_totalOrders = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();

    res.status(200).json({ success: true, totalOrders });
  } catch (error) {
    next(error);
  }
};

// Function to get the revenue of orders
const GET_revenue = async (req, res, next) => {
  try {
    const orders = await Order.aggregate([
      {
        $group: {
          _id: null,
          revenue: {
            $sum: "$totalPrice",
          },
        },
      },
    ]);

    const revenue = orders[0]?.revenue || 0;

    res.status(200).json({ success: true, revenue });
  } catch (error) {
    next(error);
  }
};

// Function to update the status of order
const patch_updateStatus = async (req, res, next) => {
  const { orderId, statusSelected } = req.body;

  try {
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        status: statusSelected,
      },
      { returnDocument: "after" }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// Function to get all orders of user
const GET_allOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

// Function to get all orders of all users
const GET_allOrdersAllUsers = async (req, res, next) => {
  try {
    const orders = await Order.find().populate(
      "userId",
      "-password -confPass -verificationCode"
    );

    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

// Function to delete the order
const delete_order = async (req, res, next) => {
  const { orderId } = req.params;
  try {
    const deletedOrder = await Order.findByIdAndDelete(orderId);

    res.status(200).json({ success: true, deletedOrder });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  post_order,
  GET_latestOrders,
  post_getOrder,
  GET_totalOrders,
  GET_revenue,
  patch_updateStatus,
  GET_allOrders,
  GET_allOrdersAllUsers,
  delete_order,
};
