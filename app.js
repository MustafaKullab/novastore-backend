require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const router = require("./routes/router");
const cookieParser = require("cookie-parser");
const handleError = require("./middleware/handlerError");

const app = express();

//Protect the server
app.use(
  helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false })
);

//Allow the front end to access to the backend
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

//Prevent too many requests
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10000,
    message: "Too many request, please try again later",
  })
);

// Parse incoming JSON payloads
app.use(express.json());

// Serve static files from the 'public' folder
app.use(express.static("public"));

// Parse HTTP request cookies
app.use(cookieParser());

app.use(router);

app.use(handleError);

module.exports = app;
