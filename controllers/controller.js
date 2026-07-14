const User = require("../models/user");
const Product = require("../models/product");
const Cart = require("../models/cart");
const Order = require("../models/order");
const Contact = require("../models/contact");
const Category = require("../models/category");
const { validationResult } = require("express-validator");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");

//Function to handle with errors comes from db
const handleErrors = (err) => {
  const errors = {};

  // ** Sign up errors **
  if (err.message.includes("validation failed")) {
    Object.values(err.errors).map((error) => {
      errors[error.path] = error.message;
    });
  }

  if (err.code === 11000) {
    errors["email"] = "Email already registered";
  }

  if (err.message.includes("Both passwords must be equal")) {
    errors["confPass"] = "Both passwords must be equal";
  }

  // ** login messages
  if (err.message.includes("User is not found, please signup!")) {
    errors["email"] = "User is not found, please signup!";
  }

  if (err.message.includes("Password is not correct")) {
    errors["password"] = "Password is not correct";
  }

  return errors;
};

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

// Function to send user to frontend
const post_user = async (req, res, next) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);

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

// Function to get the current user
const GET_getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// Function to get the users
const GET_users = async (req, res, next) => {
  try {
    const users = await User.find();

    console.log(users);

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

// Function to add new category
const post_addCategory = async (req, res, next) => {
  const { name, description, isActive } = req.body;

  const image = req.file ? `uploads/${req.file.filename}` : null;

  try {
    const category = await Category.create({
      name,
      description,
      isActive,
      image,
    });

    res.status(200).json({ success: true, category });
  } catch (error) {
    const errors = handleErrors(error);

    res.status(400).json({ success: false, errors });
  }
};

// Function to change the state of category
const patch_changeStateCategory = async (req, res, next) => {
  const { categoryId } = req.params;
  const { status } = req.body;

  try {
    const updatedCategory = await Category.findByIdAndUpdate(categoryId, {
      isActive: status,
    });

    res.status(200).json({ success: true, updatedCategory });
  } catch (error) {
    next(error);
  }
};

// Function to delete category
const delete_category = async (req, res, next) => {
  const { categoryId } = req.params;
  try {
    const categoryDeleted = await Category.findByIdAndDelete(categoryId);

    res.status(200).json({ success: true, categoryDeleted });
  } catch (error) {
    next(error);
  }
};

// Function to get the categories
const GET_categories = async (req, res, next) => {
  try {
    const categories = await Category.find();

    res.status(200).json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

// Function to add new product
const post_addProduct = async (req, res, next) => {
  const { name, description, price, stock, categoryId } = req.body;

  if (req.user.role !== "admin") {
    return res.status(400).json({
      success: false,
      message: " Only administrators are authorized to add new products.",
    });
  }

  const image = req.file ? `uploads/${req.file.filename}` : null;

  try {
    const product = await Product.create({
      name,
      description,
      price,
      stock,
      categoryId,
      image,
    });

    console.log(product);

    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// Function to get the product
const GET_productDetails = async (req, res, next) => {
  const { productId } = req.params;
  try {
    const product = await Product.findById(productId).populate("categoryId");

    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: "Product is not found" });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// Function to edit the product
const put_editProduct = async (req, res, next) => {
  const { productId } = req.params;
  const { name, description, price, stock, categoryId } = req.body;

  const image = req.file ? `uploads/${req.file.filename}` : null;
  try {
    const product = await Product.findByIdAndUpdate(productId, {
      name,
      description,
      price,
      stock,
      categoryId,
      image,
    });

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// Function to delete the product
const delete_deleteProduct = async (req, res, next) => {
  const productId = req.params.productId;

  const deletedProduct = await Product.findByIdAndDelete(productId);

  res.status(200).json({ success: true, deletedProduct });
  try {
    const productDeleted = await Product;
  } catch (error) {
    next(error);
  }
};

// Function to delete image from product
const patch_delImgProduct = async (req, res, next) => {
  const productId = req.params.productId;

  console.log(productId);

  try {
    const product = await Product.findByIdAndUpdate(productId, { image: null });

    console.log(product);

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// Function to get total products
const GET_totalProducts = async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments();

    res.status(200).json({ success: true, totalProducts });
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

// Function to get total orders
const GET_totalUsers = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();

    res.status(200).json({ success: true, totalUsers });
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

// Function to get the latest 5 orders
const GET_latestOrders = async (req, res, next) => {
  try {
    //لتحصل على اخر 5 اوردرات
    const latestOrders = await Order.find()
      .populate("userId")
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

// Function to get recent messages
const GET_recentMessages = async (req, res, next) => {
  try {
    const recentMessages = await Contact.find()
      .populate("userId")
      .sort({ date: -1 })
      .limit(5);

    res.status(200).json({ success: true, recentMessages });
  } catch (error) {
    next(error);
  }
};

// Function to get low stock products
const GET_lowStockProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ stock: 1 }).limit(3);

    res.status(200).json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

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

// Function to get the order
const post_getOrder = async (req, res, next) => {
  const { orderId } = req.body;

  try {
    const order = await Order.findById(orderId)
      .populate("items.productId")
      .populate("userId");

    res.status(200).json({ success: true, order });
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

// Function to send success order message
const post_successMessage = async (req, res, next) => {
  const userId = req.user._id;
  const { orderId } = req.body;
  try {
    const user = await User.findById(userId);

    const order = await Order.findById(orderId);

    await sendEmail({
      to: user.email,
      subject: "تم استلام طلبك بنجاح | NovaStore",
      text: "",
      html: `
      <div dir="rtl" style="
      font-family: Arial, Helvetica, sans-serif;
      line-height:1.8;
      font-size:16px;
      color:#333;
      ">

      <h2 style="color:#6C5CE7;">🎉 تم استلام طلبك بنجاح</h2>

      <p>
      مرحبًا <strong>${user.username}</strong>،
      </p>

      <p>
      يسرنا إبلاغك بأنه تم استلام طلبك بنجاح.
      </p>

      <p>
      يقوم فريق <strong>NovaStore</strong> حاليًا بمراجعة طلبك وتجهيزه،
      وسيتم معالجته في أقرب وقت ممكن.
      </p>

      <hr style="border:none;border-top:1px solid #eee;margin:25px 0;">

      <h3>بيانات الطلب</h3>

      <p><strong>رقم الطلب:</strong> ${order._id}</p>

      <p><strong>تاريخ الطلب:</strong> ${new Date(order.createdAt).toLocaleDateString("ar-EG")}</p>

      <p><strong>إجمالي الطلب:</strong> $${order.totalPrice}</p>

      <hr style="border:none;border-top:1px solid #eee;margin:25px 0;">

      <p>
      شكرًا لاختيارك <strong>NovaStore</strong>.
      نتطلع لخدمتك مرة أخرى.
      </p>

      <p style="margin-top:30px">
      مع أطيب التحيات،<br>
      <strong>فريق NovaStore</strong>
      </p>

      </div>
      `,
    });

    res
      .status(200)
      .json({ success: true, message: "Send success message is successfully" });
  } catch (error) {
    next(error);
  }
};

// Function to get all messages
const GET_messages = async (req, res, next) => {
  try {
    const messages = await Contact.find().populate("userId");

    res.status(200).json({ success: true, messages });
  } catch (error) {
    next(error);
  }
};

// Function to get specific message
const GET_specificMessage = async (req, res, next) => {
  const { messageId } = req.params;
  try {
    const message = await Contact.findById(messageId).populate("userId");

    res.status(200).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

// Function  to mark all messages as read
const put_markAsRead = async (req, res, next) => {
  try {
    const messages = await Contact.find().updateMany({ status: "Read" });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    next(error);
  }
};

// Function to delete the message
const delete_message = async (req, res, next) => {
  const messageId = req.params.messageId;

  try {
    const deletedMessage = await Contact.findByIdAndDelete(messageId);

    res.status(200).json({ success: true, deletedMessage });
  } catch (error) {
    next(error);
  }
};

// Function to send the replay
const post_sendReply = async (req, res, next) => {
  const messageId = req.params.messageId;
  const { fullName, email, reply } = req.body;

  try {
    await sendEmail({
      to: email,
      subject: `مرحبا ${fullName}, تلقينا مشكلتك `,
      html: `
      <div style="font-size: 18px; color: #644fe2">${reply}</div>
       <p style="margin-top:30px">
      مع أطيب التحيات،<br>
      <strong>NovaStore فريق</strong>
      </p>
      `,
    });
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

// Function to read the message
const patch_readMessage = async (req, res, next) => {
  const { messageId } = req.body;

  try {
    const updatedMessage = await Contact.findByIdAndUpdate(messageId, {
      status: "Read",
    });

    res.status(200).json({ success: true, updatedMessage });
  } catch (error) {
    next(error);
  }
};

// Function to get all products
const Get_products = async (req, res, next) => {
  try {
    const products = await Product.find().populate("categoryId");
    res.status(200).json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

// Function to get the out of stock products
const GET_outOfStockProducts = async (req, res, next) => {
  try {
    const outOfStock = (await Product.find()).filter(
      (product) => product.stock <= 3
    ).length;

    res.status(200).json({ success: true, outOfStock });
  } catch (error) {
    next(error);
  }
};

// Function to get the categories of products (length)
const GET_totalCategories = async (req, res, next) => {
  try {
    const categoriesLength = (await Product.distinct("category")).length;

    res.status(200).json({ success: true, categoriesLength });
  } catch (error) {
    next(error);
  }
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
    const orders = await Order.find().populate("userId");

    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

// Function  to get product detail
const post_productDetail = async (req, res, next) => {
  const userId = req.user._id;
  const { productId } = req.body;

  try {
    // Get the product
    const product = await Product.findById(productId).populate("categoryId");

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// Function to recieve the message from contact and store it in database
const post_contactMsg = async (req, res, next) => {
  const userId = req.user._id;
  const { fullName, email, subject, message } = req.body;

  console.log(fullName, email, subject, message);

  try {
    // get the user
    const user = await User.findById(userId);

    const contact = await Contact.create({
      userId,
      fullName,
      email,
      subject,
      message,
    });

    await sendEmail({
      to: contact.email,
      subject: `مرحبا ${contact.fullName}, شكراً لتواصلك معنا، تم استلام رسالتك وسنرد عليك في أقرب وقت.!`,
      html: `
      <div>
        <h1>لقد تلقينا رسالتك فيما يتعلق بـ ${subject}</h1>
      </div>
      <hr />
      <div>
        <p style="font-size: 18px; color: #644fe2"> سنقوم بالرد عليك في أقرب وقت ممكن </p>
      </div>
      `,
    });

    res.status(201).json({ success: true, contact });
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({ success: false, errors });
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
  post_user,
  post_login,
  post_forgotPassword,
  post_resetPassword,
  post_resetProfilePassword,
  GET_getUser,
  GET_users,
  delete_user,
  Patch_changeUsername,
  post_addCategory,
  patch_changeStateCategory,
  delete_category,
  GET_categories,
  post_addProduct,
  GET_productDetails,
  put_editProduct,
  delete_deleteProduct,
  patch_delImgProduct,
  GET_totalProducts,
  GET_totalOrders,
  GET_totalUsers,
  GET_revenue,
  GET_latestOrders,
  GET_recentMessages,
  GET_lowStockProducts,
  post_addToCart,
  post_rmvFromCart,
  post_decreaseQuantity,
  post_order,
  post_getOrder,
  patch_updateStatus,
  delete_order,
  post_successMessage,
  GET_messages,
  GET_specificMessage,
  put_markAsRead,
  delete_message,
  post_sendReply,
  patch_readMessage,
  Get_products,
  GET_outOfStockProducts,
  GET_totalCategories,
  Get_cart,
  GET_allOrders,
  GET_allOrdersAllUsers,
  post_productDetail,
  post_contactMsg,
  post_refresh,
  post_logout,
};
