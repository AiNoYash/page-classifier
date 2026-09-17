import Matrix from "ml-matrix";
import { buildVocabulary } from "./helper/tfidf";
import { vectorize, vectorizeAll } from "./helper/vector";
import LogisticRegression from "ml-logistic-regression";


export class LogisticRegressionClassifier {
    model;

    maxFeatures;
    maxDf;
    minDf;
    numSteps;
    learningRate;

    vocabulary;
    idf;

    uniqueLabels;

    documents;
    labels;


    constructor({ maxFeatures = 5000, minDf = 2, maxDf = 0.9, numSteps = 100000, learningRate = 5e-4 } = {}) {
        this.maxFeatures = maxFeatures;
        this.minDf = minDf;
        this.maxDf = maxDf;
        this.numSteps = numSteps;
        this.learningRate = learningRate;


        this.documents = [];
        this.labels = [];
        this.vocabulary = [];
        this.idf = [];
    }

    addDocument(document, label) {
        this.documents.push(document);
        this.labels.push(label);
    }

    train() {
        const { vocabulary, idf } = buildVocabulary(this.documents, {
            minDf: this.minDf,
            maxDf: this.maxDf,
            maxFeatures: this.maxFeatures
        });

        this.vocabulary = vocabulary;
        this.idf = idf;

        const X = vectorizeAll(this.documents, this.vocabulary, this.idf);
        this.uniqueLabels = [... new Set(this.labels)];

        const labelToIndex = new Map(this.uniqueLabels.map((label, i) => [label, i]));

        const y = this.labels.map((label) => labelToIndex.get(label));

        const XMatrix = new Matrix(X);
        const yMatrix = Matrix.columnVector(y);

        const model = new LogisticRegression({ numSteps: this.numSteps, learningRate: this.learningRate });
        model.train(XMatrix, yMatrix);

        this.model = model;
    }

    // ? return label
    classify(document) {
        const vector = vectorize(document, this.vocabulary, this.idf);
        const XMatrix = new Matrix([vector]);
        const [predictedIndex] = this.model.predict(XMatrix);

        return this.uniqueLabels[predictedIndex];
    }

    getClassifications(document) {
        const vector = vectorize(document, this.vocabulary, this.idf);
        const XMatrix = new Matrix([vector]);
        const scoresMatrix = this.model.testScores(XMatrix);  // ? The underlying ml model yields p then 1-p is the prob for target

        const classifications = {};

        for (let i = 0; i < this.uniqueLabels.length; i++) {
            classifications[this.uniqueLabels[i]] = 1 - scoresMatrix[i][0]; 
        }

        return classifications;
    }


    static load(config) {
        if (config.name !== "LogisticRegressionClassifier") {
            throw new Error(`invalid model: ${config.name}`);
        }

        const newClassifier = new LogisticRegressionClassifier(config);
        newClassifier.uniqueLabels = config.uniqueLabels;
        newClassifier.vocabulary = config.vocabulary;
        newClassifier.idf = config.idf;
        newClassifier.model = LogisticRegression.load(JSON.parse(config.model));

        return newClassifier;
    }


    toJSON() {
        return {
            name: 'LogisticRegressionClassifier',
            numSteps: this.numSteps,
            learningRate: this.learningRate,
            maxFeatures: this.maxFeatures,
            minDf: this.minDf,
            maxDf: this.maxDf,

            model: JSON.stringify(this.model),
            vocabulary: this.vocabulary,
            idf: this.idf,
            uniqueLabels: this.uniqueLabels,
        };
    }
}