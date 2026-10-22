import "./App.css"
import { useGeneralStore } from "./stores/useGeneralStore"
import { Pages } from "./_enums/PagesEnum";
import { DatasetPage } from "./Components/DatasetPage";
import { HomePage } from "./Components/HomePage";
import { DatasetsPage } from "./Components/DatasetsPage";
import { ModelPage } from "./Components/ModelPage";
import { ModelsPage } from "./Components/ModelsPage";
import { TestPage } from "./Components/TestPage";

const pageMap = {
    [Pages.HOME]: HomePage,
    [Pages.DATASET]: DatasetPage,
    [Pages.DATASETS]: DatasetsPage,
    [Pages.MODEL]: ModelPage,
    [Pages.MODELS]: ModelsPage,
    [Pages.TEST]: TestPage
}

export function App() {

    const page = useGeneralStore((state) => state.page);
    const PageComponent = pageMap[page];

    return (
        <>
            <div className="app-container">
                <PageComponent />
            </div>
        </>
    )
}