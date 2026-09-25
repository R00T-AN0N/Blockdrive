const express = require("express");
const router = express.Router();
const { OAuth2Client } = require("google-auth-library");
const connection = require("../db");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const CLIENT_ID = process.env.CLIENT_ID;
console.log("🔹 Loaded Google Client ID:", CLIENT_ID ? "YES (Ends with " + CLIENT_ID.slice(-5) + ")" : "NO");
const client = new OAuth2Client(CLIENT_ID);
        
function generateUID() {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `BD${randomNum}`;
}

function generateUniqueUID(callback) {
  const newUID = generateUID();
  connection.query("SELECT U_id FROM register WHERE U_id = ?", [newUID], (err, results) => {
    if (err) return callback(err);
    if (results.length > 0) generateUniqueUID(callback);
    else callback(null, newUID);
  });
}

router.post("/", async (req, res) => {
  const { credential } = req.body; 

  try {
// 1. Verify Access Token via Google UserInfo API
    const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${credential}` },
    });

    if (!response.ok) {
       throw new Error("Failed to fetch user info");
    }

    const payload = await response.json();
    const { email, name, sub: googleId } = payload;

    // 2. Check if user exists
    const checkQuery = "SELECT * FROM register WHERE email = ?";
    connection.query(checkQuery, [email], async (err, results) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
      }

      if (results.length > 0) {
        // ✅ USER EXISTS -> LOGIN
        const user = { ...results[0] };
        delete user.password;
        return res.json({
          success: true,
          message: "Login successful",
          user
        });
      } else {
        generateUniqueUID((uidErr, U_id) => {
          if (uidErr) {
             return res.status(500).json({ success: false, message: "UID Gen Error" });
          }

          const dummyPassword = bcrypt.hashSync(`google_${googleId}`, 12);

          const insertUserQuery = `
            INSERT INTO register (U_id, name, email, password, subscription_plan) 
            VALUES (?, ?, ?, ?, 'free')
          `;

          connection.query(insertUserQuery, [U_id, name, email, dummyPassword], (insertErr) => {
            if (insertErr) {
              console.error("Insert User Error:", insertErr);
              return res.status(500).json({ success: false, message: "Registration failed" });
            }

            // Create FREE subscription
            const insertSub = `
                INSERT INTO subscriptions
                (U_id, plan, upload_limit, uploads_used, start_date, end_date, status)
                VALUES (?, 'free', 5, 0, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'active')
            `;
            connection.query(insertSub, [U_id], (subErr) => {
               if (subErr) console.error("Sub creation failed", subErr);
               
               // Return new user
               res.status(201).json({
                 success: true,
                 message: "User registered via Google",
                 user: { U_id, name, email, subscription_plan: 'free' }
               });
            });
          });
        });
      }
    });

  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(401).json({ success: false, message: "Invalid Google Token" });
  }
});

module.exports = router;
