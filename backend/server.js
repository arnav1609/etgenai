import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import goalsRoutes from "./routes/goals.js";
import familyRoutes from "./routes/family.js";
import subscriptionRoutes from "./routes/subscriptions.js";
import transactionsRoutes from "./routes/transactions.js";
import cardRoutes from "./routes/card.js";
import razorpayRoute from "./routes/razorpay.js";
import verifyRoute from "./routes/paymentVerify.js";
import festivalRoutes from "./routes/festivals.js";
import setuRoutes from "./routes/setuRoutes.js";
import taxRoutes from "./tax/taxRoutes.js";
import { loadSecrets } from "./config/loadSecrets.js";

// Load secrets
await loadSecrets();

const app = express();

app.set("trust proxy", 1);

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3003",
    "https://unrouged-merle-sprier.ngrok-free.dev"
  ],
  credentials: true,
}));

app.use(express.json());

/**
 * ✅ ROOT ROUTE (FIXES "Cannot GET /")
 */
app.get("/", (req, res) => {
  const { success, id } = req.query;

  // Handle Setu redirect case
  if (success && id) {
    console.log("🎯 Consent redirect received:", { success, id });

    // Redirect to frontend (recommended)
    return res.redirect(
      `http://localhost:5173/dashboard?consentId=${id}&status=${success}`
    );

    // OR for testing:
    // return res.send(`Consent success! ID: ${id}`);
  }

  res.send("🚀 NeuroFin Backend Running");
});

/**
 * Health check
 */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

/**
 * API Routes
 */
app.use("/api/auth", authRoutes);
app.use("/api/goals", goalsRoutes);
app.use("/api/family", familyRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/card", cardRoutes);
app.use("/api/razorpay", razorpayRoute);
app.use("/api/payment-verify", verifyRoute);
app.use("/api/festivals", festivalRoutes);

/**
 * ✅ Setu routes (callback should ideally be here)
 * Example: /setu/callback
 */
app.use("/setu", setuRoutes);

app.use("/api/tax", taxRoutes);

/**
 * DB + Server start
 */
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is missing. Check AWS Parameter Store or .env");
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    try {
      const { seedTaxRules } = await import("./tax/taxRulesSeed.js");
      await seedTaxRules();
    } catch { }

    console.log("✅ Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB");
    console.error(err);
  });