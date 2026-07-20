require("dotenv").config();
const User = require("../models/user");
const Order = require("../models/order");
const Contact = require("../models/contact");
const sendEmail = require("../utils/sendEmail");
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);
const handleErrors = require("../utils/handleErrors.js");

// Function to get recent messages
const GET_recentMessages = async (req, res, next) => {
  try {
    const recentMessages = await Contact.find()
      .populate("userId", "-password -confPass -verificationCode")
      .sort({ date: -1 })
      .limit(5);

    res.status(200).json({ success: true, recentMessages });
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

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: user.email,
      subject: "تم استلام طلبك بنجاح | NovaStore",
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
    const messages = await Contact.find().populate(
      "userId",
      "-password -confPass -verificationCode"
    );

    res.status(200).json({ success: true, messages });
  } catch (error) {
    next(error);
  }
};

// Function to get specific message
const GET_specificMessage = async (req, res, next) => {
  const { messageId } = req.params;
  try {
    const message = await Contact.findById(messageId).populate(
      "userId",
      "-password -confPass -verificationCode"
    );

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
    await resend.emails.send({
      from: "onboarding@resend.dev",
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

// Function to recieve the message from contact and store it in database
const post_contactMsg = async (req, res, next) => {
  const userId = req.user._id;
  const { fullName, email, subject, message } = req.body;

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

    await resend.emails.send({
      from: "onboarding@resend.dev",
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

module.exports = {
  GET_recentMessages,
  post_successMessage,
  GET_messages,
  GET_specificMessage,
  put_markAsRead,
  delete_message,
  post_sendReply,
  patch_readMessage,
  post_contactMsg,
};
