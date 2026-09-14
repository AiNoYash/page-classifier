import { useEffect, useState } from "react"
import "./App.css"


export function App() {
    const [hasHydrated, setHasHydrated] = useState(false)




    useEffect(() => {
        chrome.storage.local.get([], (res) => {


            setHasHydrated(true)
        })
    }, [])


    return (
        <>


        </>
    )
}