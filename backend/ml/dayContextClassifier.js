// Loads the trained day-context model artifact and exposes classifyDayContext.
// This is intentionally local and soft-failing, just like moodClassifier.js:
// if the artifact is missing, song suggestions fall back to mood-only logic.

import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { TfidfVectorizer } from "./textVectorizer.js";
import { MLPClassifier } from "./neuralNet.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEIGHTS_PATH = join(__dirname, "model", "dayWeights.json");

let cached = null;
let loadAttempted = false;

const LEXICAL_SIGNALS = {
  academic_pressure: [
    "assignment", "deadline", "demo", "exam", "final", "lab", "placement", "presentation",
    "project", "quiz", "study", "submission", "syllabus", "test", "viva",
  ],
  achievement: [
    "aced", "cleared", "completed", "finished", "full marks", "good feedback", "proud",
    "selected", "shortlisted", "solved", "submitted early", "won", "worked",
  ],
  social_connection: [
    "called home", "classmates", "cousin", "family", "friend", "friends", "group",
    "lunch", "parents", "roommates", "tea", "together",
  ],
  conflict: [
    "argument", "blamed", "disagree", "drama", "fight", "fought", "ignored", "judged",
    "misunderstanding", "scolded", "snapped", "tense",
  ],
  isolation: [
    "alone", "disconnected", "homesick", "invisible", "left out", "lonely", "missing home",
    "missed home", "no one", "outside", "room",
  ],
  low_energy: [
    "all nighter", "drained", "exhausted", "fatigue", "headache", "low battery", "rest",
    "sleep", "sleepy", "slept", "tired", "weak", "wiped",
  ],
  routine: [
    "average", "autopilot", "normal", "nothing much", "ordinary", "plain", "regular",
    "routine", "same", "usual",
  ],
  setback: [
    "bad marks", "broke", "crashed", "disappointed", "doubt", "failed", "fell apart",
    "forgot", "messed up", "missed deadline", "not good", "rejected",
  ],
};

function lexicalScores(text, labels) {
  const normalized = text.toLowerCase();
  const scores = Object.fromEntries(labels.map((label) => [label, 0]));

  for (const [label, signals] of Object.entries(LEXICAL_SIGNALS)) {
    for (const signal of signals) {
      if (normalized.includes(signal)) {
        scores[label] += signal.includes(" ") ? 1.4 : 1;
      }
    }
  }

  return scores;
}

function blendWithLexicalSignals(probs, labels, text) {
  const scores = lexicalScores(text, labels);
  const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
  if (!total) return probs;

  const weight = Math.min(0.45, 0.18 + total * 0.04);
  const blended = probs.map((prob, i) => {
    const label = labels[i];
    return prob * (1 - weight) + (scores[label] / total) * weight;
  });

  const sum = blended.reduce((acc, value) => acc + value, 0);
  return blended.map((value) => value / sum);
}

function loadArtifact() {
  if (loadAttempted) return cached;
  loadAttempted = true;

  if (!existsSync(WEIGHTS_PATH)) {
    console.warn(
      `[dayContextClassifier] No trained model found at ${WEIGHTS_PATH}. Run "node ml/trainDayModel.js" to train one. Falling back to mood-only song ranking.`
    );
    return null;
  }

  try {
    const raw = JSON.parse(readFileSync(WEIGHTS_PATH, "utf-8"));
    cached = {
      labels: raw.labels,
      vectorizer: TfidfVectorizer.fromJSON(raw.vectorizer),
      model: MLPClassifier.fromJSON(raw.model),
      trainedAt: raw.trainedAt,
      validationAccuracy: raw.validationAccuracy,
    };
    console.log(
      `[dayContextClassifier] Loaded local model trained ${raw.trainedAt} (validation accuracy ${(raw.validationAccuracy * 100).toFixed(1)}%)`
    );
    return cached;
  } catch (err) {
    console.error(`[dayContextClassifier] Failed to load ${WEIGHTS_PATH}: ${err.message}`);
    return null;
  }
}

export function classifyDayContext(text) {
  if (!text || !text.trim()) return null;

  const artifact = loadArtifact();
  if (!artifact) return null;

  const vector = artifact.vectorizer.transform(text);
  const rawProbs = artifact.model.predict(vector);
  const probs = blendWithLexicalSignals(rawProbs, artifact.labels, text);

  const probabilities = {};
  let bestIndex = 0;
  for (let i = 0; i < artifact.labels.length; i++) {
    probabilities[artifact.labels[i]] = probs[i];
    if (probs[i] > probs[bestIndex]) bestIndex = i;
  }

  return {
    label: artifact.labels[bestIndex],
    confidence: probs[bestIndex],
    probabilities,
  };
}

export function isDayContextModelAvailable() {
  return loadArtifact() !== null;
}
