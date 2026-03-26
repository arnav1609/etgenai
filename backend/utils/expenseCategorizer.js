/**
 * expenseCategorizer.js
 * Categorises a bank transaction based on merchant name / description keywords.
 * Returns one of the standard NeuroFin categories.
 */

const CATEGORY_RULES = [
  {
    category: "salary",
    keywords: ["salary", "payroll", "stipend", "wages", "pay credit"],
  },
  {
    category: "rent",
    keywords: ["rent", "landlord", "housing", "lease", "society maintenance"],
  },
  {
    category: "groceries",
    keywords: [
      "bigbasket", "grofers", "blinkit", "zepto", "dmart", "reliance fresh",
      "more supermarket", "spencers", "grocery", "supermarket", "kirana",
    ],
  },
  {
    category: "food",
    keywords: [
      "swiggy", "zomato", "dunzo", "eatsure", "mcdonald", "kfc", "domino",
      "pizza", "burger", "restaurant", "cafe", "chai", "food", "dining",
    ],
  },
  {
    category: "travel",
    keywords: [
      "ola", "uber", "rapido", "irctc", "makemytrip", "goibibo", "cleartrip",
      "redbus", "metro", "train", "flight", "air india", "indigo", "spicejet",
      "petrol", "fuel", "fastag", "toll",
    ],
  },
  {
    category: "shopping",
    keywords: [
      "amazon", "flipkart", "myntra", "ajio", "nykaa", "meesho", "snapdeal",
      "tata cliq", "croma", "reliance digital", "shopping",
    ],
  },
  {
    category: "subscriptions",
    keywords: [
      "netflix", "hotstar", "prime video", "spotify", "gaana", "youtube premium",
      "zee5", "sonyliv", "apple", "microsoft", "google one", "adobe",
      "subscription", "renewal",
    ],
  },
  {
    category: "transfer",
    keywords: [
      "upi", "neft", "rtgs", "imps", "transfer", "sent to", "received from",
      "phonepe", "gpay", "google pay", "paytm", "bhim",
    ],
  },
];

/**
 * Categorise a transaction from its description / merchant name.
 *
 * @param {string} description - Raw description or merchant string from the bank
 * @returns {string} One of: groceries | rent | food | travel | shopping |
 *                            subscriptions | salary | transfer | other
 */
export function categorize(description = "") {
  const lower = description.toLowerCase();

  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return rule.category;
    }
  }

  return "other";
}
