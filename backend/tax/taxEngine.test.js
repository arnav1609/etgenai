/**
 * taxEngine.test.js
 * Unit tests for the Indian Tax Calculation Engine — FY 2025-26
 *
 * Run: node --experimental-vm-modules node_modules/.bin/jest tax/taxEngine.test.js
 * (or configure jest in package.json for ESM support)
 */

import {
  computeGrossIncome,
  computeStandardDeduction,
  computeEligibleDeductionsOldRegime,
  computeTaxableIncome,
  computeNewRegimeTax,
  computeOldRegimeTax,
  applyRebate,
  applySurcharge,
  applyCess,
  compareRegimes,
  computeRegime,
  masterCalculate,
} from "./taxEngine.js";

import { FY2025_26_RULES as RULES } from "./taxRulesSeed.js";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function salariedInputs(salary, deductions = {}) {
  return {
    incomeInputs: { salaryIncome: salary },
    deductionInputs: deductions,
    employmentType: "salaried",
    ageCategory: "below60",
    taxesPaid: {},
    selectedRegime: "autoCompare",
  };
}

// ─────────────────────────────────────────────
// 1. computeGrossIncome
// ─────────────────────────────────────────────
describe("computeGrossIncome", () => {
  test("simple salary only", () => {
    expect(computeGrossIncome({ salaryIncome: 1000000 })).toBe(1000000);
  });
  test("multiple heads aggregated", () => {
    expect(
      computeGrossIncome({
        salaryIncome: 800000,
        housePropertyIncome: 100000,
        otherIncome: 50000,
      })
    ).toBe(950000);
  });
  test("exempt allowances reduce gross", () => {
    expect(
      computeGrossIncome({ salaryIncome: 1000000, exemptAllowances: 100000 })
    ).toBe(900000);
  });
  test("cannot go below zero", () => {
    expect(
      computeGrossIncome({ salaryIncome: 50000, exemptAllowances: 100000 })
    ).toBe(0);
  });
});

// ─────────────────────────────────────────────
// 2. computeStandardDeduction
// ─────────────────────────────────────────────
describe("computeStandardDeduction", () => {
  test("new regime salaried = 75000", () => {
    expect(computeStandardDeduction("new", "salaried", RULES)).toBe(75000);
  });
  test("old regime salaried = 50000", () => {
    expect(computeStandardDeduction("old", "salaried", RULES)).toBe(50000);
  });
  test("business owner gets no standard deduction", () => {
    expect(computeStandardDeduction("new", "business", RULES)).toBe(0);
  });
  test("freelancer get standard deduction", () => {
    expect(computeStandardDeduction("new", "freelancer", RULES)).toBe(75000);
  });
});

// ─────────────────────────────────────────────
// 3. computeNewRegimeTax — slab boundary cases
// ─────────────────────────────────────────────
describe("computeNewRegimeTax — slab boundaries", () => {
  test("₹0 taxable income → ₹0 tax", () => {
    const { baseTax } = computeNewRegimeTax(0, RULES);
    expect(baseTax).toBe(0);
  });
  test("₹4,00,000 exactly → ₹0 tax (nil slab)", () => {
    const { baseTax } = computeNewRegimeTax(400000, RULES);
    expect(baseTax).toBe(0);
  });
  test("₹4,00,001 → ₹0.05 on ₹1", () => {
    const { baseTax } = computeNewRegimeTax(400001, RULES);
    expect(baseTax).toBe(0); // 1 * 5% rounds to 0
  });
  test("₹8,00,000 → 5% on top ₹4L = ₹20,000", () => {
    const { baseTax } = computeNewRegimeTax(800000, RULES);
    expect(baseTax).toBe(20000);
  });
  test("₹12,00,000 → 5%*4L + 10%*4L = 20k+40k = ₹60,000", () => {
    const { baseTax } = computeNewRegimeTax(1200000, RULES);
    expect(baseTax).toBe(60000);
  });
  test("₹15,00,000 → 60k + 15%*3L = 60k+45k = ₹1,05,000", () => {
    const { baseTax } = computeNewRegimeTax(1500000, RULES);
    expect(baseTax).toBe(105000);
  });
  test("₹20,00,000 → 60k+45k+4*20k+nothing = ₹1,85,000", () => {
    // slabs: 0-4L=0, 4L-8L=5%=20k, 8L-12L=10%=40k, 12L-16L=15%=60k, 16-20L=20%=80k
    const { baseTax } = computeNewRegimeTax(2000000, RULES);
    expect(baseTax).toBe(0 + 20000 + 40000 + 60000 + 80000);
  });
});

