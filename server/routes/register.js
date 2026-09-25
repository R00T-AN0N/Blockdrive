const express = require("express");
const router = express.Router();
const connection = require("../db");
const bcrypt = require("bcryptjs");

// POST /register
router.post("/", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  // ✅ Step 1: Check if email already exists
  const checkQuery = "SELECT * FROM register WHERE email = ?";
  connection.query(checkQuery, [email], (checkErr, results) => {
    if (checkErr) {
      console.error("Database check error:", checkErr);
      return res.status(500).json({
        success: false,
        message: "Database error while checking user",
      });
    }

    if (results.length > 0) {
      return res.status(400).json({
        success: false,
        message: "You are already registered. Please sign in.",
      });
    }

    // ✅ Step 2: Generate unique U_id
    generateUniqueUID((uidErr, U_id) => {
      if (uidErr) {
        return res.status(500).json({
          success: false,
          message: "Failed to generate user ID",
        });
      }

      // ✅ Step 3: Insert new user
      const hashedPassword = bcrypt.hashSync(password, 12);
      const insertUserQuery =
        "INSERT INTO register (U_id, name, email, password, subscription_plan) VALUES (?, ?, ?, ?, 'free')";

      connection.query(
        insertUserQuery,
        [U_id, name, email, hashedPassword],
        (insertErr) => {
          if (insertErr) {
            console.error("Registration error:", insertErr);
            return res.status(500).json({
              success: false,
              message: "Registration failed",
            });
          }

          // ✅ Step 4: Create default FREE subscription
          const insertSubscriptionQuery = `
            INSERT INTO subscriptions
            (U_id, plan, upload_limit, uploads_used, start_date, end_date, status)
            VALUES (?, 'free', 5, 0, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'active')
          `;

          connection.query(
            insertSubscriptionQuery,
            [U_id],
            (subErr) => {
              if (subErr) {
                console.error("Subscription creation failed:", subErr);
                // ⚠️ Do not block user creation if subscription fails
              }

              // ✅ Final success response
              res.status(201).json({
                success: true,
                message: "User registered successfully",
                U_id,
              });
            }
          );
        }
      );
    });
  });
});

/* ---------------- UID GENERATOR ---------------- */

function generateUID() {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `BD${randomNum}`;
}

function generateUniqueUID(callback) {
  const newUID = generateUID();

  const checkUIDQuery = "SELECT U_id FROM register WHERE U_id = ?";
  connection.query(checkUIDQuery, [newUID], (err, results) => {
    if (err) return callback(err);

    if (results.length > 0) {
      // ❌ UID exists → retry
      generateUniqueUID(callback);
    } else {
      // ✅ UID is unique
      callback(null, newUID);
    }
  });
}

module.exports = router;
