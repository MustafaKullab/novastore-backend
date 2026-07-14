const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { body } = require("express-validator");
const authUser = require("../middleware/authUser");
const authAdmin = require("../middleware/authAdmin");

const {
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
} = require("../controllers/controller");

//Router to sign new user
router.post(
  "/signup",
  upload.single("avatar"),
  [
    body("username")
      .notEmpty()
      .withMessage("Username is required")
      .trim()
      .escape(),
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Please enter a valid email")
      .trim()
      .escape(),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be contains at least 6 chars")
      .trim(),
    body("confPass")
      .notEmpty()
      .withMessage("Confirm password is required")
      .trim(),
  ],
  post_signup
);

// Router to verify the code
router.post("/verify", post_verify);

// Router to get the user
router.post("/getUser", post_user);

// Router to change the username of user
router.patch("/changeUsername", authUser, Patch_changeUsername);

//Router to login user
router.post("/login", post_login);

// Router forgot password
router.post("/forgotPassword", post_forgotPassword);

// Router to reset the password
router.post("/resetPassword", post_resetPassword);

// Router to reset password from profile
router.post("/resetPassFromProfile", authUser, post_resetProfilePassword);

// Router to get the current user
router.get("/getUser", authUser, GET_getUser);

//Router to get the users
router.get("/getUsers", authUser, authAdmin("admin"), authUser, GET_users);

// Router to delete user
router.delete("/deleteUser/:userId", authUser, authAdmin("admin"), delete_user);

// Router to add new category
router.post(
  "/addCategory",
  upload.single("image"),
  authUser,
  authAdmin("admin"),
  post_addCategory
);

// Router to change state of category
router.patch(
  "/changeStateCategory/:categoryId",
  authUser,
  authAdmin("admin"),
  patch_changeStateCategory
);

// Router to delete category
router.delete(
  "/deleteCategory/:categoryId",
  authUser,
  authAdmin("admin"),
  delete_category
);

// Router to get the categories
router.get("/allCategories", GET_categories);

// Router to add new product
router.post(
  "/addProduct",
  upload.single("image"),
  authUser,
  authAdmin("admin"),
  post_addProduct
);

// Router to get the product details
router.get("/getProduct/:productId", authUser, GET_productDetails);

// Router to edit the information of products
router.put(
  "/editProduct/:productId",
  upload.single("image"),
  authUser,
  authAdmin("admin"),
  put_editProduct
);

// Router to delete image from product
router.patch(
  "/deleteImgProduct/:productId",
  authUser,
  authAdmin("admin"),
  patch_delImgProduct
);

// Router to delete the product
router.delete(
  "/deleteProduct/:productId",
  authUser,
  authAdmin("admin"),
  delete_deleteProduct
);

// Router to get total products
router.get("/totalProducts", authUser, GET_totalProducts);

// Router to get total orders
router.get("/totalOrders", authUser, GET_totalOrders);

// Router to get total users
router.get("/totalUsers", authUser, GET_totalUsers);

// Router to get revenue of orders
router.get("/revenue", authUser, authAdmin("admin"), authUser, GET_revenue);

// Router to get the latest 5 orders
router.get("/latestOrders", authUser, authAdmin("admin"), GET_latestOrders);

// Router to get the Recend Messages
router.get("/recentMessages", authUser, authAdmin("admin"), GET_recentMessages);

// Router to get the low stock products
router.get(
  "/lowStockProducts",
  authUser,
  authAdmin("admin"),
  GET_lowStockProducts
);

// Router to add new item to cart
router.post("/addToCart", authUser, post_addToCart);

// Router to remove from cart
router.post("/rmvFromCart", authUser, post_rmvFromCart);

// router to decrease the quantity
router.post("/decreaseQuantity", authUser, post_decreaseQuantity);

// Router to confirm order
router.post("/confOrder", authUser, post_order);

// Router to get the order success
router.post("/getOrder", authUser, authAdmin("admin"), post_getOrder);

// Router to change the status of order
router.patch(
  "/updateStatucOfOrder",
  authUser,
  authAdmin("admin"),
  patch_updateStatus
);

// Router to delete the order
router.delete(
  "/deleteOrder/:orderId",
  authUser,
  authAdmin("admin"),
  delete_order
);

// Router to send success order message
router.post("/successOrderMessage", authUser, post_successMessage);

// Router to get all messages
router.get("/getMessages", authUser, authAdmin("admin"), GET_messages);

// Router to get the specific message
router.get("/specificMessage/:messageId", authUser, GET_specificMessage);

// Router to mark all as read
router.put("/markAsRead", authUser, authAdmin("admin"), put_markAsRead);

// Router to delete the message
router.delete(
  "/deleteMsg/:messageId",
  authUser,
  authAdmin("admin"),
  delete_message
);

// Router to send replay
router.post(
  "/sendReply/:messageId",
  authUser,
  authAdmin("admin"),
  post_sendReply
);

// Router to read the message
router.patch("/readMessage", authUser, authAdmin("admin"), patch_readMessage);

// Router to get all products
router.get("/products", Get_products);

// Router to get out of stock products
router.get("/outOfStockProducts", authUser, GET_outOfStockProducts);

// Router to get categories products (length)
router.get("/lenghCategories", authUser, GET_totalCategories);

// Router to get cart of user
router.get("/cart", authUser, Get_cart);

// Router to get all orders of user
router.get("/allOrders", authUser, GET_allOrders);

// Router to get all orders of all users
router.get("/orders", authUser, GET_allOrdersAllUsers);

// Router to get Product Selector
router.post("/productDetail", authUser, post_productDetail);

// Router to recieve the message from customer
router.post("/contactMessage", authUser, post_contactMsg);

// Router to refresh token
router.post("/refresh", post_refresh);

// Router to logout user
router.post("/logout", post_logout);
module.exports = router;
