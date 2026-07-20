require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const router = require("./routes/router");
const cookieParser = require("cookie-parser");
const handleError = require("./middleware/handlerError");
const { generalRateLimit } = require("./middleware/rateLimit");

const app = express();

//Protect the server
app.use(
  helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false })
);

const allowedOrigins = [
  "http://localhost:5173",
  "https://novastore-frontend-psi.vercel.app",
];

//Allow the front end to access to the backend
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        // !origin للادوات اللي زي بوستمان
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

//Prevent too many requests
app.use(generalRateLimit);

// Parse incoming JSON payloads
app.use(express.json());

// Serve static files from the 'public' folder
app.use(express.static("public"));

// Parse HTTP request cookies
app.use(cookieParser());

app.use(router);

app.use(handleError);

module.exports = app;
