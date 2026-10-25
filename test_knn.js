/**
 * test_knn.js  –  manual smoke-test for KNNClassifier
 * Run from project root:  node test_knn.js
 */

import { KNNClassifier } from "./src/_model/KNNClassifier.js";

// ─── helpers ──────────────────────────────────────────────────────────────────

let passed = 0, failed = 0;

function assert(label, condition, extra = "") {
    if (condition) {
        console.log(`  ✅  ${label}`);
        passed++;
    } else {
        console.error(`  ❌  ${label}${extra ? " — " + extra : ""}`);
        failed++;
    }
}

function section(title) {
    console.log(`\n── ${title} ${"─".repeat(55 - title.length)}`);
}

// ─── training data ────────────────────────────────────────────────────────────
// Three clearly-separable topics so we can eyeball correctness easily.

const trainingDocs = [
    // SPORTS
    { text: "Football match between two rival teams ended in a thrilling draw after extra time with goals from both sides", label: "sports" },
    { text: "The tennis player won the grand slam championship after an intense five-set match in the final round", label: "sports" },
    { text: "Cricket world cup final saw the home team win with a last-over six hit by the star batsman", label: "sports" },
    { text: "Basketball player scored record points in the championship game leading the team to victory", label: "sports" },
    { text: "Olympic athletics gold medal won in the sprint race breaking the world record", label: "sports" },

    // TECHNOLOGY
    { text: "Machine learning models are trained on large datasets to identify patterns and make predictions accurately", label: "tech" },
    { text: "The new smartphone features an advanced processor with artificial intelligence capabilities built into the chip", label: "tech" },
    { text: "Open source software development requires collaboration between developers worldwide sharing code on GitHub", label: "tech" },
    { text: "Cloud computing platforms provide scalable infrastructure for web applications and database storage solutions", label: "tech" },
    { text: "Cybersecurity researchers discovered a critical vulnerability affecting millions of internet connected devices", label: "tech" },

    // FOOD
    { text: "The restaurant serves authentic Italian pasta dishes prepared with fresh tomatoes basil and olive oil", label: "food" },
    { text: "Baking a perfect chocolate cake requires precise measurements of flour butter sugar eggs and cocoa powder", label: "food" },
    { text: "Street food vendors in the city offer delicious spicy tacos wraps and grilled chicken skewers", label: "food" },
    { text: "Vegetarian recipes using lentils chickpeas and seasonal vegetables make nutritious and satisfying meals", label: "food" },
    { text: "Coffee brewing methods like espresso pour-over and french press each produce a distinct flavour profile", label: "food" },
];

// ─── Test 1: basic train + classify ──────────────────────────────────────────
section("Test 1: Basic train + classify");

const clf = new KNNClassifier({ k: 3, minDf: 1 });
for (const { text, label } of trainingDocs) clf.addDocument(text, label);
clf.train();

assert("vocabulary built",      clf.vocabulary.length > 0,           `vocab size = ${clf.vocabulary.length}`);
assert("idf array matches vocab", clf.idf.length === clf.vocabulary.length);
assert("trainingVectors count", clf.trainingVectors.length === trainingDocs.length);
assert("uniqueLabels = 3",      clf.uniqueLabels.length === 3);

// ─── Test 2: classify unseen docs ────────────────────────────────────────────
section("Test 2: classify() on unseen documents");

const tests = [
    { text: "The striker scored a hat-trick in the football league cup semi-final", expected: "sports" },
    { text: "Neural networks and deep learning are revolutionising computer vision tasks", expected: "tech" },
    { text: "The chef prepared a delicious soup using fresh herbs vegetables and homemade broth", expected: "food" },
];

for (const { text, expected } of tests) {
    const result = clf.classify(text);
    assert(`classify → "${expected}"  (got "${result}")`, result === expected);
}

// ─── Test 3: getClassifications scores ───────────────────────────────────────
section("Test 3: getClassifications() scores");

const scores = clf.getClassifications("Python programming language for data science machine learning neural networks");
assert("returns an object",           scores !== null && typeof scores === "object");
assert("has all 3 labels",            Object.keys(scores).length === 3);
assert("scores sum to ≈ 1",           Math.abs(Object.values(scores).reduce((a, b) => a + b, 0) - 1) < 1e-9,
                                      `sum = ${Object.values(scores).reduce((a, b) => a + b, 0)}`);
assert("'tech' is top score",         scores["tech"] === Math.max(...Object.values(scores)));
console.log("    Scores:", JSON.stringify(scores, null, 2).replace(/\n/g, "\n    "));

// ─── Test 4: toJSON / load round-trip ────────────────────────────────────────
section("Test 4: toJSON() + load() round-trip");

const json    = clf.toJSON();
const loaded  = KNNClassifier.load(json);

assert("name field is 'KNNClassifier'",    json.name === "KNNClassifier");
assert("loaded vocab matches original",    loaded.vocabulary.length === clf.vocabulary.length);
assert("loaded trainingVectors match",     loaded.trainingVectors.length === clf.trainingVectors.length);

const resultOriginal = clf.classify("scored a goal in the football match");
const resultLoaded   = loaded.classify("scored a goal in the football match");
assert("classify same result after load",  resultOriginal === resultLoaded,
       `original="${resultOriginal}" loaded="${resultLoaded}"`);

// ─── Test 5: load() rejects wrong model name ─────────────────────────────────
section("Test 5: load() rejects wrong model name");

let threw = false;
try { KNNClassifier.load({ name: "SomethingElse" }); }
catch (e) { threw = true; }
assert("throws on wrong model name", threw);

// ─── Test 6: train() on empty data is safe ───────────────────────────────────
section("Test 6: edge cases");

const empty = new KNNClassifier();
empty.train();   // should not throw
assert("train() on empty data is safe",   empty.trainingVectors.length === 0);

const noModel = new KNNClassifier();
assert("classify() before train returns null", noModel.classify("anything") === null);
assert("getClassifications() before train returns null", noModel.getClassifications("anything") === null);

// ─── Test 7: k larger than dataset ───────────────────────────────────────────
section("Test 7: k > number of training docs");

const bigK = new KNNClassifier({ k: 999, minDf: 1 });
for (const { text, label } of trainingDocs) bigK.addDocument(text, label);
bigK.train();
const bigKResult = bigK.classify("the player kicked the ball into the net to score a goal");
assert("classify works when k > dataset size", typeof bigKResult === "string");

// ─── Summary ─────────────────────────────────────────────────────────────────
console.log(`\n${"═".repeat(60)}`);
console.log(`  Results: ${passed} passed, ${failed} failed`);
console.log(`${"═".repeat(60)}\n`);
process.exit(failed > 0 ? 1 : 0);
