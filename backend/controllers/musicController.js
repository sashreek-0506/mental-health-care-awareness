import { buildSuggestion } from "../utils/suggestionEngine.js";
import { containsCrisisLanguage } from "../data/crisisKeywords.js";
import { CRISIS_RESOURCES } from "../data/resources.js";
import { MOODS } from "../models/MoodEntry.js";

// POST /api/music/suggest
// A lightweight, unsaved version of the suggestion flow, used by the
// Calm Space page for a quick "I feel X right now" without a full journal
// entry.
export function suggestMusic(req, res, next) {
  try {
    const { mood, note } = req.body;

    if (!mood || !MOODS.includes(mood)) {
      res.status(400);
      throw new Error(`mood must be one of: ${MOODS.join(", ")}`);
    }

    if (containsCrisisLanguage(note)) {
      return res.json({ crisis: true, resources: CRISIS_RESOURCES });
    }

    const suggestion = buildSuggestion({ mood, intensity: 3, note });
    res.json({ crisis: false, suggestion });
  } catch (err) {
    next(err);
  }
}
