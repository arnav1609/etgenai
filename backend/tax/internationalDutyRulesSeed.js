/**
 * internationalDutyRulesSeed.js
 * Seeds configurable international duty/charge rules.
 */
import InternationalDutyRule from "../models/InternationalDutyRule.js";

export const DUTY_RULES = [
  // ── Baggage Allowance ──────────────────────────────────────────
  {
    category: "baggage", code: "BAGGAGE_GENERAL",
    name: "General Baggage Allowance",
    description: "Free allowance for items brought from abroad by a resident Indian.",
    freeAllowance: 50000, rate: 0.35,
    notes: "₹50,000 free allowance per adult traveller. Excess dutiable at ~35% (customs duty + IGST). Rules under Baggage Rules, 2016.",
    legalReference: "Baggage Rules 2016",
  },
  {
    category: "baggage", code: "BAGGAGE_RESIDENT_LONG",
    name: "Baggage Allowance — Resident Abroad > 1 Year",
    description: "Enhanced allowance for residents returning after > 1 year abroad.",
    freeAllowance: 75000, rate: 0.35,
    notes: "₹75,000 free allowance. Professional equipment may have additional allowances.",
    legalReference: "Baggage Rules 2016 Rule 3",
  },

  // ── LRS / Remittance TCS ───────────────────────────────────────
  {
    category: "remittance_tcs", code: "LRS_TCS",
    name: "LRS Remittance TCS",
    description: "Tax Collected at Source on foreign remittances under Liberalised Remittance Scheme exceeding ₹7 lakh.",
    threshold: 700000, rate: 0.20,
    notes: "Effective 1 Oct 2023. TCS at 20% on amount exceeding ₹7L per FY. Credit available when filing ITR. Education/medical remittances have lower rate (5%).",
    legalReference: "Section 206C(1G) of Income Tax Act",
    applicableFrom: "2023-24",
  },
  {
    category: "remittance_tcs", code: "LRS_EDUCATION_TCS",
    name: "LRS TCS — Education Remittances",
    description: "Reduced TCS for education purpose remittances under LRS.",
    threshold: 700000, rate: 0.05,
    notes: "5% TCS on education/medical remittances above ₹7L. Lower rate than general LRS.",
    legalReference: "Section 206C(1G)",
    applicableFrom: "2023-24",
  },

  // ── Overseas Tour TCS ──────────────────────────────────────────
  {
    category: "overseas_tour_tcs", code: "OVERSEAS_TOUR_TCS",
    name: "TCS on Overseas Tour Packages",
    description: "TCS on booking of overseas tour packages from Indian tour operators.",
    threshold: 0, rate: 0.20,
    notes: "20% TCS regardless of amount on overseas tour packages. Applies from first rupee. Credit adjustable in ITR.",
    legalReference: "Section 206C(1G)",
    applicableFrom: "2023-24",
  },

  // ── Forex Charges ──────────────────────────────────────────────
  {
    category: "forex_charges", code: "FOREX_GST_HIGH",
    name: "GST on Forex Conversion (High Value)",
    description: "GST on currency exchange where transaction > ₹10 lakh.",
    threshold: 1000000, rate: 0.001,
    flatAmount: 1000, // ₹1,000 max GST for amounts above 10L
    notes: "GST = 0.1% of gross amount, min ₹1,000. For amounts > ₹10L, GST is ₹1,000 flat.",
    legalReference: "GST on financial services",
    applicableFrom: "2024-25",
  },
  {
    category: "forex_charges", code: "FOREX_GST_MID",
    name: "GST on Forex Conversion (Mid Range)",
    description: "GST on forex conversion between ₹1L and ₹10L.",
    threshold: 100000, rate: 0.005,
    flatAmount: 500,
    notes: "GST = 0.5% of gross amount, min ₹500, max ₹1,000.",
    legalReference: "GST on financial services",
    applicableFrom: "2024-25",
  },
  {
    category: "forex_charges", code: "FOREX_GST_LOW",
    name: "GST on Forex Conversion (Low Value)",
    description: "GST on forex conversion up to ₹1 lakh.",
    threshold: 0, rate: 0.01,
    flatAmount: 45,
    notes: "GST = 1% of gross amount, min ₹45.",
    legalReference: "GST on financial services",
    applicableFrom: "2024-25",
  },

  // ── Import Duty ────────────────────────────────────────────────
  {
    category: "import_duty", code: "IMPORT_ELECTRONICS",
    name: "Import Duty — Consumer Electronics",
    description: "Smartphones, laptops, cameras, headphones, tablets, etc.",
    rate: 0.42,
    notes: "Basic customs duty (20%) + IGST (18%) + Social Welfare Surcharge. ~42% on CIF value. Varies by HS code — smartphones may attract different rates.",
    legalReference: "Customs Tariff Act + IGST Act", applicableFrom: "2024-25",
  },
  {
    category: "import_duty", code: "IMPORT_CLOTHING",
    name: "Import Duty — Clothing & Textiles",
    description: "Apparel, garments, fashion accessories.",
    rate: 0.30,
    notes: "Basic customs duty typically 20% + IGST 5–12% depending on category. Readymade garments: ~27.5%.",
    legalReference: "Customs Tariff Act", applicableFrom: "2024-25",
  },
  {
    category: "import_duty", code: "IMPORT_FOOTWEAR",
    name: "Import Duty — Footwear & Shoes",
    description: "Shoes, sandals, boots — all types.",
    rate: 0.35,
    notes: "Basic customs duty 25% + IGST 12%. Composite rate ~35%.",
    legalReference: "Customs Tariff Act", applicableFrom: "2024-25",
  },
  {
    category: "import_duty", code: "IMPORT_WATCHES",
    name: "Import Duty — Watches & Clocks",
    description: "Wristwatches, smartwatches, clocks.",
    rate: 0.38,
    notes: "Basic customs duty up to 20% + IGST 18%. Luxury watches may face higher combined levies.",
    legalReference: "Customs Tariff Act", applicableFrom: "2024-25",
  },
  {
    category: "import_duty", code: "IMPORT_JEWELLERY",
    name: "Import Duty — Jewellery & Precious Metals",
    description: "Gold, silver jewellery, platinum, gemstones.",
    rate: 0.28,
    notes: "Gold: Basic customs duty 10% + Agriculture Infrastructure Cess 5% + IGST 3% = ~18–28% depending on form (bars vs jewellery).",
    legalReference: "Customs Tariff Act", applicableFrom: "2024-25",
  },
  {
    category: "import_duty", code: "IMPORT_FURNITURE",
    name: "Import Duty — Furniture & Home Furnishing",
    description: "Furniture, décor, home goods.",
    rate: 0.38,
    notes: "Basic customs duty 25% + IGST 18% = ~38% composite rate on CIF.",
    legalReference: "Customs Tariff Act", applicableFrom: "2024-25",
  },
  {
    category: "import_duty", code: "IMPORT_COSMETICS",
    name: "Import Duty — Cosmetics & Personal Care",
    description: "Perfumes, skincare, hair care, make-up.",
    rate: 0.42,
    notes: "Perfumes: Basic duty 20% + IGST 28%. Skincare: IGST 18%. Composite rates typically 38–48%.",
    legalReference: "Customs Tariff Act", applicableFrom: "2024-25",
  },
  {
    category: "import_duty", code: "IMPORT_SPORTS",
    name: "Import Duty — Sports & Fitness Equipment",
    description: "Gym equipment, sports gear, bicycles, outdoor gear.",
    rate: 0.30,
    notes: "Basic customs duty 10–20% + IGST 12–18% depending on item type.",
    legalReference: "Customs Tariff Act", applicableFrom: "2024-25",
  },
  {
    category: "import_duty", code: "IMPORT_TOYS",
    name: "Import Duty — Toys & Games",
    description: "Children's toys, board games, hobby kits.",
    rate: 0.32,
    notes: "Basic customs duty 20–60% (higher for Chinese origin) + IGST 12%. BIS licensing also required.",
    legalReference: "Customs Tariff Act", applicableFrom: "2024-25",
  },
  {
    category: "import_duty", code: "IMPORT_FOOD",
    name: "Import Duty — Packaged Food & Beverages",
    description: "Processed food, snacks, health supplements, beverages.",
    rate: 0.40,
    notes: "Basic customs duty 30–100% on food items + IGST 5–28%. Wide variation. Alcohol: much higher combined rates.",
    legalReference: "Customs Tariff Act", applicableFrom: "2024-25",
  },
  {
    category: "import_duty", code: "IMPORT_BOOKS",
    name: "Import Duty — Books & Printed Matter",
    description: "Books, magazines, printed educational material.",
    rate: 0.05,
    notes: "Books are largely exempt from basic customs duty. IGST 5% may apply. Nil-rated for certain categories.",
    legalReference: "Customs Tariff Act", applicableFrom: "2024-25",
  },
];


export async function seedInternationalDutyRules() {
  try {
    const count = await InternationalDutyRule.countDocuments({ category: "import_duty" });
    if (count >= 11) {
      console.log("✅ International duty rules already seeded.");
      return;
    }
    await InternationalDutyRule.deleteMany({});
    await InternationalDutyRule.insertMany(DUTY_RULES);
    console.log(`✅ Seeded ${DUTY_RULES.length} international duty rules.`);
  } catch (err) {
    console.error("❌ Failed to seed international duty rules:", err.message);
  }
}
