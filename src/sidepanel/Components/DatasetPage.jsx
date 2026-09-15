import { ArrowLeft, X, Tornado, Download, Upload } from "lucide-react";
import { Pages } from "../_enums/PagesEnum";
import { useClassifierStore } from "../stores/useClassifierStore";
import { useGeneralStore } from "../stores/useGeneralStore";
import "./DatasetPage.css"
import { useRef, useState } from "react";
import { useActiveTab } from "../hooks/useActiveTab";



export function DatasetPage() {
    const selectedDataset = useClassifierStore(state => state.selectedDataset);
    const dataset = useClassifierStore(state => state.datasets[selectedDataset]);

    if (!dataset) return;

    const count = dataset.length;
    const tab = useActiveTab();

    const fileInputRef = useRef(null);
    const isNativePage = tab?.url?.startsWith("chrome://") || tab?.url?.startsWith("chrome-extension://");

    const handleDownload = () => {
        const exportData = { dataset: dataset };
        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedDataset}-dataset.json`;
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

                if (parsedData && Array.isArray(parsedData.dataset)) {

                    const mergedUrls = Array.from(new Set([...dataset, ...parsedData.dataset]));

                    useClassifierStore.setState((state) => ({
                        datasets: {
                            ...state.datasets,
                            [selectedDataset]: mergedUrls
                        }
                    }));
                } else {
                    alert("Invalid file format. Expected JSON with a 'dataset' array.");
                }
            } catch (error) {
                console.error("Failed to parse JSON", error);
            }
        };

        reader.readAsText(file);
        event.target.value = null;
    };

    return (
        <>
            <div className="page-container dataset-page">
                <div className="title">
                    {selectedDataset + " (" + count + ")"}
                </div>

                <div className="back-button" onClick={() => {
                    useGeneralStore.setState({ page: Pages.DATASETS });
                }}>
                    <ArrowLeft />
                </div>
                <div className="download-button" onClick={() => {
                    handleDownload();
                }}>
                    <Download />
                </div>
                <div className="upload-button" onClick={() => {
                    fileInputRef.current?.click();
                }}>
                    <input style={{ display: "none" }} type="file" accept=".json,application/json" ref={fileInputRef} onChange={(e) => {
                        handleFileUpload(e);
                    }} />
                    <Upload />
                </div>
                <div className="list">
                    {dataset.map((url, index) => {
                        return (
                            <div className="item" key={index}>
                                <div className="name">{url}</div>
                                <div className="delete-button" onDoubleClick={() => {
                                    useClassifierStore.getState().removeDatasetItem(selectedDataset, index);
                                }}>
                                    <X />
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="input-panel">
                    <button
                        disabled={isNativePage}
                        onClick={(e) => {
                            const url = tab.url;
                            console.log(url);

                            const toRemove = dataset.includes(url);

                            if (toRemove) {
                                useClassifierStore.getState().removeDatasetItem(selectedDataset, dataset.indexOf(url));
                            } else {
                                useClassifierStore.getState().addDatasetItem(selectedDataset, url);
                            }
                        }}>
                        {dataset.includes(tab?.url) ? "Remove" : "Add"}
                    </button>
                </div>
            </div>
        </>
    )
}