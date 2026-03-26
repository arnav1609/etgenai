import * as setuService from "../services/setuService.js";
import BankTransaction from "../models/BankTransaction.js";

// =====================
// HELPERS
// =====================
function getAppRedirectUrl(req) {
  return (
    process.env.SETU_REDIRECT_URL ||
    `${req.protocol}://${req.get("host")}/setu/callback`
  );
}

// =====================
// CREATE CONSENT
// =====================
export async function createConsent(req, res) {
  try {
    const { mobileNumber, redirectUrl } = req.body || {};


    if (!mobileNumber) {
      return res.status(400).json({
        success: false,
        error: "mobileNumber is required",
      });
    }

    const finalRedirectUrl = redirectUrl || getAppRedirectUrl(req);

    const data = await setuService.createConsent(
      "test-user",
      mobileNumber,
      finalRedirectUrl
    );

    return res.status(200).json({
      success: true,
      redirectUrl: data.redirectUrl,
      consentId: data.consentId,
      status: data.status,
    });


  } catch (err) {
    console.error("❌ createConsent error:", err.message);


    return res.status(500).json({
      success: false,
      error: err.message,
    });


  }
}

// =====================
// CONSENT STATUS
// =====================
export async function consentStatus(req, res) {
  try {
    const { consentId } = req.params;


    if (!consentId) {
      return res.status(400).json({
        success: false,
        error: "consentId is required",
      });
    }

    const data = await setuService.getConsentStatus(consentId);

    return res.json({
      success: true,
      data,
    });


  } catch (err) {
    console.error("❌ consentStatus error:", err.message);


    return res.status(500).json({
      success: false,
      error: err.message,
    });


  }
}

// =====================
// CALLBACK (NO FETCH HERE)
// =====================
export async function callbackHandler(req, res) {
  try {
    console.log("📥 Setu callback hit");

    const consentId =
      req.query?.consentId ||
      req.query?.id ||
      req.body?.consentId ||
      req.body?.id ||
      null;

    console.log("✅ Consent ID:", consentId);

    if (consentId) {
      console.log("🔥 Fetching transactions immediately...");

      // ✅ FINAL FIX — CALL SERVICE DIRECTLY
      await setuService.handleWebhookDataReady({ consentId });
    }

    // 🚀 redirect to dashboard
    return res.redirect("http://localhost:5173/dashboard");

  } catch (err) {
    console.error("❌ callbackHandler error:", err.message);
    return res.status(500).send("Callback failed");
  }
}
// =====================
// WEBHOOK (MAIN LOGIC)
// =====================
export async function webhookHandler(req, res) {
  try {
    const event = req.body?.event;
    const consentId =
      req.body?.consentId || req.body?.payload?.consentId;


    console.log("📩 Webhook received:", event, consentId);

    if (event === "FI_DATA_READY" && consentId) {
      await setuService.handleWebhookDataReady({ consentId });
    }

    return res.status(200).json({ status: "received" });


  } catch (err) {
    console.error("❌ webhook error:", err.message);


    return res.status(500).json({
      success: false,
      error: err.message,
    });


  }
}

// =====================
// GET ACCOUNTS (FOR UI)
// =====================
export async function getAccounts(req, res) {
  try {
    const data = await BankTransaction.aggregate([
      {
        $group: {
          _id: "$accountId",
          totalCredits: {
            $sum: {
              $cond: [{ $eq: ["$transactionType", "credit"] }, "$amount", 0],
            },
          },
          totalDebits: {
            $sum: {
              $cond: [{ $eq: ["$transactionType", "debit"] }, "$amount", 0],
            },
          },
        },
      },
      {
        $addFields: {
          totalBalance: { $subtract: ["$totalCredits", "$totalDebits"] },
        },
      },
    ]);


    return res.json({
      success: true,
      data,
    });


  } catch (err) {
    console.error("❌ getAccounts error:", err.message);


    return res.status(500).json({
      success: false,
      error: err.message,
    });


  }
}
