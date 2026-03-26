import express from "express";
import Transaction from "../models/Transaction.js";
import BankTransaction from "../models/BankTransaction.js";
import { authRequired } from "../middleware/authMiddleware.js";

const router = express.Router();

function serializeTransaction(tx) {
  return {
    id: tx._id.toString(),
    type: tx.type,
    from: tx.from,
    to: tx.to,
    amount: tx.amount,
    category: tx.category,
    description: tx.description,
    time: tx.time,
    status: tx.status || "completed"
  };
}

function serializeBankTransaction(tx) {
  return {
    id: tx._id.toString(),
    type: tx.transactionType === "credit" ? "income" : "expense",
    from: tx.transactionType === "credit" ? "Setu Account" : "User",
    to: tx.transactionType === "credit" ? "User" : "Setu Account",
    amount: tx.amount,
    category: tx.category,
    description: tx.description,
    time: tx.date.toISOString(),
    status: "completed",
    source: "setu",
    createdAt: tx.createdAt
  };
}

router.get("/", authRequired, async (req, res) => {
  try {
    const [manualTxs, bankTxs] = await Promise.all([
      Transaction.find({ user: req.user.id }).lean(),
      BankTransaction.find({ userId: req.user.id }).lean()
    ]);

    const serializedManual = manualTxs.map(tx => ({
      ...serializeTransaction(tx),
      createdAt: tx.createdAt
    }));
    
    const serializedBank = bankTxs.map(serializeBankTransaction);

    const merged = [...serializedManual, ...serializedBank].sort(
      (a, b) => new Date(b.createdAt || b.time) - new Date(a.createdAt || a.time)
    );

    // Remove createdAt before sending to frontend to keep response clean
    const cleaned = merged.map(({ createdAt, ...rest }) => rest);

    res.json(cleaned);
  } catch (err) {
    console.error("GET /api/transactions error:", err);
    res.status(500).json({ message: "Failed to load transactions" });
  }
});

router.post("/", authRequired, async (req, res) => {
  try {
    const { type, from, to, amount, category, description, time, status } = req.body || {};

    if (!type || typeof amount === "undefined") {
      return res.status(400).json({ message: "Type and amount are required" });
    }

    const tx = await Transaction.create({
      user: req.user.id,
      type,
      from,
      to,
      amount,
      category,
      description,
      time,
      status
    });

    res.status(201).json(serializeTransaction(tx));
  } catch (err) {
    res.status(500).json({ message: "Failed to create transaction" });
  }
});

export default router;
