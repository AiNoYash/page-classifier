import "./App.css"
import { useGeneralStore } from "./stores/useGeneralStore"
import { Pages } from "./_enums/PagesEnum";
import { DatasetPage } from "./Components/DatasetPage";
import { HomePage } from "./Components/HomePage";
import { DatasetsPage } from "./Components/DatasetsPage";
import { ModelPage } from "./Components/ModelPage";
import { ModelsPage } from "./Components/ModelsPage";

const pageMap = {
    [Pages.HOME]: HomePage,
    [Pages.DATASET]: DatasetPage,
    [Pages.DATASETS]: DatasetsPage,
    [Pages.MODEL]: ModelPage,
    [Pages.MODELS]: ModelsPage,
}

export function App() {

    const page = useGeneralStore((state) => state.page);
    const PageComponent = pageMap[page]; // ? User defined components should always start with capital letter

    return (
        <>
            <div className="app-container">
                <PageComponent />
            </div>
        </>
    )
}