import express from "express";
import { createMoodEntry, getMoodHistory, getMoodStats } from "../controllers/moodController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.post("/", createMoodEntry);
router.get("/", getMoodHistory);
router.get("/stats", getMoodStats);

export default router;
