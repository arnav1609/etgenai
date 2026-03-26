/**
 * transactionNormalizer.js
 * Converts raw Setu AA transaction objects into the standard NeuroFin format.
 * This keeps service logic clean and isolates Setu's data shape from our schema.
 */

import { categorize } from "./expenseCategorizer.js";

/**
 * Normalise a single Setu transaction object.
 *
 * Setu FI data shape (simplified):
 * {
 *   txnId, type, mode, amount, currentBalance,
 *   transactionTimestamp, valueDate, narration,
 *   reference
 * }
 *
 * @param {object} rawTx  - Raw transaction from Setu FI data response
 * @param {string} accountId - The Setu account ID this transaction belongs to
 * @returns {{
 *   accountId: string,
 *   date: Date,
 *   amount: number,
 *   description: string,
 *   transactionType: "credit" | "debit",
 *   category: string,
 *   rawData: object
 * }}
 */
export function normalizeTransaction(rawTx, accountId) {
  const type = (rawTx.type || "").toLowerCase();

  return {
    accountId:       accountId || rawTx.accountId || "",
    date:            new Date(rawTx.transactionTimestamp || rawTx.valueDate || Date.now()),
    amount:          parseFloat(rawTx.amount) || 0,
    description:     rawTx.narration || rawTx.reference || "",
    transactionType: type === "credit" ? "credit" : "debit",
    category:        categorize(rawTx.narration || rawTx.reference || ""),
    rawData:         rawTx,
  };
}

/**
 * Normalise an array of raw Setu transactions.
 *
 * @param {object[]} rawTransactions
 * @param {string}   accountId
 * @returns {object[]}
 */
export function normalizeTransactions(rawTransactions = [], accountId) {
  return rawTransactions.map((tx) => normalizeTransaction(tx, accountId));
}
