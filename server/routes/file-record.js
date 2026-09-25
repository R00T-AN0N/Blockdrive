const express = require("express");
const router = express.Router();
const connection = require("../db");

router.post("/", (req, res) => {
  const { name, cid, email, U_id } = req.body;

  if (!name || !cid || !email || !U_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  connection.beginTransaction((txErr) => {
    if (txErr) {
      console.error("Transaction start error:", txErr);
      return res.status(500).json({ error: "Database error" });
    }

    const checkLimitQuery = `
      SELECT upload_limit, uploads_used
      FROM subscriptions
      WHERE U_id = ? AND status = 'active' AND end_date > NOW()
      ORDER BY id DESC
      LIMIT 1
      FOR UPDATE
    `;

    connection.query(checkLimitQuery, [U_id], (limitErr, limitRes) => {
      if (limitErr || limitRes.length === 0) {
        return connection.rollback(() => {
          if (limitErr) console.error("Limit check error:", limitErr);
          res.status(limitErr ? 500 : 403).json({
            error: limitErr ? "Database error" : "No active subscription found",
          });
        });
      }

      const { upload_limit, uploads_used } = limitRes[0];
      if (uploads_used >= upload_limit) {
        return connection.rollback(() =>
          res.status(403).json({ error: "Upload limit hit. Upgrade your plan." })
        );
      }

      const insertFileSql =
        "INSERT INTO files (file_name, cid, email, upload_date) VALUES (?, ?, ?, NOW())";

      connection.query(insertFileSql, [name, cid, email], (insertErr, insertResult) => {
        if (insertErr) {
          return connection.rollback(() => {
            if (insertErr.code === "ER_DUP_ENTRY") {
              return res.status(409).json({ error: "File Already Stored" });
            }
            console.error("MySQL insert error:", insertErr);
            res.status(500).json({ error: "Database insert failed" });
          });
        }

        connection.query(
          "UPDATE subscriptions SET uploads_used = uploads_used + 1 WHERE U_id = ? AND status = 'active' AND end_date > NOW()",
          [U_id],
          (updateErr) => {
            if (updateErr) {
              return connection.rollback(() => {
                console.error("Failed to update usage count:", updateErr);
                res.status(500).json({ error: "Failed to update upload usage" });
              });
            }

            connection.commit((commitErr) => {
              if (commitErr) {
                return connection.rollback(() => {
                  console.error("Transaction commit error:", commitErr);
                  res.status(500).json({ error: "Database commit failed" });
                });
              }

              console.log("✅ File inserted successfully:", insertResult.insertId);
              res.json({ success: true, id: insertResult.insertId });
            });
          }
        );
      });
    });
  });
});

module.exports = router;
