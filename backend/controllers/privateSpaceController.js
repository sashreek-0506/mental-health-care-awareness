import PrivateEntry from "../models/PrivateEntry.js";
import { generateEncouragement } from "../utils/encouragementEngine.js";
import { containsCrisisLanguage } from "../data/crisisKeywords.js";
import { CRISIS_RESOURCES } from "../data/resources.js";

// POST /api/private-space
export async function createPrivateEntry(req, res, next) {
  try {
    const { title, content, tags } = req.body;

    if (!content || !content.trim()) {
      res.status(400);
      throw new Error("Content is required for a private entry");
    }

    if (containsCrisisLanguage(content)) {
      return res.status(200).json({
        crisis: true,
        resources: CRISIS_RESOURCES,
      });
    }

    const encouragement = generateEncouragement(content);

    const entry = await PrivateEntry.create({
      user: req.user._id,
      title: title?.trim() || "Untitled Reflection",
      content: content.trim(),
      tags: Array.isArray(tags) ? tags : [],
      encouragement,
    });

    res.status(201).json({
      crisis: false,
      entry,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/private-space
export async function getPrivateEntries(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const entries = await PrivateEntry.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({ entries });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/private-space/:id/favorite
export async function toggleFavoriteEntry(req, res, next) {
  try {
    const entry = await PrivateEntry.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!entry) {
      res.status(404);
      throw new Error("Private entry not found");
    }

    entry.isFavorite = !entry.isFavorite;
    await entry.save();

    res.json({ entry });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/private-space/:id
export async function deletePrivateEntry(req, res, next) {
  try {
    const entry = await PrivateEntry.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!entry) {
      res.status(404);
      throw new Error("Private entry not found");
    }

    res.json({ message: "Private entry deleted successfully" });
  } catch (err) {
    next(err);
  }
}
