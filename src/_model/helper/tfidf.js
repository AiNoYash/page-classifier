import { tokenize } from './tokenizer.js';


// ? maxDf is in percentage while minDf is in raw number
// ? maxFeatures is vocabulary size
export function buildVocabulary(documents, { maxFeatures = 5000, minDf = 2, maxDf = 0.9 } = {}) {
  const numDocs = documents.length;

  const totalFreq = new Map();   // total occurrences across all docs
  const docFreq = new Map();     // number of distinct docs it appears in

  const tokenizedDocs = documents.map((doc) => tokenize(doc));

  for (const tokens of tokenizedDocs) {
    const seenInThisDoc = new Set();
    
    for (const tok of tokens) {
      totalFreq.set(tok, (totalFreq.get(tok) || 0) + 1);
      if (!seenInThisDoc.has(tok)) {
        docFreq.set(tok, (docFreq.get(tok) || 0) + 1);
        seenInThisDoc.add(tok);
      }
    }
  }

  const maxDfCount = maxDf * numDocs;

  // Apply minDf / maxDf thresholds, then rank survivors by total frequency
  const candidateTokens = [...totalFreq.entries()]
    .filter(([tok]) => {
      const df = docFreq.get(tok);
      return df >= minDf && df <= maxDfCount;
    })
    .sort((a, b) => b[1] - a[1])       // sort by total frequency, descending
    .slice(0, maxFeatures)
    .map(([tok]) => tok);

  const vocabulary = candidateTokens;
  const idf = vocabulary.map((tok) => {
    const df = docFreq.get(tok) || 1;
    // smoothed idf - avoids divide-by-zero / infinite weight
    return Math.log((numDocs + 1) / (df + 1)) + 1;
  });

  return { vocabulary, idf };
}