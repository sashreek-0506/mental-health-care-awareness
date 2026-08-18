import { TRACKS } from "../data/tracks.js";
import { classifyText } from "../ml/moodClassifier.js";
import { classifyDayContext } from "../ml/dayContextClassifier.js";

// Moods where "how strongly" (intensity) doesn't map to distress — they're
// already good feelings, so there's no grounding tip to escalate.
const POSITIVE_MOODS = new Set(["happy", "calm", "okay"]);

// A rough severity ordering used only to decide whether the classifier's
// reading of the note text is "heavier" than the mood the student picked —
// never to override what they picked, only to optionally add support.
const SEVERITY_RANK = {
  unmotivated: 1,
  tired: 1,
  anxious: 2,
  stressed: 2,
  overwhelmed: 3,
  sad: 3,
  angry: 3,
};

const CALM_TAGS = new Set(["ambient", "classical", "minimalist", "nature"]);
const SOFT_MOMENTUM_TAGS = new Set(["acoustic", "chill", "instrumental", "lofi", "piano"]);
const CLASSIFIER_CONFIDENCE_THRESHOLD = 0.35;
const DAY_CONTEXT_CONFIDENCE_THRESHOLD = 0.3;

const DAY_CONTEXT_DETAILS = {
  academic_pressure: {
    label: "academic pressure",
    insight:
      "Your note sounds shaped by exams, deadlines, or study pressure, so I leaned the music toward steady focus and downshifting.",
  },
  achievement: {
    label: "a win",
    insight: "This reads like a win, so I leaned the music warmer and a little more hopeful.",
  },
  social_connection: {
    label: "connection",
    insight: "Your day seems shaped by people, friends, or home, so the tracks lean warmer and more human.",
  },
  conflict: {
    label: "conflict",
    insight:
      "Your note sounds tense or conflict-heavy, so I leaned the music toward tracks that give that energy room to settle.",
  },
  isolation: {
    label: "loneliness",
    insight:
      "This sounds like a lonely or homesick day, so the music leans gentle instead of pushing you to be upbeat.",
  },
  low_energy: {
    label: "low energy",
    insight: "This reads like a low-energy day, so the music leans restful with a little bit of forward motion.",
  },
  routine: {
    label: "a routine day",
    insight: "This sounds like a normal day, so I kept the music balanced and easy to stay with.",
  },
  setback: {
    label: "a setback",
    insight:
      "Your note sounds like the day had a setback, so I leaned the music toward soft recovery rather than high energy.",
  },
};

const FLAT_REFLECTIONS = {
  happy: "Good to see you're feeling good — worth noticing what's contributing to that.",
  calm: "Sounds like a steady moment. A good time to bank some rest before the next deadline.",
  okay: "A fairly neutral day. That's a completely normal place to be.",
};

const FLAT_TIPS = {
  happy: "Take thirty seconds to actually notice what's going well.",
  calm: "Stay here for a minute before switching tasks.",
  okay: "A short walk can be a good reset between tasks.",
};

const BANDED_REFLECTIONS = {
  anxious: {
    low: "A little anxious is easy to carry — probably nothing that needs more than a few slow breaths.",
    medium: "That on-edge feeling is uncomfortable but temporary. Slowing your breathing down is one of the few things that reliably helps in the moment.",
    high: "That sounds like a lot of anxious energy right now. It's worth pausing properly rather than pushing through it.",
  },
  stressed: {
    low: "A bit of pressure is normal, especially this time of semester.",
    medium: "Sounds like a lot is stacked up right now. Naming even one task to focus on next can take some of the pressure off.",
    high: "That's a heavy load to be carrying. Before tackling any of it, it's worth taking a few minutes to just reset.",
  },
  overwhelmed: {
    low: "A few things piling up, but nothing you can't work through one at a time.",
    medium: "When everything feels like too much at once, it usually helps to deliberately shrink your focus to one small, doable thing.",
    high: "That's a lot hitting you at once. It's okay to stop and do nothing for a few minutes before trying to sort through it.",
  },
  sad: {
    low: "A quieter, lower mood — nothing wrong with just sitting with it for a bit.",
    medium: "That's a heavy feeling to carry. It's okay to slow down rather than push through it.",
    high: "That sounds like a genuinely hard moment. Be gentle with yourself right now — you don't need to solve anything today.",
  },
  angry: {
    low: "A bit of irritation, understandable given what's going on.",
    medium: "That's a valid reaction. Giving it somewhere to go, physically or on paper, tends to help before trying to think it through.",
    high: "That's a strong reaction to be sitting with. Give yourself a few minutes before responding to anything or anyone.",
  },
  tired: {
    low: "A bit worn out — a short break should help more than pushing on.",
    medium: "Running low on energy is your body asking for rest, not more effort.",
    high: "You sound genuinely exhausted. If there's any way to get real rest tonight, it'll help more than one more hour of work would.",
  },
  unmotivated: {
    low: "A slow start is normal — you don't need to feel ready to begin.",
    medium: "Motivation often shows up after you start, not before — a small first step usually helps more than waiting to feel ready.",
    high: "Sounds like you're really stuck right now. It's okay to lower the bar — even five minutes on the smallest piece counts.",
  },
};

