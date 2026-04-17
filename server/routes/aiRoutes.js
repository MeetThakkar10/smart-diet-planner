import express from "express";
import { generateDietPlan } from "../controllers/aiController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/generate", protect, generateDietPlan);

export default router;
