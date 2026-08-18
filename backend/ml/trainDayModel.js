// Trains the day-context classifier and saves it to ml/model/dayWeights.json.
// Run with: node ml/trainDayModel.js

import { mkdirSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { DAY_CONTEXTS, DAY_TRAINING_DATA } from "./data/dayTrainingData.js";
import { TfidfVectorizer } from "./textVectorizer.js";
import { trainMLP } from "./neuralNet.js";

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
  console.log(
    `Training day-context model on ${DAY_TRAINING_DATA.length} examples across ${DAY_CONTEXTS.length} contexts...`
  );

  const vectorizer = new TfidfVectorizer().fit(
    DAY_TRAINING_DATA.map((d) => d.text),
    { minDocFreq: 1 }
  );
  console.log(`Vocabulary size: ${vectorizer.size}`);

  const labelIndex = Object.fromEntries(DAY_CONTEXTS.map((label, i) => [label, i]));
  const dataset = shuffle(
    DAY_TRAINING_DATA.map((d) => ({
      x: vectorizer.transform(d.text),
      yIndex: labelIndex[d.context],
      context: d.context,
    }))
  );

  const valSize = Math.round(dataset.length * 0.18);
  const valSet = dataset.slice(0, valSize);
  const trainSet = dataset.slice(valSize);

  console.log(`Train examples: ${trainSet.length}, validation examples: ${valSet.length}`);

  const { model, history, bestEpoch } = trainMLP({
    examples: trainSet,
    valExamples: valSet,
    inputSize: vectorizer.size,
    hiddenSize: 28,
    outputSize: DAY_CONTEXTS.length,
    epochs: 450,
    learningRate: 0.07,
    l2: 2e-4,
    patience: 35,
  });

  let correct = 0;
  const perClass = Object.fromEntries(DAY_CONTEXTS.map((label) => [label, { correct: 0, total: 0 }]));
  for (const ex of valSet) {
    const probs = model.predict(ex.x);
    const predictedIndex = probs.indexOf(Math.max(...probs));
    perClass[ex.context].total++;
    if (predictedIndex === ex.yIndex) {
      correct++;
      perClass[ex.context].correct++;
    }
  }

  const accuracy = valSet.length ? correct / valSet.length : 0;
  console.log(`Stopped at epoch ${history.length} (best validation snapshot from epoch ${bestEpoch + 1})`);
  console.log(`Validation accuracy: ${(accuracy * 100).toFixed(1)}% (${correct}/${valSet.length})`);
  console.log("(random-chance baseline for 8 classes is 12.5%)\n");

  console.log("Per-context breakdown (validation set):");
  for (const label of DAY_CONTEXTS) {
    const { correct, total } = perClass[label];
    if (total === 0) {
      console.log(`  ${label.padEnd(18)} no validation examples this run`);
    } else {
      console.log(`  ${label.padEnd(18)} ${correct}/${total}`);
    }
  }

  const artifact = {
    trainedAt: new Date().toISOString(),
    labels: DAY_CONTEXTS,
    validationAccuracy: accuracy,
    vectorizer: vectorizer.toJSON(),
    model: model.toJSON(),
  };

  const outDir = join(__dirname, "model");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "dayWeights.json");
  writeFileSync(outPath, JSON.stringify(artifact));
  console.log(`\nSaved trained day-context model to ${outPath}`);
}

main();
