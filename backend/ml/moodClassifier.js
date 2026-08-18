// Loads the trained model artifact (ml/model/weights.json) once and
// exposes a simple classify(text) function. If the artifact is missing —
// e.g. someone deleted it, or trainModel.js was never run — this fails
// soft: classify() returns null and the rest of the app falls back to
// curated-only suggestions instead of crashing.

import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { TfidfVectorizer } from "./textVectorizer.js";
import { MLPClassifier } from "./neuralNet.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEIGHTS_PATH = join(__dirname, "model", "weights.json");

let cached = null;
let loadAttempted = false;

function loadArtifact() {
  if (loadAttempted) return cached;
  loadAttempted = true;

  if (!existsSync(WEIGHTS_PATH)) {
    console.warn(
      `[moodClassifier] No trained model found at ${WEIGHTS_PATH}. Run "node ml/trainModel.js" to train one. Falling back to curated-only suggestions until then.`
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
      `[moodClassifier] Loaded local model trained ${raw.trainedAt} (validation accuracy ${(raw.validationAccuracy * 100).toFixed(1)}%)`
    );
    return cached;
  } catch (err) {
    console.error(`[moodClassifier] Failed to load ${WEIGHTS_PATH}: ${err.message}`);
    return null;
  }
}

/**
 * Classifies free text into one of the ten mood labels.
 * Returns null if no note text was given or the model isn't available.
 * Otherwise returns { label, confidence, probabilities }, where
 * probabilities maps every mood label to its predicted probability.
 */
export function classifyText(text) {
  if (!text || !text.trim()) return null;

  const artifact = loadArtifact();
  if (!artifact) return null;

  const vector = artifact.vectorizer.transform(text);
  const probs = artifact.model.predict(vector);

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

export function isModelAvailable() {
  return loadArtifact() !== null;
}
