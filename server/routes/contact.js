// routes/contact.js
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
require("dotenv").config();

router.post("/", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Setup transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email details
    const mailOptions = {
      from: `"BlockDrive Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // sends to your inbox
      subject: `📩 New Message from ${name}`,
      html: `
        <h2>Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully!");
    res.json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

module.exports = router;
