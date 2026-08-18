// A small TF-IDF text vectorizer, written from scratch (no NLP library).
// Turns free text into a fixed-length numeric vector the neural net can
// consume: term frequency in the text, weighted by inverse document
// frequency learned from the training corpus, then L2-normalized.

// A short, standard English stopword list. "not"/"no"/"nor" are kept OUT
// of this list on purpose — a bag-of-words model has no other way to
// capture negation, so those words are left in as (weak) signal.
const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "is", "are", "was", "were", "be",
  "been", "being", "to", "of", "in", "on", "for", "with", "at", "by",
  "from", "as", "that", "this", "these", "those", "it", "its", "i", "you",
  "he", "she", "we", "they", "my", "your", "his", "her", "our", "their",
  "me", "him", "them", "us", "am", "do", "does", "did", "doing", "have",
  "has", "had", "having", "will", "would", "shall", "should", "can",
  "could", "may", "might", "must", "so", "if", "then", "than", "too",
  "very", "just", "about", "into", "over", "after", "before", "between",
  "through", "during", "up", "down", "out", "off", "again", "further",
  "here", "there", "when", "where", "why", "how", "all", "any", "both",
  "each", "few", "more", "most", "other", "some", "such", "only", "own",
  "same", "s", "t", "get", "got", "im",
]);

export function tokenize(text) {
  if (!text || typeof text !== "string") return [];
  return text
    .toLowerCase()
    .replace(/[^a-z' ]/g, " ")
    .split(/\s+/)
    .map((tok) => tok.replace(/^'+|'+$/g, ""))
    .filter((tok) => tok.length > 1 && !STOPWORDS.has(tok));
}

export class TfidfVectorizer {
  constructor({ vocabulary, idf } = {}) {
    // vocabulary: word -> index. idf: array aligned to vocabulary indices.
    this.vocabulary = vocabulary || null;
    this.idf = idf || null;
  }

  /** Learns the vocabulary + idf weights from an array of raw text strings. */
  fit(texts, { minDocFreq = 2 } = {}) {
    const docFreq = new Map();
    const tokenizedDocs = texts.map(tokenize);

    for (const tokens of tokenizedDocs) {
      const seen = new Set(tokens);
      for (const tok of seen) {
        docFreq.set(tok, (docFreq.get(tok) || 0) + 1);
      }
    }

    const vocabWords = [...docFreq.entries()]
      .filter(([, freq]) => freq >= minDocFreq)
      .map(([word]) => word)
      .sort();

    this.vocabulary = Object.fromEntries(vocabWords.map((w, i) => [w, i]));

    const n = texts.length;
    this.idf = vocabWords.map((w) => {
      const df = docFreq.get(w) || 0;
      // smoothed idf, always positive: ln((1+n)/(1+df)) + 1
      return Math.log((1 + n) / (1 + df)) + 1;
    });

    return this;
  }

  get size() {
    return this.idf ? this.idf.length : 0;
  }

  /** Converts a single text string into an L2-normalized TF-IDF vector. */
  transform(text) {
    if (!this.vocabulary || !this.idf) {
      throw new Error("TfidfVectorizer must be fit before calling transform()");
    }
    const tokens = tokenize(text);
    const vec = new Array(this.size).fill(0);
    if (tokens.length === 0) return vec;

    const counts = new Map();
    for (const tok of tokens) counts.set(tok, (counts.get(tok) || 0) + 1);

    for (const [tok, count] of counts) {
      const idx = this.vocabulary[tok];
      if (idx === undefined) continue; // out-of-vocabulary word, skip
      const tf = count / tokens.length;
      vec[idx] = tf * this.idf[idx];
    }

    let norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
    if (norm > 0) {
      for (let i = 0; i < vec.length; i++) vec[i] /= norm;
    }
    return vec;
  }

  toJSON() {
    return { vocabulary: this.vocabulary, idf: this.idf };
  }

  static fromJSON(json) {
    return new TfidfVectorizer({ vocabulary: json.vocabulary, idf: json.idf });
  }
}
