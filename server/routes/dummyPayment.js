const express = require("express");
const router = express.Router();
const connection = require("../db");

/* -------- DUMMY PAYMENT ROUTE -------- */
router.post("/pay", (req, res) => {
  const { U_id, plan } = req.body;

  if (!U_id || !plan) {
    return res.status(400).json({
      success: false,
      message: "U_id and plan are required",
    });
  }

  const limits = {
    basic: 50,
    premium: 999,
  };

  if (!limits[plan]) {
    return res.status(400).json({
      success: false,
      message: "Invalid plan selected",
    });
  }

  // 1. Expire previous active plans
  connection.query(
    `UPDATE subscriptions 
     SET status = 'upgraded', end_date = NOW() 
     WHERE U_id = ? AND status = 'active'`,
    [U_id],
    (updateErr) => {
      if (updateErr) {
        console.error("Error expiring previous plan:", updateErr);
        // Continue anyway or return error? Let's continue but log it.
      }

      // 2. Insert new plan
      connection.query(
        `INSERT INTO subscriptions
         (U_id, plan, upload_limit, uploads_used, start_date, end_date, status)
         VALUES (?, ?, ?, 0, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'active')`,
        [U_id, plan, limits[plan]],
        (err) => {
          if (err) {
            console.error("Subscription insert error:", err);
            return res.status(500).json({
              success: false,
              message: "Subscription creation failed",
            });
          }

          res.json({
            success: true,
            message: "Payment successful",
          });
        }
      );
    }
  );
});
module.exports = router;
