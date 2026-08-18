import express from "express";
import { suggestMusic, getGenres } from "../controllers/musicController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/genres", protect, getGenres);
router.post("/suggest", protect, suggestMusic);

export default router;