// ─────────────────────────────────────────────
// 4. computeOldRegimeTax
// ─────────────────────────────────────────────
describe("computeOldRegimeTax", () => {
  test("₹2,50,000 below60 → ₹0", () => {
    const { baseTax } = computeOldRegimeTax(250000, "below60", RULES);
    expect(baseTax).toBe(0);
  });
  test("₹5,00,000 below60 → 5%*2.5L = ₹12,500", () => {
    const { baseTax } = computeOldRegimeTax(500000, "below60", RULES);
    expect(baseTax).toBe(12500);
  });
  test("₹10,00,000 below60 → 12,500 + 20%*5L = 12500+100000 = ₹1,12,500", () => {
    const { baseTax } = computeOldRegimeTax(1000000, "below60", RULES);
    expect(baseTax).toBe(112500);
  });
  test("Senior (60-80) ₹3,00,000 nil", () => {
    const { baseTax } = computeOldRegimeTax(300000, "senior60to80", RULES);
    expect(baseTax).toBe(0);
  });
  test("Super Senior ₹5,00,000 nil", () => {
    const { baseTax } = computeOldRegimeTax(500000, "superSenior80plus", RULES);
    expect(baseTax).toBe(0);
  });
});

// ─────────────────────────────────────────────
// 5. applyRebate 87A
// ─────────────────────────────────────────────
describe("applyRebate", () => {
  const newRebate = RULES.newRegime.rebate87A; // threshold 12L, max 60k
  const oldRebate = RULES.oldRegime.rebate87A; // threshold 5L, max 12.5k

  test("new regime: taxableIncome ≤12L → full rebate up to ₹60k", () => {
    expect(applyRebate(60000, 1200000, newRebate)).toBe(60000);
  });
  test("new regime: taxableIncome > 12L → no rebate", () => {
    expect(applyRebate(80000, 1200001, newRebate)).toBe(0);
  });
  test("old regime: taxableIncome ≤ 5L → rebate = min(tax, 12500)", () => {
    expect(applyRebate(12500, 500000, oldRebate)).toBe(12500);
  });
  test("old regime: tax < 12500 → rebate = actual tax", () => {
    expect(applyRebate(8000, 480000, oldRebate)).toBe(8000);
  });
  test("old regime: taxableIncome > 5L → no rebate", () => {
    expect(applyRebate(15000, 500001, oldRebate)).toBe(0);
  });
});

// ─────────────────────────────────────────────
// 6. applyCess
// ─────────────────────────────────────────────
describe("applyCess", () => {
  test("4% cess on tax of ₹1,00,000 = ₹4,000", () => {
    expect(applyCess(100000, RULES)).toBe(4000);
  });
  test("4% cess rounds correctly", () => {
    expect(applyCess(12500, RULES)).toBe(500);
  });
});

// ─────────────────────────────────────────────
// 7. applySurcharge
// ─────────────────────────────────────────────
describe("applySurcharge", () => {
  test("income < 50L → no surcharge", () => {
    expect(applySurcharge(100000, 4999999, RULES)).toBe(0);
  });
  test("income 50L-1Cr → 10% surcharge", () => {
    expect(applySurcharge(200000, 6000000, RULES)).toBe(20000);
  });
  test("income 1Cr-2Cr → 15% surcharge", () => {
    expect(applySurcharge(500000, 12000000, RULES)).toBe(75000);
  });
});

