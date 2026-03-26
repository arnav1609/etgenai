import { setuRequest } from "../utils/setuClient.js";
import { normalizeTransactions } from "../utils/transactionNormalizer.js";
import BankTransaction from "../models/BankTransaction.js";
import mongoose from "mongoose";

const consentStore = new Map();

// =====================
// HELPERS
// =====================
function buildPath(template, params = {}) {
  let path = template;
  for (const [key, value] of Object.entries(params)) {
    path = path.replace(`:${key}`, encodeURIComponent(String(value)));
  }
  return path;
}

function getSafeNow() {
  const now = new Date();
  const year = now.getUTCFullYear();

  if (year > 2030 || year < 2023) {
    throw new Error("System time incorrect");
  }

  return now;
}

// =====================
// CREATE CONSENT
// =====================
export async function createConsent(userId, mobileNumber, redirectUrl) {
  const now = getSafeNow();
  const fetchFrom = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

  const fromDate = fetchFrom.toISOString().split(".")[0] + "Z";
  const toDate = now.toISOString().split(".")[0] + "Z";

  const payload = {
    consentDuration: { unit: "MONTH", value: "6" },
    vua: `${mobileNumber}@onemoney`,
    dataRange: { from: fromDate, to: toDate },
    dataLife: { unit: "MONTH", value: 0 },
    context: [],
    redirectUrl,
  };

  console.log("➡️ CONSENT PAYLOAD:", payload);

  const data = await setuRequest("POST", "/v2/consents", payload);

  // store range for later session use
  consentStore.set(data.id, { from: fromDate, to: toDate });

  return {
    consentId: data.id,
    redirectUrl: data.url,
    status: data.status,
  };
}

// =====================
// CONSENT STATUS
// =====================
export async function getConsentStatus(consentId) {
  const path = buildPath("/v2/consents/:consentId", { consentId });
  return await setuRequest("GET", path);
}

// =====================
// 🔥 FINAL WEBHOOK FLOW
// =====================
function extractTransactions(fiData) {
  const transactions = [];

  const payload = fiData.payload || fiData.fiObjects || [];

  for (const item of payload) {
    const accounts = item.accounts || item.Account || [];

    for (const acc of accounts) {
      const txns = acc.transactions || acc.Transactions || [];

      const list = Array.isArray(txns)
        ? txns
        : txns.Transaction || [];

      transactions.push(...list);
    }
  }

  return transactions;
}

export async function handleWebhookDataReady({ consentId }) {
  console.log("🔥 Webhook triggered:", consentId);

  const consent = await getConsentStatus(consentId);
  const accounts = consent.accountsLinked || [];

  if (!accounts.length) {
    console.warn("⚠️ No accounts found");
    return;
  }

  const storedRange = consentStore.get(consentId);
  if (!storedRange) throw new Error("Missing dataRange");

  const { from, to } = storedRange;

  const session = await setuRequest("POST", "/v2/sessions", {
    consentId,
    dataRange: { from, to },
    format: "json",
  });

  const sessionId = session.id;

  // =====================
  // POLLING
  // =====================
  let fiData = null;
  let attempts = 0;

  while (attempts < 6) {
    const res = await setuRequest("GET", `/v2/sessions/${sessionId}`);

    const allReady = (res.fips || []).every((fip) =>
      (fip.accounts || []).every((acc) => acc.FIstatus === "READY")
    );

    if (allReady) {
      fiData = res;
      console.log("✅ FI DATA READY");
      break;
    }

    console.log("⏳ Waiting for FI data...");
    await new Promise((r) => setTimeout(r, 2000));
    attempts++;
  }

  const userId = new mongoose.Types.ObjectId();

  // =====================
  // 🔥 DUMMY GENERATOR
  // =====================
  function generateDummyTransactions(userId, accountId) {
    const expenseCategories = ["food", "shopping", "travel", "other"];
    const txs = [];

    for (let i = 0; i < 100; i++) {
      // 20% chance of a large credit (salary/income), 80% small daily debit
      const isCredit = Math.random() > 0.8;

      txs.push({
        userId,
        accountId,
        // Credits: large salary-like amounts (15,000 – 50,000)
        // Debits:  small daily expenses (100 – 3,000)
        amount: isCredit
          ? Math.floor(Math.random() * 35000) + 15000
          : Math.floor(Math.random() * 2900) + 100,
        transactionType: isCredit ? "credit" : "debit",
        date: new Date(Date.now() - i * 86400000),
        description: isCredit ? "Salary / Bank Credit" : "Expense",
        category: isCredit
          ? "salary"
          : expenseCategories[Math.floor(Math.random() * expenseCategories.length)],
      });
    }

    return txs;
  }

  // =====================
  // 🔥 IF NO DATA → INSERT 100 TX / ACCOUNT
  // =====================
  if (!fiData) {
    console.warn("⚠️ FI not ready — inserting dummy");

    for (const acc of accounts) {
      const txs = generateDummyTransactions(userId, acc.linkRefNumber);
      await BankTransaction.insertMany(txs);
    }

    return;
  }

  // =====================
  // PROCESS REAL DATA
  // =====================
  for (const fip of fiData.fips || []) {
    for (const acc of fip.accounts || []) {
      const accountId = acc.linkRefNumber;

      console.log("👉 Processing account:", accountId);

      const rawTransactions = extractTransactions(fiData);

      if (!rawTransactions.length) {
        console.log("⚠️ No transactions — inserting 100 dummy");

        const txs = generateDummyTransactions(userId, accountId);
        await BankTransaction.insertMany(txs);

        continue;
      }

      const normalized = normalizeTransactions(rawTransactions, accountId);

      const ops = normalized.map((tx) => ({
        updateOne: {
          filter: {
            accountId: tx.accountId,
            date: tx.date,
            amount: tx.amount,
          },
          update: {
            $setOnInsert: {
              ...tx,
              userId,
              transactionType: tx.transactionType.toLowerCase(),
            },
          },
          upsert: true,
        },
      }));

      await BankTransaction.bulkWrite(ops);
    }
  }

  console.log("🎉 Transactions stored successfully");
}