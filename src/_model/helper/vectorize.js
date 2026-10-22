import { tokenize } from './tokenizer.js';



export function vectorize(text, vocabulary, idf) {
  const tokens = tokenize(text);
  const vector = new Array(vocabulary.length).fill(0);

  if (tokens.length === 0) return vector;

  // Build a lookup: vocabulary word -> its index position.
  // (In practice you'd build this once and reuse it, not on every call -
  // see the note below.)
  const vocabIndex = new Map(vocabulary.map((word, i) => [word, i]));

  // Count how many times each token appears in this document.
  const rawCounts = new Map();
  for (const tok of tokens) {
    if (vocabIndex.has(tok)) {
      rawCounts.set(tok, (rawCounts.get(tok) || 0) + 1);
    }
  }

  // Tokens not in the vocabulary are silently ignored - this is expected
  // and important: it's how new/unseen words at prediction time get handled.

  for (const [tok, count] of rawCounts) {
    const idx = vocabIndex.get(tok);
    const tf = count / tokens.length;   // term frequency, normalized by doc length
    vector[idx] = tf * idf[idx];        // tf * idf = final weight for this word
  }

  return vector;
}



export function vectorizeAll(documents, vocabulary, idf) {
  const vocabIndex = new Map(vocabulary.map((word, i) => [word, i]));

  return documents.map((text) => {
    const tokens = tokenize(text);
    const vector = new Array(vocabulary.length).fill(0);
    if (tokens.length === 0) return vector;

    const rawCounts = new Map();
    for (const tok of tokens) {
      if (vocabIndex.has(tok)) {
        rawCounts.set(tok, (rawCounts.get(tok) || 0) + 1);
      }
    }

    for (const [tok, count] of rawCounts) {
      const idx = vocabIndex.get(tok);
      const tf = count / tokens.length;
      vector[idx] = tf * idf[idx];
    }

    return vector;
  });
}