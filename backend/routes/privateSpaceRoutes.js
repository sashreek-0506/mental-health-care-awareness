import express from "express";
import {
  createPrivateEntry,
  getPrivateEntries,
  toggleFavoriteEntry,
  deletePrivateEntry,
} from "../controllers/privateSpaceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createPrivateEntry);
router.get("/", getPrivateEntries);
router.patch("/:id/favorite", toggleFavoriteEntry);
router.delete("/:id", deletePrivateEntry);

export default router;
