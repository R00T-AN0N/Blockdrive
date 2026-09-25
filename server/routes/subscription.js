const express = require("express");
const router = express.Router();
const connection = require("../db");

/* ------------------------------------------------
   GET SUBSCRIPTION BY USER ID
   URL: /api/subscription/:U_id
------------------------------------------------- */
router.get("/:uid", (req, res) => {
  const { uid } = req.params;

  connection.query(
    `SELECT 
       id,
       U_id,
       plan,
       upload_limit,
       uploads_used,
       start_date,
       end_date,
       status
     FROM subscriptions
     WHERE U_id = ? AND status = 'active' AND end_date > NOW()
     ORDER BY id DESC
     LIMIT 1`,
    [uid],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "DB error" });
      }

      // 🟡 NO subscription → create FREE
      if (results.length === 0) {
        connection.query(
          `INSERT INTO subscriptions
           (U_id, plan, upload_limit, uploads_used, start_date, end_date, status)
           VALUES (?, 'free', 5, 0, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'active')`,
          [uid],
          (insertErr) => {
            if (insertErr) {
              console.error("Free subscription creation error:", insertErr);
              return res.status(500).json({ error: "Failed to create free subscription" });
            }
            return res.json({
              plan: "free",
              upload_limit: 5,
              uploads_used: 0,
              start_date: new Date(),
              end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              status: "active",
            });
          }
        );
        return;
      }

      const sub = results[0];

      // 🟡 EXISTS BUT DATES MISSING → REPAIR
      if (!sub.start_date || !sub.end_date) {
        connection.query(
          `UPDATE subscriptions
           SET start_date = NOW(),
               end_date = DATE_ADD(NOW(), INTERVAL 30 DAY)
           WHERE id = ?`,
          [sub.id],
          () => {
            return res.json({
              ...sub,
              start_date: new Date(),
              end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            });
          }
        );
        return;
      }

      // ✅ NORMAL CASE - Format dates properly
      res.json({
        ...sub,
        start_date: new Date(sub.start_date),
        end_date: new Date(sub.end_date),
      });
    }
  );
});

/* ------------------------------------------------
   GET SUBSCRIPTION HISTORY
   URL: /api/subscription/history/:uid
------------------------------------------------- */
router.get("/history/:uid", (req, res) => {
  const { uid } = req.params;

  connection.query(
    `SELECT * FROM subscriptions WHERE U_id = ? ORDER BY id DESC`,
    [uid],
    (err, results) => {
      if (err) {
        console.error("History fetch error:", err);
        return res.status(500).json({ error: "DB error" });
      }
      res.json(results);
    }
  );
});
/* ------------------------------------------------
   UPGRADE SUBSCRIPTION (used after payment)
   URL: /api/subscription/upgrade
------------------------------------------------- */
router.post("/upgrade", (req, res) => {
  const { U_id, plan } = req.body;

  if (!U_id || !plan) {
    return res.status(400).json({
      success: false,
      message: "U_id and plan are required",
    });
  }

  const limits = {
    free: 5,
    basic: 50,
    premium: 999,
  };

  if (!limits[plan]) {
    return res.status(400).json({
      success: false,
      message: "Invalid subscription plan",
    });
  }


  // 1. Expire previous active plans
  connection.query(
    `UPDATE subscriptions 
     SET status = 'upgraded', end_date = NOW() 
     WHERE U_id = ? AND status = 'active'`,
    [U_id],
    (updateErr) => {
       // 2. Insert new plan
       connection.query(
        `INSERT INTO subscriptions
         (U_id, plan, upload_limit, uploads_used, start_date, end_date, status)
         VALUES (?, ?, ?, 0, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'active')`,
        [U_id, plan, limits[plan]],
        (err, result) => {
          if (err) {
            console.error("Upgrade subscription error:", err);
            return res.status(500).json({
              success: false,
              message: "Failed to upgrade subscription",
            });
          }

      // Fetch the updated subscription to return end_date
      connection.query(
        `SELECT plan, upload_limit, start_date, end_date, status
         FROM subscriptions
         WHERE U_id = ?
         ORDER BY id DESC
         LIMIT 1`,
        [U_id],
        (err, results) => {
          if (err || !results.length) {
            return res.json({
              success: true,
              message: "Subscription upgraded successfully",
              plan,
            });
          }

          const updated = results[0];
          res.json({
            success: true,
            message: "Subscription upgraded successfully",
            plan,
            upload_limit: updated.upload_limit,
            start_date: new Date(updated.start_date),
            end_date: new Date(updated.end_date),
            status: updated.status,
          });
        }
      );
    }
  
  );
});

});

module.exports = router;