const BANDED_TIPS = {
  anxious: {
    low: "A couple of slow breaths before you go back to what you were doing.",
    medium: "Try four rounds of box breathing: in for 4, hold for 4, out for 4, hold for 4.",
    high: "Stop what you're doing for two minutes and do a full round of box breathing before anything else.",
  },
  stressed: {
    low: "Jot down what's actually due today — it's often less than it feels like.",
    medium: "Write down every task in your head onto paper, then pick just one to start.",
    high: "Stop, breathe for a minute, and pick the single most urgent thing — everything else can wait a few minutes longer.",
  },
  overwhelmed: {
    low: "Pick the smallest task on your list and start there.",
    medium: "Name 5 things you can see and 4 you can hear, right now, out loud or in your head.",
    high: "Step away for five minutes completely before you try to organize anything — your brain needs the pause first.",
  },
  sad: {
    low: "Let yourself have a slower evening if you can.",
    medium: "Let yourself feel it for a few minutes rather than pushing it down — that tends to pass quicker than fighting it.",
    high: "If there's someone you trust, it might help to tell them how today actually felt, even briefly.",
  },
  angry: {
    low: "Take a short walk before getting back to it.",
    medium: "Unclench your jaw and shoulders, take one slow breath, and give it a minute before responding to anything.",
    high: "Step away completely for ten minutes — don't reply to anyone or make any decisions until that anger has some room to settle.",
  },
  tired: {
    low: "A five-minute stretch or walk can help more than you'd expect.",
    medium: "If you can, a 20-minute break beats pushing through on empty.",
    high: "Protect your sleep tonight over finishing one more thing — it's rarely worth the trade.",
  },
  unmotivated: {
    low: "Set a timer for ten minutes and just start, no pressure to keep going after.",
    medium: "Commit to just five minutes of the task — you can stop after that if you want.",
    high: "Pick the smallest possible first step, not the whole task — anything that gets you moving counts.",
  },
};

export function computeBaseBand(intensity) {
  if (intensity <= 2) return "low";
  if (intensity === 3) return "medium";
  return "high";
}

// Only ever escalates the band (toward more support), never downgrades it —
// the student's own self-report always sets the floor. The classifier can
// add support, never take it away.
export function maybeEscalateBand(band, mood, classification) {
  if (!classification) return band;
  const { label: predictedMood, confidence } = classification;
  if (confidence < CLASSIFIER_CONFIDENCE_THRESHOLD) return band;
  if (predictedMood === mood) return band;

  const selfRank = SEVERITY_RANK[mood];
  const predictedRank = SEVERITY_RANK[predictedMood];
  if (selfRank == null || predictedRank == null) return band;

  if (predictedRank > selfRank) {
    if (band === "low") return "medium";
    if (band === "medium") return "high";
  }
  return band;
}

function getTrustedDayContext(dayContext) {
  if (!dayContext || dayContext.confidence < DAY_CONTEXT_CONFIDENCE_THRESHOLD) return null;
  return dayContext.label;
}

function scoreTrack(track, mood, band, dayContextLabel) {
  let score = 0;

  if (track.moods.includes(mood)) score += 5;
  if (dayContextLabel && track.dayContexts?.includes(dayContextLabel)) score += 6;

  if (band === "high") {
    if (CALM_TAGS.has(track.tag)) score += 2;
    if (SOFT_MOMENTUM_TAGS.has(track.tag)) score += 1;
  }

  if (POSITIVE_MOODS.has(mood) && SOFT_MOMENTUM_TAGS.has(track.tag)) {
    score += 1;
  }

  return score;
}

