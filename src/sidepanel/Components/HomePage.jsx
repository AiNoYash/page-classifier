import { Pages } from "../_enums/PagesEnum"
import { useGeneralStore } from "../stores/useGeneralStore"
import "./HomePage.css"

export function HomePage() {


    return (
        <>
            <div className="page-container">
                <div className="title">Page Classifier</div>
                <button
                    className="home-page-button"
                    onClick={() => {
                        useGeneralStore.setState({ page: Pages.MODELS })
                    }}>
                    Models
                </button>
                <button
                    className="home-page-button"
                    onClick={() => {
                        useGeneralStore.setState({ page: Pages.DATASETS })
                    }}>
                    Datasets
                </button>
            </div>
        </>
    )
}