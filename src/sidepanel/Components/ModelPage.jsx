import { ArrowLeft, X, Download, Upload, FileDown, BugPlay, SportShoe } from "lucide-react";
import { Pages } from "../_enums/PagesEnum";
import { useClassifierStore } from "../stores/useClassifierStore";
import { useGeneralStore } from "../stores/useGeneralStore";
import "./ModelPage.css"
import { useEffect, useRef, useState } from "react";
import { useActiveTab } from "../hooks/useActiveTab";
import { MessageAction } from "../../_enum/MessageActionEnum";


import { LogRegOvrClassifier } from "../../_model/LogRegOvrClassifier";

const ModelInnerPage = Object.freeze({
    TEST: "test",
    TRAIN: "train"
});



async function getCurrentPageContent(tabId, updateContent) {
    if (!tabId) {
        return;
    }


    try {
        const response = await chrome.tabs.sendMessage(tabId, {
            action: MessageAction.SEND_PAGE_CONTENT,
        });

        console.log("response from current tab when asking for content = ", response);
        updateContent(response);

    } catch (error) {
        console.error("Could not send message. Is the content script injected?", error);
    }
}


export function ModelPage() {

    const selectedModel = useClassifierStore(state => state.selectedModel);

    const model = useClassifierStore(state => state.models[selectedModel]);
    if (!model) return null;

    const removeModelItem = useClassifierStore(state => state.removeModelItem);
    const addModelItem = useClassifierStore(state => state.addModelItem);
    const addModelLabel = useClassifierStore(state => state.addModelLabel);
    const removeModelLabel = useClassifierStore(state => state.removeModelLabel);

    const [name, setName] = useState("");

    const labels = model.labels;
    const dataset = model.dataset;

    const fileInputRef = useRef(null);

    let labelCountMap = {}
    const tab = useActiveTab();



    labels.forEach(label => {
        labelCountMap[label] = 0
    });


    Object.values(dataset).forEach(item => {
        item.labels.forEach(label => {
            labelCountMap[label] += 1
        });
    });



    const currentPageUrl = tab?.url;
    const isNativePage = tab?.url?.startsWith("chrome://") || tab?.url?.startsWith("chrome-extension://");

    const count = Object.keys(model.dataset).length;
    const [currentPageLabels, setCurrentPageLabels] = useState([]);
    const [currentPageContent, setCurrentPageContent] = useState({ content: "", url: "" });
    const [page, setPage] = useState(ModelInnerPage.TRAIN);

    const [classifier, setClassifier] = useState(null);
    const [classifications, setClassifications] = useState({});
    const [classified, setClassified] = useState("");


    useEffect(() => {
        if (isNativePage) {
            return;
        }

    }, [currentPageUrl]);


    useEffect(() => {
        if (!tab?.id || isNativePage || tab.status !== "complete") return;

        if (currentPageLabels.length === 0) {
            removeModelItem(selectedModel, currentPageUrl);
        }
        else {
            if (currentPageContent.url != currentPageUrl) {
                getCurrentPageContent(tab.id, setCurrentPageContent);
                return
            }

            addModelItem(selectedModel, currentPageUrl, {
                content: currentPageContent.content,
                labels: currentPageLabels
            });
        }

    }, [currentPageLabels, currentPageContent, tab]);


    useEffect(() => {
        if (page === ModelInnerPage.TRAIN) {
            return;
        }

        const classifier = new LogRegOvrClassifier();

        Object.values(dataset).forEach((item) => {
            item.labels.forEach(label => {
                classifier.addDocument(item.content, label);
            });
        });

        classifier.train()
        setClassifier(classifier);

    }, [dataset, page]); // ? Dataset prolly can't change but whatever

    useEffect(() => {
        if (page === ModelInnerPage.TRAIN) {
            return;
        }

        if (classifier === null) {
            return;
        }

        if (!tab?.id || isNativePage || tab.status !== "complete") return;

        if (currentPageContent.url !== currentPageUrl) {
            getCurrentPageContent(tab.id, setCurrentPageContent);
            return;
        }

        setClassified(classifier.classify(currentPageContent.content));
        const classifications = classifier.getClassifications(currentPageContent.content);

        setClassifications(classifications)

    }, [currentPageUrl, currentPageContent, page, classifier, tab]);


    useEffect(() => {
        if (isNativePage || !currentPageUrl) {
            setCurrentPageLabels([]);
            return;
        }

        const existingData = model.dataset[currentPageUrl];

        if (existingData && existingData.labels) {
            setCurrentPageLabels(existingData.labels);
        } else {
            setCurrentPageLabels([]);
        }

    }, [currentPageUrl, isNativePage]);


    const handleDatasetDownload = () => {
        const exportData = {
            dataset: dataset,
            labels: labels
        };
        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedModel}-dataset.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleModelDownload = () => {
        if (!classifier) {
            alert("Model not trained yet! Please switch to Test mode to train the model before downloading.");
            return;
        }

        const exportData = classifier.toJSON();
        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedModel}-model.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };




    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsedData = JSON.parse(e.target.result);

                if (parsedData && parsedData.dataset && typeof parsedData.dataset === 'object') {
                    const incomingDataset = parsedData.dataset;
                    const incomingGlobalLabels = Array.isArray(parsedData.labels) ? parsedData.labels : [];

                    useClassifierStore.setState((state) => {
                        const currentModel = state.models[selectedModel];

                        incomingGlobalLabels.forEach(label => {
                            if (!currentModel.labels.includes(label)) {
                                currentModel.labels.push(label);
                            }
                        });


                        Object.entries(incomingDataset).forEach(([url, item]) => {
                            const existingLabels = currentModel.dataset[url]?.labels || [];
                            const incomingLabels = item.labels || [];
                            const mergedLabels = Array.from(new Set([...existingLabels, ...incomingLabels]));

                            currentModel.dataset[url] = {
                                content: item.content || currentModel.dataset[url]?.content || "",
                                labels: mergedLabels
                            };


                            // ? This is not needed if the uploader of the dataset is not having any fishy labels
                            // ? inside the dataset json which are not present in their global dataset array but whatever
                            mergedLabels.forEach(label => {
                                if (!currentModel.labels.includes(label)) {
                                    currentModel.labels.push(label);
                                }
                            });
                        });
                    });
                } else {
                    alert("Invalid file format. Expected JSON with a 'dataset' object.");
                }
            } catch (error) {
                console.error("Failed to parse JSON", error);
                alert("Failed to parse the uploaded file.");
            }
        };
        reader.readAsText(file);
        event.target.value = null;
    };



    return (
        <>
            <div className="page-container model-page">
                <div className="title">
                    {selectedModel + " (" + count + ")"}
                </div>

                <div className="back-button" onClick={() => {
                    useGeneralStore.setState({ page: Pages.MODELS });
                }}>
                    <ArrowLeft />
                </div>

                <div className="download-button" title="Download dataset with labels" onClick={handleDatasetDownload}>
                    <Download />
                </div>

                <div className="model-download-button" title="Download model" onClick={handleModelDownload}>
                    <FileDown />
                </div>

                <div className="upload-button" title="Upload dataset with labels" onClick={() => {
                    fileInputRef.current?.click();
                }}>
                    <input
                        style={{ display: "none" }}
                        type="file"
                        accept=".json,application/json"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                    />
                    <Upload />
                </div>

                <div className="page-button" title={page === ModelInnerPage.TRAIN ? "In Training Mode" : "In Testing Mode"} onClick={() => {
                    if (page === ModelInnerPage.TRAIN) {
                        setPage(ModelInnerPage.TEST);
                    }
                    else {
                        setPage(ModelInnerPage.TRAIN);
                    }
                }}>
                    {
                        page === ModelInnerPage.TRAIN ? <BugPlay /> : <SportShoe />
                    }
                </div>

                {
                    page === ModelInnerPage.TRAIN ? <>
                        <div className="list">
                            {model.labels.map((label, index) => {
                                return (
                                    <div className="item" key={index}>
                                        <button disabled={isNativePage} className={`name ${currentPageLabels.includes(label) ? "active" : ""}`} onClick={(e) => {
                                            const ind = currentPageLabels.indexOf(label);
                                            if (ind !== -1) {
                                                setCurrentPageLabels(currentPageLabels.filter(l => l !== label));
                                            }
                                            else {
                                                setCurrentPageLabels([...currentPageLabels, label]);
                                            }
                                        }}>
                                            {label}
                                        </button>
                                        <div className="label-count">
                                            {labelCountMap[label]}
                                        </div>
                                        <div className="delete-button" onDoubleClick={() => {
                                            setCurrentPageLabels(prevLabels => prevLabels.filter(l => l !== label));
                                            removeModelLabel(selectedModel, label);
                                        }}>
                                            <X />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="input-panel">
                            <input
                                type="text"
                                value={name}
                                placeholder="Add label..."
                                onChange={(e) => {
                                    setName(e.target.value);
                                }} />
                            <button
                                onClick={(e) => {
                                    const label = name.trim()
                                    if (!label) {
                                        return;
                                    }

                                    setName("");
                                    addModelLabel(selectedModel, label);
                                }}>
                                Add
                            </button>
                        </div>
                    </> : <>
                        <div className="list">
                            {model.labels.map((label, index) => {
                                return (
                                    <div className="item" key={index}>
                                        <button disabled={isNativePage} className={`name`} >
                                            {label}
                                        </button>
                                        <div className="label-percent">
                                            {classifications[label]}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                }

            </div>
        </>
    )
}