function pickTracks(mood, band, limit = 3, dayContext = null) {
  const dayContextLabel = getTrustedDayContext(dayContext);
  const scored = TRACKS.map((track) => ({
    track,
    score: scoreTrack(track, mood, band, dayContextLabel),
  })).filter(({ score }) => score > 0);

  const fallbackPool = TRACKS.filter((t) => t.moods.includes(mood));
  const fallback = fallbackPool.length ? fallbackPool : TRACKS.filter((t) => t.moods.includes("okay"));
  const candidates = scored.length ? scored : fallback.map((track) => ({ track, score: 1 }));

  candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return Math.random() - 0.5;
  });

  const picked = [];
  for (const { track } of candidates) {
    if (!picked.some((existing) => existing.id === track.id)) picked.push(track);
    if (picked.length === limit) return picked;
  }

  const filler = [...fallback].sort(() => Math.random() - 0.5);
  for (const track of filler) {
    if (!picked.some((existing) => existing.id === track.id)) picked.push(track);
    if (picked.length === limit) break;
  }

  return picked;
}

// A gentle, non-diagnostic nudge — only shown when the note reads heavier
// than the mood picked, and phrased as an observation to consider, not a
// correction. Never fires in the other direction (i.e. never tells someone
// their note sounds "better" than what they picked).
export function buildNoteInsight(mood, classification) {
  if (!classification) return null;
  if (classification.label === mood) return null;
  if (classification.confidence < CLASSIFIER_CONFIDENCE_THRESHOLD) return null;

  const selfRank = SEVERITY_RANK[mood];
  const predictedRank = SEVERITY_RANK[classification.label];
  if (selfRank == null || predictedRank == null) return null;

  if (predictedRank > selfRank) {
    return `Your note reads a little heavier than "${mood}" — no pressure, just flagging it in case a stronger reset helps.`;
  }
  return null;
}

export function buildDayContextInsight(dayContext) {
  const label = getTrustedDayContext(dayContext);
  if (!label) return null;
  return DAY_CONTEXT_DETAILS[label]?.insight || null;
}

function serializeDayContext(dayContext) {
  const label = getTrustedDayContext(dayContext);
  if (!label) return null;
  return {
    label,
    displayName: DAY_CONTEXT_DETAILS[label]?.label || label,
    confidence: dayContext.confidence,
  };
}

/**
 * Builds a suggestion for a mood check-in. Fully local and synchronous —
 * runs the trained classifier (if a note was given) and picks a reflection,
 * grounding tip, and 1-3 tracks from the curated list. Note: crisis
 * detection is handled separately, upstream, in the controllers — this
 * function assumes that check has already passed.
 */
export function buildSuggestion({ mood, intensity = 3, note }) {
  const classification = classifyText(note);
  const dayContext = classifyDayContext(note);
  const source = classification || dayContext ? "local-ml" : "curated";
  const serializedDayContext = serializeDayContext(dayContext);

  if (POSITIVE_MOODS.has(mood)) {
    return {
      source,
      reflection: FLAT_REFLECTIONS[mood] || FLAT_REFLECTIONS.okay,
      groundingTip: FLAT_TIPS[mood] || FLAT_TIPS.okay,
      tracks: pickTracks(mood, "low", 3, dayContext),
      noteInsight: buildNoteInsight(mood, classification),
      dayContext: serializedDayContext,
      dayContextInsight: buildDayContextInsight(dayContext),
    };
  }

  const band = maybeEscalateBand(computeBaseBand(intensity), mood, classification);

  return {
      source,
      reflection: BANDED_REFLECTIONS[mood]?.[band] || FLAT_REFLECTIONS.okay,
      groundingTip: BANDED_TIPS[mood]?.[band] || FLAT_TIPS.okay,
      tracks: pickTracks(mood, band, 3, dayContext),
      noteInsight: buildNoteInsight(mood, classification),
      dayContext: serializedDayContext,
      dayContextInsight: buildDayContextInsight(dayContext),
    };
}
