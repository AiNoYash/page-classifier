import { stem } from "porter2";
import { noisewords, stopwords } from "./stopwords";


export function tokenize(text) {
    if (!text) return [];

    const rawWords = text
        .toLowerCase()
        .replace(/['’]/g, '')             // "don't" -> "dont"
        .replace(/[^a-z0-9\s]/g, ' ')     // strip anything that's not a letter/number/whitespace
        .split(/\s+/)
        .filter(Boolean)
        .filter((tok) => tok.length > 2 && !/^\d+$/.test(tok));    // drop pure numbers and very short tokens


    const filteredWords = rawWords.filter(x => !stopwords.has(x))
    const stemmed = filteredWords.map((tok) => stem(tok));

    return stemmed.filter((tok) => !noisewords.has(tok));
}