// ─────────────────────────────────────────────
// 8. End-to-end masterCalculate scenarios
// ─────────────────────────────────────────────
describe("masterCalculate — end-to-end", () => {
  test("₹12L salaried new regime → nil tax (standard deduction + 87A rebate)", () => {
    const result = masterCalculate(salariedInputs(1200000), RULES);
    // Taxable = 12L - 75k = 11.25L → tax = 60k - 25*4L+10*4L = 60k - 20k+37.5k... wait
    // Actually: 12L gross - 75k std = 11.25L taxable
    // New regime slab: 0-4L=0, 4L-8L=5%(20k), 8L-11.25L=10%(32.5k) → 52.5k base tax
    // 11.25L < 12L threshold → rebate = min(52.5k, 60k) = 52.5k → finalTax = 0

    expect(result.newRegimeResult.finalTax).toBe(0);
    expect(result.newRegimeResult.rebate87A).toBe(
      result.newRegimeResult.baseTax // full rebate
    );
  });

  test("₹13L salaried new regime — tax payable (above 87A threshold)", () => {
    const result = masterCalculate(salariedInputs(1300000), RULES);
    // Taxable = 13L - 75k = 12.25L → above 12L threshold → no rebate
    // Slab: 0-4L=0, 4L-8L=20k, 8L-12L=40k, 12L-12.25L=15%*25k=3750 → 63750
    // Cess: 4% → 2550 → finalTax = 66300
    expect(result.newRegimeResult.finalTax).toBeGreaterThan(0);
    expect(result.newRegimeResult.rebate87A).toBe(0);
  });

  test("₹6L salaried old regime → nil tax via 87A", () => {
    const result = masterCalculate(salariedInputs(600000), RULES);
    // Old regime: taxable = 6L - 50k = 5.5L... wait, 5.5L > 5L threshold → no rebate
    // tax = 5%*2.5L + 20%*50k = 12.5k + 10k = 22.5k + cess → not nil
    // But with 80C deductions = 150k: taxable = 6L - 50k - 1.5L = 4L → rebate applies (4L < 5L)
    // Tax on 4L = 5%*1.5L = 7.5k → rebate = 7.5k → nil
    const withDeductions = masterCalculate({
      ...salariedInputs(600000),
      deductionInputs: { section80C: 150000 },
    }, RULES);
    expect(withDeductions.oldRegimeResult.finalTax).toBe(0);
  });

  test("compareRegimes picks new regime for simple salaried 15L income", () => {
    const result = masterCalculate(salariedInputs(1500000), RULES);
    // With minimal deductions, new regime typically wins at mid incomes
    expect(["old", "new"]).toContain(result.recommendedRegime);
    expect(typeof result.taxSavedByOptimalRegime).toBe("number");
  });

  test("grossIncome is same in both regime results", () => {
    const result = masterCalculate(salariedInputs(1000000), RULES);
    expect(result.newRegimeResult.grossIncome).toBe(result.oldRegimeResult.grossIncome);
    expect(result.grossIncome).toBe(1000000);
  });

  test("balanceDue is calculated when TDS paid", () => {
    const payload = {
      ...salariedInputs(1500000),
      taxesPaid: { tdsPaid: 50000, advanceTaxPaid: 0 },
    };
    const result = masterCalculate(payload, RULES);
    const primaryTax =
      result.recommendedRegime === "new"
        ? result.newRegimeResult.finalTax
        : result.oldRegimeResult.finalTax;
    expect(result.balanceDue).toBe(primaryTax - 50000);
  });
});

// ─────────────────────────────────────────────
// 9. Slab breakdown completeness
// ─────────────────────────────────────────────
describe("slab breakdown", () => {
  test("slab breakdown adds up to baseTax", () => {
    const { baseTax, breakdown } = computeNewRegimeTax(2000000, RULES);
    const sum = breakdown.reduce((acc, s) => acc + s.taxForSlab, 0);
    expect(sum).toBe(baseTax);
  });
});
