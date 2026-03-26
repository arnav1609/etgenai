/**
 * BankTransaction.js
 * MongoDB model for bank transactions fetched via Setu Account Aggregator.
 * This is a NEW collection — completely separate from the existing Transaction model.
 */

import mongoose from "mongoose";

const bankTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    accountId: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    transactionType: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    category: {
      type: String,
      enum: [
        "groceries",
        "rent",
        "food",
        "travel",
        "shopping",
        "subscriptions",
        "salary",
        "transfer",
        "other",
      ],
      default: "other",
    },
    // Store full Setu payload for debugging / future re-processing
    rawData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// Compound index: quickly fetch all transactions for a user + account
bankTransactionSchema.index({ userId: 1, accountId: 1, date: -1 });

const BankTransaction = mongoose.model("BankTransaction", bankTransactionSchema);

export default BankTransaction;
