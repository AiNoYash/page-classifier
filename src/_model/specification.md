# Make a model class

## The class should have following methods 

### {Please look in LogRegOvrClassifier.js it is having perfect implementation having all of these}

### addDocument(document, label)
### train()
### classify(document) --> classified label
### getClassifications --> { label: score } {include score for each label if not possible then set others to 0}
### load(config) {config is supposed to be a json object that can be used to load in the whole trained model}
### toJSON() {returns a json which can be passed to some other instance's load to make it work properly}