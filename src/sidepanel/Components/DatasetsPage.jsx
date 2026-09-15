import { ArrowLeft, Pencil, Trash } from "lucide-react"
import "./DatasetsPage.css"
import { useClassifierStore } from "../stores/useClassifierStore"
import { useState } from "react";
import { useGeneralStore } from "../stores/useGeneralStore";
import { Pages } from "../_enums/PagesEnum";

export function DatasetsPage({ }) {

    const datasets = useClassifierStore((state) => state.datasets);
    const [name, setName] = useState("");

    return (
        <>
            <div className="page-container datasets-page">
                <div className="back-button" onClick={() => {
                    useGeneralStore.setState({ page: Pages.HOME });
                }}>
                    <ArrowLeft />
                </div>
                <div className="title">
                    Datasets
                </div>
                <div className="list">
                    {Object.keys(datasets).map((datasetName, index) => {
                        return (
                            <div className="item" key={index}>
                                <div className="name">{datasetName}</div>
                                <div className="edit-button" onDoubleClick={() => {
                                    useClassifierStore.setState({ selectedDataset: datasetName });
                                    useGeneralStore.setState({ page: Pages.DATASET });
                                }}>
                                    <Pencil />
                                </div>
                                <div className="delete-button" onDoubleClick={() => {
                                    useClassifierStore.getState().removeDataset(datasetName);
                                }}>
                                    <Trash />
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="input-panel">
                    <input
                        type="text"
                        value={name}
                        placeholder="Add dataset..."
                        onChange={(e) => {
                            setName(e.target.value);
                        }} />
                    <button onClick={(e) => {
                        const newDataset = name.trim()
                        
                        if (!newDataset) {
                            return;
                        }

                        if (Object.keys(datasets).includes(newDataset)) {
                            return;
                        }

                        setName("");
                        useClassifierStore.getState().addDataset(newDataset);
                    }}>
                        Add
                    </button>
                </div>
            </div>
        </>
    )
}