import express from "express";
import { authRequired } from "../middleware/authMiddleware.js";
import {
  calculateTax,
  compareRegimes,
  saveCalculation,
  getHistory,
  getCalculation,
  updateCalculation,
  deleteCalculation,
  getRules,
  getClaimsCatalog,
  analyseClaims,
  getInternationalDutyRules,
  estimateInternationalDuty,
} from "../controllers/taxController.js";

const router = express.Router();

// ── Public endpoints (no auth) ────────────────────────
router.get("/rules", getRules);
router.post("/calculate", calculateTax);
router.post("/compare", compareRegimes);

router.get("/claims/catalog", getClaimsCatalog);
router.post("/claims/analyze", analyseClaims);

router.get("/international-duty/rules", getInternationalDutyRules);
router.post("/international-duty/estimate", estimateInternationalDuty);

// ── Auth-required endpoints ───────────────────────────
router.post("/save", authRequired, saveCalculation);
router.get("/history/:userId", authRequired, getHistory);
router.get("/calculation/:id", authRequired, getCalculation);
router.put("/calculation/:id", authRequired, updateCalculation);
router.delete("/calculation/:id", authRequired, deleteCalculation);

export default router;
