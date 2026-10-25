import { buildVocabulary } from "./helper/tfidf.js";
import { vectorize, vectorizeAll } from "./helper/vectorize.js";


/**
 * Cosine similarity between two same-length numeric arrays.
 * Returns a value in [0, 1] where 1 = identical direction.
 */
function cosineSimilarity(a, b) {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot   += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
}


export class KNNClassifier {

    // hyper-parameters
    k;
    maxFeatures;
    minDf;
    maxDf;

    // built during train()
    vocabulary;
    idf;
    uniqueLabels;

    // raw training data (kept so toJSON round-trips cleanly)
    documents;
    labels;

    // pre-computed TF-IDF vectors for each training document
    trainingVectors;


    constructor({ k = 5, maxFeatures = 5000, minDf = 2, maxDf = 0.9 } = {}) {
        this.k               = k;
        this.maxFeatures     = maxFeatures;
        this.minDf           = minDf;
        this.maxDf           = maxDf;

        this.documents       = [];
        this.labels          = [];
        this.vocabulary      = [];
        this.idf             = [];
        this.trainingVectors = [];
        this.uniqueLabels    = [];
    }


    // ------------------------------------------------------------------ //
    //  Public API                                                          //
    // ------------------------------------------------------------------ //

    addDocument(document, label) {
        this.documents.push(document);
        this.labels.push(label);
    }

    /**
     * Builds TF-IDF vocabulary from the training corpus and pre-computes
     * TF-IDF vectors for every training document.
     * KNN has no real "training" step — inference does the work — but we
     * vectorise here so prediction stays fast.
     */
    train() {
        if (this.documents.length === 0) return;

        const { vocabulary, idf } = buildVocabulary(this.documents, {
            minDf:       this.minDf,
            maxDf:       this.maxDf,
            maxFeatures: this.maxFeatures,
        });

        this.vocabulary      = vocabulary;
        this.idf             = idf;
        this.trainingVectors = vectorizeAll(this.documents, this.vocabulary, this.idf);
        this.uniqueLabels    = [...new Set(this.labels)];
    }


    /**
     * Returns the single most-likely label for a given document string.
     */
    classify(document) {
        const scores = this.getClassifications(document);
        if (!scores) return null;

        return Object.entries(scores).reduce(
            (best, [label, score]) => (score > best[1] ? [label, score] : best),
            [null, -Infinity]
        )[0];
    }


    /**
     * Returns { label: score } for every known label.
     *
     * Score = similarity-weighted vote share among the k nearest neighbours.
     * Scores are normalised to sum to 1, so they can be treated as
     * pseudo-probabilities.
     */
    getClassifications(document) {
        if (this.trainingVectors.length === 0) return null;

        const queryVec = vectorize(document, this.vocabulary, this.idf);

        // Rank training documents by cosine similarity to the query
        const ranked = this.trainingVectors
            .map((vec, idx) => ({
                sim:   cosineSimilarity(queryVec, vec),
                label: this.labels[idx],
            }))
            .sort((a, b) => b.sim - a.sim);

        const kNearest = ranked.slice(0, this.k);

        // Accumulate similarity-weighted votes per label
        const votes = {};
        for (const label of this.uniqueLabels) votes[label] = 0;

        let totalWeight = 0;
        for (const { sim, label } of kNearest) {
            // clamp to >= 0 (cosine can be tiny-negative due to float precision)
            const w = Math.max(0, sim);
            votes[label] += w;
            totalWeight  += w;
        }

        // Normalise; fall back to uniform distribution if all similarities are 0
        const classifications = {};
        const uniform = 1 / this.uniqueLabels.length;
        for (const label of this.uniqueLabels) {
            classifications[label] =
                totalWeight > 0 ? votes[label] / totalWeight : uniform;
        }

        return classifications;
    }


    // ------------------------------------------------------------------ //
    //  Serialisation                                                       //
    // ------------------------------------------------------------------ //

    /**
     * Recreates a KNNClassifier from a plain JSON object produced by toJSON().
     * Usage:  const clf = KNNClassifier.load(savedConfig);
     */
    static load(config) {
        if (config.name !== "KNNClassifier") {
            throw new Error("invalid model: " + config.name);
        }

        const clf = new KNNClassifier({
            k:           config.k,
            maxFeatures: config.maxFeatures,
            minDf:       config.minDf,
            maxDf:       config.maxDf,
        });

        clf.vocabulary      = config.vocabulary;
        clf.idf             = config.idf;
        clf.uniqueLabels    = config.uniqueLabels;
        clf.documents       = config.documents;
        clf.labels          = config.labels;
        clf.trainingVectors = config.trainingVectors;

        return clf;
    }


    toJSON() {
        return {
            name:            "KNNClassifier",
            k:               this.k,
            maxFeatures:     this.maxFeatures,
            minDf:           this.minDf,
            maxDf:           this.maxDf,
            vocabulary:      this.vocabulary,
            idf:             this.idf,
            uniqueLabels:    this.uniqueLabels,
            documents:       this.documents,
            labels:          this.labels,
            trainingVectors: this.trainingVectors,
        };
    }
}
