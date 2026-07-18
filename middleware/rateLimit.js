const rateLimit = require("express-rate-limit");

const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: "Too many requests please try again later",
});

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many requests please try again later",
});

module.exports = { generalRateLimit, authRateLimit };
