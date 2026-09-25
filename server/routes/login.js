// routes/login.js
const express = require("express");
const router = express.Router();
const connection = require("../db");
const bcrypt = require("bcryptjs");

// POST /login
router.post("/", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  const query = "SELECT * FROM register WHERE email = ?";
  connection.query(query, [email], async (err, result) => {
    if (err) {
      console.error("Login error:", err);
      return res.status(500).json({
        success: false,
        message: "Login failed: " + err.message,
      });
    }

    if (result.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const user = result[0];
    let passwordValid = false;

    if (typeof user.password === "string" && user.password.startsWith("$2")) {
      passwordValid = await bcrypt.compare(password, user.password);
    } else {
      // Backward-compatible migration for existing academic-project accounts.
      passwordValid = user.password === password;
      if (passwordValid) {
        const newHash = await bcrypt.hash(password, 12);
        connection.query("UPDATE register SET password = ? WHERE U_id = ?", [newHash, user.U_id]);
        user.password = newHash;
      }
    }

    if (!passwordValid) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    delete user.password;
    return res.status(200).json({ success: true, message: "Login successful", user });
  });
});

module.exports = router;
