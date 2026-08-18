# The mood classifier

This is a small text classifier, built and trained from scratch — no pretrained weights, no external API, no ML framework. Everything in this folder is plain JavaScript.

## What it does

Given the free-text note from a check-in (e.g. *"three deadlines this week and no idea how to manage it all"*), it predicts which of the 10 mood categories the text sounds like, with a confidence score per category.

**It's a supplementary signal, not the source of truth.** The student's own selected mood always drives the suggestion first. The classifier is only used to gently escalate support when the note text sounds heavier than the mood picked — never the other way around, and never as a diagnosis. See `escalation logic` in `backend/utils/suggestionEngine.js` for exactly how.

## Architecture

1. **Tokenizer** (`textVectorizer.js`) — lowercases, strips punctuation, removes a short stopword list, keeps `not`/`no`/`nor` (they carry signal a plain bag-of-words model would otherwise lose).
2. **TF-IDF vectorizer** — turns each note into a fixed-length numeric vector: term frequency weighted by inverse document frequency (learned from the training set), then L2-normalized. Vocabulary is capped to words appearing in ≥2 training examples.
3. **Neural network** (`neuralNet.js`) — one hidden layer (32 units, ReLU), softmax output over the 10 mood classes. Forward pass, backpropagation, and the SGD training loop are all hand-written — no TensorFlow, no PyTorch, nothing installed.
4. **Training** (`trainModel.js`) — trains on an 85/15 train/validation split with early stopping: after every epoch it checks validation accuracy and keeps the best-performing snapshot, so the model doesn't just memorize the (small) training set. Saves the trained weights + vocabulary to `model/weights.json`.
5. **Inference** (`moodClassifier.js`) — loads that trained artifact once and exposes `classifyText(text)`.

## The dataset

`data/trainingData.js` — 220 hand-written, short journal-note-style sentences (22 per mood), written to sound like what a student might actually type: exam stress, deadlines, hostel life, placement anxiety, and so on. It's a genuinely small dataset by ML standards, and that's an honest tradeoff of building this from scratch instead of using a pretrained model — see below.

## Honest accuracy numbers

Validation accuracy typically lands around **55–65%** on this 10-class problem (random-chance baseline is 10%), varying a bit run to run since both the train/validation split and the network's initial weights are randomized. That's a real, meaningfully-above-chance signal — but nowhere near production-grade sentiment analysis. Two things keep this from being a problem in practice:

- The suggestion engine only trusts a prediction above a confidence threshold (0.35) before acting on it.
- Even then, it only ever *adds* support (escalates toward calmer tracks and a stronger grounding tip) — it never removes support or contradicts what the student picked.

## Retraining it

```bash
cd backend
npm run train-model
```

This re-runs the whole pipeline and overwrites `model/weights.json`. Useful if you extend `data/trainingData.js` with more examples (more data is the single biggest lever for accuracy here — 220 examples is a small dataset for a 10-way text classifier).

## Extending it

- **More training data** is the highest-leverage improvement. Doubling or tripling the examples per class would likely raise accuracy meaningfully.
- **Bigram features** (pairs of adjacent words, not just single words) would help the model catch phrases like "not okay" that single-word bag-of-words can't distinguish from "okay."
- **A held-out test set** separate from the validation set used for early stopping would give a less optimistic accuracy estimate (right now, validation accuracy is used both to pick the best epoch *and* to report the final number, which is a mild form of leakage worth knowing about).
