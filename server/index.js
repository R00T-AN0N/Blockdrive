// server.js
console.log("Starting server...");

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const loginRoute = require("./routes/login");
const registerRoute = require("./routes/register");
const logoutRoute = require("./routes/logout");
const fileRecord = require("./routes/file-record");
const fetchFiles = require("./routes/fetch-files");
const contactRoutes = require("./routes/contact");
const subscriptionRoutes = require("./routes/subscription");
const dummyPaymentRoutes = require("./routes/dummyPayment");
const ipfsRoutes = require("./routes/ipfs");

const app = express();
const port = Number(process.env.PORT || 3000);

/* ---------------- MIDDLEWARE ---------------- */
const allowedOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------------- BASE ROUTE ---------------- */
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to BlockDrive API",
    status: "Server is running",
  });
});

/* ---------------- SECURITY HEADERS ---------------- */
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

/* ---------------- ROUTES ---------------- */
app.use("/register", registerRoute);
app.use("/login", loginRoute);
app.use("/logout", logoutRoute);

app.use("/api/files", fileRecord);
app.use("/api/fetch", fetchFiles);
app.use("/api/contact", contactRoutes);

// ✅ Subscription & Payment
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/dummy-payment", dummyPaymentRoutes);
app.use("/api/ipfs", ipfsRoutes);
app.use("/api/auth/google", require("./routes/googleAuth"));

/* ---------------- START SERVER ---------------- */
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
