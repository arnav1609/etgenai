import express from "express";
import {
  createConsent,
  consentStatus,
  callbackHandler,
  webhookHandler,
  getAccounts,
} from "../controllers/setuController.js";

import BankTransaction from "../models/BankTransaction.js";

const router = express.Router();

// =====================
// CONSENT
// =====================
router.post("/consent", createConsent);
router.get("/consent/:consentId", consentStatus);

// =====================
// CONNECT FLOW
// =====================
router.get("/callback", callbackHandler);

// =====================
// 🔥 GET TRANSACTIONS (for UI)
// =====================
router.get("/transactions/:accountId", async (req, res) => {
  try {
    const { accountId } = req.params;


    const data = await BankTransaction.find({ accountId })
      .sort({ date: -1 })
      .limit(100);

    return res.json({
      success: true,
      data,
    });


  } catch (err) {
    console.error("❌ get transactions error:", err.message);


    return res.status(500).json({
      success: false,
      error: err.message,
    });


  }
});

// =====================
// 🔥 GET ACCOUNTS (IMPORTANT)
// =====================
router.get("/accounts", getAccounts);

// =====================
// WEBHOOK
// =====================
router.post("/webhook", webhookHandler);

export default router;
