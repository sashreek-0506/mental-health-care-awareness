// A small multi-layer perceptron, implemented from scratch with plain
// arrays — no ML framework. One hidden layer (ReLU), softmax output,
// trained with per-example stochastic gradient descent and cross-entropy
// loss. Sizes here (a few hundred inputs, a few dozen hidden units, ten
// outputs) are small enough that naive loops are plenty fast in Node.

function randInit(fanIn, fanOut) {
  // Small uniform init scaled by fan-in, roughly in the spirit of Xavier
  // initialization — keeps early activations from exploding or vanishing.
  const scale = Math.sqrt(2 / fanIn);
  const w = [];
  for (let i = 0; i < fanOut; i++) {
    const row = [];
    for (let j = 0; j < fanIn; j++) {
      row.push((Math.random() * 2 - 1) * scale);
    }
    w.push(row);
  }
  return w;
}

function zeros(n) {
  return new Array(n).fill(0);
}

function relu(x) {
  return x > 0 ? x : 0;
}

function reluDerivative(x) {
  return x > 0 ? 1 : 0;
}

function softmax(logits) {
  const max = Math.max(...logits);
  const exps = logits.map((v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => v / sum);
}

export class MLPClassifier {
  constructor({ inputSize, hiddenSize, outputSize, W1, b1, W2, b2 }) {
    this.inputSize = inputSize;
    this.hiddenSize = hiddenSize;
    this.outputSize = outputSize;

    this.W1 = W1 || randInit(inputSize, hiddenSize); // [hidden][input]
    this.b1 = b1 || zeros(hiddenSize);
    this.W2 = W2 || randInit(hiddenSize, outputSize); // [output][hidden]
    this.b2 = b2 || zeros(outputSize);
  }

  forward(x) {
    const z1 = this.W1.map((row, i) => row.reduce((sum, w, j) => sum + w * x[j], this.b1[i]));
    const a1 = z1.map(relu);
    const z2 = this.W2.map((row, i) => row.reduce((sum, w, j) => sum + w * a1[j], this.b2[i]));
    const probs = softmax(z2);
    return { x, z1, a1, z2, probs };
  }

  predict(x) {
    return this.forward(x).probs;
  }

  /**
   * One step of backprop + SGD update for a single labeled example.
   * Returns the cross-entropy loss for this example (useful for logging).
   */
  trainStep(x, trueIndex, learningRate, l2 = 1e-4) {
    const { z1, a1, probs } = this.forward(x);

    // dL/dz2 for softmax + cross-entropy simplifies to (probs - oneHot)
    const dz2 = probs.map((p, i) => p - (i === trueIndex ? 1 : 0));

    // Gradients for W2/b2
    const dW2 = dz2.map((d, i) => a1.map((a) => d * a));
    const db2 = dz2;

    // Backprop into hidden layer
    const da1 = new Array(this.hiddenSize).fill(0);
    for (let j = 0; j < this.hiddenSize; j++) {
      let sum = 0;
      for (let i = 0; i < this.outputSize; i++) sum += this.W2[i][j] * dz2[i];
      da1[j] = sum;
    }
    const dz1 = da1.map((d, j) => d * reluDerivative(z1[j]));

    const dW1 = dz1.map((d, i) => x.map((xi) => d * xi));
    const db1 = dz1;

    // SGD update with a small L2 weight-decay term.
    for (let i = 0; i < this.outputSize; i++) {
      for (let j = 0; j < this.hiddenSize; j++) {
        this.W2[i][j] -= learningRate * (dW2[i][j] + l2 * this.W2[i][j]);
      }
      this.b2[i] -= learningRate * db2[i];
    }
    for (let i = 0; i < this.hiddenSize; i++) {
      for (let j = 0; j < this.inputSize; j++) {
        this.W1[i][j] -= learningRate * (dW1[i][j] + l2 * this.W1[i][j]);
      }
      this.b1[i] -= learningRate * db1[i];
    }

    const eps = 1e-12;
    return -Math.log(Math.max(probs[trueIndex], eps));
  }

  toJSON() {
    return {
      inputSize: this.inputSize,
      hiddenSize: this.hiddenSize,
      outputSize: this.outputSize,
      W1: this.W1,
      b1: this.b1,
      W2: this.W2,
      b2: this.b2,
    };
  }

  static fromJSON(json) {
    return new MLPClassifier(json);
  }
}

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

export function evaluateAccuracy(model, examples) {
  if (!examples || !examples.length) return null;
  let correct = 0;
  for (const ex of examples) {
    const probs = model.predict(ex.x);
    const predictedIndex = probs.indexOf(Math.max(...probs));
    if (predictedIndex === ex.yIndex) correct++;
  }
  return correct / examples.length;
}

/**
 * Trains a fresh MLPClassifier on labeled {x, yIndex} examples.
 *
 * With such a small dataset, training loss reaches near-zero well before
 * the model has learned anything generalizable — it just memorizes the
 * training examples. If valExamples is provided, this uses early stopping:
 * after every epoch it checks validation accuracy, keeps a snapshot of the
 * best-performing weights seen so far, and stops once `patience` epochs
 * pass with no improvement. The returned model is that best snapshot, not
 * necessarily the final epoch's weights.
 */
export function trainMLP({
  examples,
  valExamples,
  inputSize,
  hiddenSize,
  outputSize,
  epochs = 300,
  learningRate = 0.08,
  l2 = 1e-4,
  patience = 25,
}) {
  const model = new MLPClassifier({ inputSize, hiddenSize, outputSize });
  const history = [];
  const indices = examples.map((_, i) => i);

  let bestValAccuracy = -Infinity;
  let bestSnapshot = null;
  let bestEpoch = -1;
  let epochsSinceImprovement = 0;

  for (let epoch = 0; epoch < epochs; epoch++) {
    shuffleInPlace(indices);
    let totalLoss = 0;
    for (const idx of indices) {
      const { x, yIndex } = examples[idx];
      totalLoss += model.trainStep(x, yIndex, learningRate, l2);
    }
    history.push(totalLoss / examples.length);

    if (valExamples && valExamples.length) {
      const valAccuracy = evaluateAccuracy(model, valExamples);
      if (valAccuracy > bestValAccuracy) {
        bestValAccuracy = valAccuracy;
        bestSnapshot = JSON.parse(JSON.stringify(model.toJSON()));
        bestEpoch = epoch;
        epochsSinceImprovement = 0;
      } else {
        epochsSinceImprovement++;
      }
      if (patience && epochsSinceImprovement >= patience) break;
    }
  }

  const finalModel = bestSnapshot ? MLPClassifier.fromJSON(bestSnapshot) : model;
  return {
    model: finalModel,
    history,
    bestEpoch: bestSnapshot ? bestEpoch : history.length - 1,
    bestValAccuracy: bestSnapshot ? bestValAccuracy : null,
  };
}
