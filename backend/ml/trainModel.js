// Trains the mood classifier and saves it to ml/model/weights.json.
// Run with: node ml/trainModel.js
//
// This is a genuinely small dataset (~220 hand-written examples across 10
// classes), so don't expect the classifier to be highly accurate on its
// own — it's used as a supplementary cross-check signal alongside the
// student's own self-reported mood, not as the sole source of truth.
// See ml/README.md for the honest numbers and how it's actually used.

import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { TRAINING_DATA } from "./data/trainingData.js";
import { TfidfVectorizer } from "./textVectorizer.js";
import { trainMLP, evaluateAccuracy } from "./neuralNet.js";
import { MOODS } from "../models/MoodEntry.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function main() {
  console.log(`Training on ${TRAINING_DATA.length} labeled examples across ${MOODS.length} moods...`);

  const vectorizer = new TfidfVectorizer().fit(TRAINING_DATA.map((d) => d.text));
  console.log(`Vocabulary size: ${vectorizer.size}`);

  const labelIndex = Object.fromEntries(MOODS.map((m, i) => [m, i]));

  const dataset = shuffle(
    TRAINING_DATA.map((d) => ({
      x: vectorizer.transform(d.text),
      yIndex: labelIndex[d.mood],
      mood: d.mood,
    }))
  );

  const valSize = Math.round(dataset.length * 0.15);
  const valSet = dataset.slice(0, valSize);
  const trainSet = dataset.slice(valSize);

  console.log(`Train examples: ${trainSet.length}, validation examples: ${valSet.length}`);

  const { model, history, bestEpoch, bestValAccuracy } = trainMLP({
    examples: trainSet,
    valExamples: valSet,
    inputSize: vectorizer.size,
    hiddenSize: 32,
    outputSize: MOODS.length,
    epochs: 500,
    learningRate: 0.08,
    l2: 2e-4,
    patience: 30,
  });

  console.log(`Stopped at epoch ${history.length} (best validation snapshot from epoch ${bestEpoch + 1})`);
  console.log(`Training loss at that point: ${history[bestEpoch].toFixed(4)} (started at ${history[0].toFixed(4)})`);

  // Final evaluation (re-derives accuracy + a per-class breakdown from the
  // best early-stopped snapshot, for the printed report below).
  let correct = 0;
  const perClass = Object.fromEntries(MOODS.map((m) => [m, { correct: 0, total: 0 }]));
  for (const ex of valSet) {
    const probs = model.predict(ex.x);
    const predictedIndex = probs.indexOf(Math.max(...probs));
    perClass[ex.mood].total++;
    if (predictedIndex === ex.yIndex) {
      correct++;
      perClass[ex.mood].correct++;
    }
  }
  const accuracy = valSet.length ? correct / valSet.length : 0;
  console.log(`\nValidation accuracy (best snapshot): ${(accuracy * 100).toFixed(1)}% (${correct}/${valSet.length})`);
  console.log("(random-chance baseline for 10 classes is 10%)\n");

  console.log("Per-class breakdown (validation set):");
  for (const mood of MOODS) {
    const { correct, total } = perClass[mood];
    if (total === 0) {
      console.log(`  ${mood.padEnd(12)} — no validation examples this run`);
    } else {
      console.log(`  ${mood.padEnd(12)} ${correct}/${total}`);
    }
  }

  const artifact = {
    trainedAt: new Date().toISOString(),
    labels: MOODS,
    validationAccuracy: accuracy,
    vectorizer: vectorizer.toJSON(),
    model: model.toJSON(),
  };

  const outPath = join(__dirname, "model", "weights.json");
  writeFileSync(outPath, JSON.stringify(artifact));
  console.log(`\nSaved trained model to ${outPath}`);
}

main();
