import { ArrowLeft, X, Download, Upload, FileDown, BugPlay, SportShoe } from "lucide-react";
import { Pages } from "../_enums/PagesEnum";
import { useClassifierStore } from "../stores/useClassifierStore";
import { useGeneralStore } from "../stores/useGeneralStore";
import "./ModelPage.css"
import { useEffect, useRef, useState } from "react";
import { useActiveTab } from "../hooks/useActiveTab";
import { MessageAction } from "../../_enum/MessageActionEnum";


import { LogisticRegressionClassifier } from "../../_model/classifier";

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

        console.log(response);
        updateContent(response);

    } catch (error) {
        console.error("Could not send message. Is the content script injected?", error);
    }
}


export function ModelPage() {
    const selectedModel = useClassifierStore(state => state.selectedModel);
    const model = useClassifierStore(state => state.models[selectedModel]);

    const removeModelItem = useClassifierStore(state => state.removeModelItem);
    const addModelItem = useClassifierStore(state => state.addModelItem);
    const addModelLabel = useClassifierStore(state => state.addModelLabel);
    const removeModelLabel = useClassifierStore(state => state.removeModelLabel);

    const [name, setName] = useState("");

    if (!model) return null;

    const labels = model.labels;
    const dataset = model.dataset;

    let labelCountMap = {}

    labels.forEach(label => {
        labelCountMap[label] = 0
    });

    Object.values(dataset).forEach(item => {
        item.labels.forEach(label => {
            labelCountMap[label] += 1
        });
    });


    const tab = useActiveTab();

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
        if (!tab?.id || isNativePage) return;

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

    }, [currentPageLabels, currentPageContent]);


    useEffect(() => {
        if (page === ModelInnerPage.TRAIN) {
            return;
        }


        const classifier = new LogisticRegressionClassifier();

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

        if (!tab?.id || isNativePage) return;

        if (currentPageContent.url !== currentPageUrl) {
            getCurrentPageContent(tab.id, setCurrentPageContent);
            return;
        }

        setClassified(classifier.classify(currentPageContent.content));
        const classifications = classifier.getClassifications(currentPageContent.content);

        console.log(classifications);

    }, [currentPageUrl, currentPageContent, page, classifier]);


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

    useEffect(() => {
        if (currentPageLabels.length === 0) {
            removeModelItem(selectedModel, currentPageUrl)
        } else {
            addModelItem(selectedModel, {
                    // ! Working at this point
            })
        }
    }, [currentPageLabels]);

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
                <div className="download-button" onClick={() => {
                    // handleDownload();
                }}>
                    <Download />
                </div>
                <div className="model-download-button" onClick={() => {
                    // handleDownload();
                }}>
                    <FileDown />
                </div>
                <div className="upload-button" onClick={() => {
                    // fileInputRef.current?.click();
                }}>
                    {/* <input style={{ display: "none" }} type="file" ref={fileInputRef} onChange={(e) => { */}
                    {/* handleFileUpload(e); */}
                    {/* }} /> */}
                    <Upload />
                </div>

                <div className="page-button" onClick={() => {
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
                                                setCurrentPageLabels([...currentPageLabels].splice(ind, 1));
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
                                        <div className="label-count">
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