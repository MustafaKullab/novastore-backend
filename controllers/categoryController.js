const Category = require("../models/category");
const { validationResult } = require("express-validator");
const handleErrors = require("../utils/handleErrors.js");

// Function to add new category
const post_addCategory = async (req, res) => {
  const { name, description, isActive } = req.body;

  const result = validationResult(req);
  let errors = {};
  if (!result.isEmpty()) {
    result.array().map((error) => {
      errors[error.path] = error.msg;
    });
    return res.status(400).json({ success: false, errors });
  }
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
    errors = handleErrors(error);

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

// Function to get the categories of products (length)
const GET_totalCategories = async (req, res, next) => {
  try {
    const categoriesLength = (await Category.find()).length;

    res.status(200).json({ success: true, categoriesLength });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  post_addCategory,
  patch_changeStateCategory,
  delete_category,
  GET_categories,
  GET_totalCategories,
};
