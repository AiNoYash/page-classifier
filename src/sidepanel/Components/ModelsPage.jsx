import { ArrowLeft, Pencil, Trash } from "lucide-react"
import "./ModelsPage.css"
import { useClassifierStore } from "../stores/useClassifierStore"
import { useState } from "react";
import { useGeneralStore } from "../stores/useGeneralStore";
import { Pages } from "../_enums/PagesEnum";


export function ModelsPage({ }) {

    const models = useClassifierStore(state => state.models);
    const [name, setName] = useState("")
    


    return (
        <>

            <div className="page-container models-page">
                <div className="back-button" onClick={() => {
                    useGeneralStore.setState({ page: Pages.HOME });
                }}>
                    <ArrowLeft />
                </div>
                <div className="title">
                    Models
                </div>
                <div className="list">
                    {Object.keys(models).map((modelName, index) => {
                        return (
                            <div className="item" key={index}>
                                <div className="name">{modelName}</div>
                                <div className="edit-button" onDoubleClick={() => {
                                    useClassifierStore.setState({ selectedModel: modelName });
                                    useGeneralStore.setState({ page: Pages.MODEL });
                                }}>
                                    <Pencil />
                                </div>
                                <div className="delete-button" onDoubleClick={() => {
                                    useClassifierStore.getState().removeModel(modelName);
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
                        placeholder="Add model..."
                        onChange={(e) => {
                            setName(e.target.value);
                        }} />
                    <button onClick={(e) => {
                        const newModel = name.trim()

                        if (!newModel) {
                            return;
                        }

                        if (Object.keys(models).includes(newModel)) {
                            return;
                        }

                        setName("");
                        useClassifierStore.getState().addModel(newModel);
                    }}>
                        Add
                    </button>
                </div>
            </div>
        </>
    )
}