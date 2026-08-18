import MoodEntry from "../models/MoodEntry.js";
import User from "../models/User.js";
import { buildSuggestion } from "../utils/suggestionEngine.js";
import { containsCrisisLanguage } from "../data/crisisKeywords.js";
import { CRISIS_RESOURCES } from "../data/resources.js";

function isSameCalendarDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isYesterday(prev, now) {
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameCalendarDay(prev, yesterday);
}

async function updateStreak(user) {
  const now = new Date();
  if (!user.lastCheckInDate) {
    user.streakCount = 1;
  } else if (isSameCalendarDay(user.lastCheckInDate, now)) {
    // already checked in today, streak unchanged
  } else if (isYesterday(user.lastCheckInDate, now)) {
    user.streakCount += 1;
  } else {
    user.streakCount = 1;
  }
  user.lastCheckInDate = now;
  await user.save();
  return user.streakCount;
}

// POST /api/moods
export async function createMoodEntry(req, res, next) {
  try {
    const { mood, intensity, note, context, genre } = req.body;

    if (!mood) {
      res.status(400);
      throw new Error("A mood is required");
    }

    // Local keyword safety net — the only crisis check in this app now that
    // suggestions come from a local classifier rather than an LLM. Runs on
    // every check-in, no configuration required.
    if (containsCrisisLanguage(note)) {
      const entry = await MoodEntry.create({
        user: req.user._id,
        mood,
        intensity,
        note,
        context,
      });
      return res.status(201).json({
        entry,
        crisis: true,
        resources: CRISIS_RESOURCES,
      });
    }

    const entry = await MoodEntry.create({
      user: req.user._id,
      mood,
      intensity,
      note,
      context,
    });

    const streakCount = await updateStreak(req.user);
    const suggestion = buildSuggestion({ mood, intensity, note, genre });

    res.status(201).json({
      entry,
      crisis: false,
      streakCount,
      suggestion,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/moods
export async function getMoodHistory(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 200);
    const entries = await MoodEntry.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json({ entries });
  } catch (err) {
    next(err);
  }
}

// GET /api/moods/stats
export async function getMoodStats(req, res, next) {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const entries = await MoodEntry.find({
      user: req.user._id,
      createdAt: { $gte: since },
    })
      .sort({ createdAt: 1 })
      .select("mood intensity createdAt");

    res.json({
      entries,
      streakCount: req.user.streakCount,
    });
  } catch (err) {
    next(err);
  }
}
