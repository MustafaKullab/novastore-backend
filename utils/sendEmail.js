require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  tls: {
    rejectUnauthorized: false, // عشان بالريندر ما ياخد وقت وهو بيتحقق من اللي باعت طلب
  },
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, text, html }) => {
  const options = {
    from: process.env.EMAIL,
    to,
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(options);
  } catch (error) {
    console.log(error);
  }
};

module.exports = sendEmail;
