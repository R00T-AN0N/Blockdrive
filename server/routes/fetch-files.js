// routes/fetch-files.js
const express = require("express");
const router = express.Router();
const connection = require("../db");

router.post("/", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const sql = "SELECT id, file_name, cid, upload_date FROM files WHERE email = ? ORDER BY upload_date DESC";

  connection.query(sql, [email], (err, results) => {
    if (err) {
      console.error("❌ MySQL fetch error:", err);
      return res.status(500).json({ error: "Database fetch failed" });
    }

    console.log(`✅ Files fetched for email: ${email} — count: ${results.length}`);
    res.json(results);
  });
});

module.exports = router;
