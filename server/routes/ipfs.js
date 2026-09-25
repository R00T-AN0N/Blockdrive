const express = require("express");
const multer = require("multer");
require("dotenv").config();

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

router.post("/upload", upload.single("file"), async (req, res) => {
  if (!process.env.PINATA_JWT) {
    return res.status(500).json({ error: "PINATA_JWT is not configured on the server" });
  }
  if (!req.file) {
    return res.status(400).json({ error: "A file is required" });
  }

  try {
    const form = new FormData();
    form.append("file", new Blob([req.file.buffer]), req.file.originalname);

    const pinataResponse = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.PINATA_JWT}` },
        body: form,
      }
    );

    const data = await pinataResponse.json();
    if (!pinataResponse.ok || !data.IpfsHash) {
      console.error("Pinata upload failed:", data);
      return res.status(502).json({ error: "IPFS upload failed" });
    }

    return res.json({ cid: data.IpfsHash });
  } catch (error) {
    console.error("IPFS upload error:", error);
    return res.status(500).json({ error: "IPFS upload failed" });
  }
});

module.exports = router;
