import express from "express";
import { suggestMusic } from "../controllers/musicController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/suggest", protect, suggestMusic);

export default router;
