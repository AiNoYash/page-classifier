import { ArrowLeft, FileUp } from "lucide-react";
import "./TestPage.css"
import { useGeneralStore } from "../stores/useGeneralStore";
import { useEffect, useRef, useState } from "react";
import { Pages } from "../_enums/PagesEnum";
import { useActiveTab } from "../hooks/useActiveTab";
import { LogRegOvrClassifier } from "../../_model/LogRegOvrClassifier";
import { getCurrentPageContent } from "./ModelPage";

export function TestPage() {

    const fileInputRef = useRef(null);
    const [labels, setLabels] = useState([]);

    const [classifierJSON, setClassifierJSON] = useState(null);

    const [classifier, setClassifier] = useState(null);
    const [classifications, setClassifications] = useState({});
    const [classified, setClassified] = useState("");

    const tab = useActiveTab();
    const [currentPageContent, setCurrentPageContent] = useState("");


    const currentPageUrl = tab?.url;
    const isNativePage = tab?.url?.startsWith("chrome://") || tab?.url?.startsWith("chrome-extension://");



    useEffect(() => {
        if (classifierJSON === null)
            return;

        const newClassifier = LogRegOvrClassifier.load(classifierJSON);
        setClassifier(newClassifier);

    }, [classifierJSON]);



    useEffect(() => {

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

    }, [currentPageUrl, currentPageContent, classifier, tab]);



    function handleModelUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsedData = JSON.parse(e.target.result);
                setLabels(parsedData.uniqueLabels);
                setClassifierJSON(parsedData);
                
            } catch (error) {
                console.error("Failed to parse JSON", error);
            }
        };
        reader.readAsText(file);
        event.target.value = null;
    }

    return (
        <>
            <div className="page-container test-page">
                <div className="back-button" onClick={() => {
                    useGeneralStore.setState({ page: Pages.HOME });
                }}>
                    <ArrowLeft />
                </div>

                <div className="title">Test</div>
                <div className="model-upload-button" title="Upload model" onClick={() => {
                    fileInputRef.current?.click();
                }}>
                    <input
                        style={{ display: "none" }}
                        type="file"
                        accept=".json,application/json"
                        ref={fileInputRef}
                        onChange={handleModelUpload}
                    />
                    <FileUp />
                </div>

                <div className="list">
                    {labels.map((label, index) => {
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
            </div>
        </>
    )
}