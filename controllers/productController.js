const Product = require("../models/product.js");
const fs = require("fs");
const path = require("path");

// Function to delete image
const deleteImageFile = (imagePath) => {
  if (!imagePath) return;

  const fullPath = path.join(__dirname, "..", "public", imagePath);

  fs.unlink(fullPath, (err) => {
    if (err) {
      console.log("Failed to delete image:" + err.message);
    }
  });
};

// Function to add new product
const post_addProduct = async (req, res, next) => {
  const { name, description, price, stock, categoryId } = req.body;

  const result = validationResult(req);

  const errors = {};
  if (!result.isEmpty()) {
    result.array().map((error) => {
      errors[error.path] = error.msg;
    });

    return res.status(400).json({ success: false, errors });
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

  const result = validationResult(req);
  const errors = {};

  if (!result.isEmpty()) {
    result.array().map((error) => {
      errors[error.path] = error.msg;
    });

    return res.status(400).json({ success: false, errors });
  }

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    let image = product.image;

    if (req.file) {
      deleteImageFile(product.image);
      image = `uploads/${req.file.filename}`;
    }

    product.name = name;
    product.description = description;
    product.price = price;
    product.stock = stock;
    product.categoryId = categoryId;
    product.image = image;

    await product.save();

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// Function to delete the product
const delete_deleteProduct = async (req, res, next) => {
  const productId = req.params.productId;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    let image = product.image;

    if (image) {
      deleteImageFile(image);
    }

    await product.deleteOne();

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// Function to delete image from product
const patch_delImgProduct = async (req, res, next) => {
  const productId = req.params.productId;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const image = product.image;

    if (image) {
      deleteImageFile(image);
    }

    product.image = null;

    await product.save();

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

// Function to get low stock products
const GET_lowStockProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ stock: 1 }).limit(3);

    res.status(200).json({ success: true, products });
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

// Function  to get product detail
const post_productDetail = async (req, res, next) => {
  const { productId } = req.body;

  try {
    // Get the product
    const product = await Product.findById(productId).populate("categoryId");

    res.status(200).json({ success: true, product });
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

module.exports = {
  post_addProduct,
  GET_productDetails,
  put_editProduct,
  delete_deleteProduct,
  patch_delImgProduct,
  GET_totalProducts,
  GET_lowStockProducts,
  Get_products,
  post_productDetail,
  GET_outOfStockProducts,
};
