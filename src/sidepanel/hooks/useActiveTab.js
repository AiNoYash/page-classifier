import { useState, useEffect } from 'react';

export const useActiveTab = () => {
    const [activeTab, setActiveTab] = useState(null);

    useEffect(() => {
        // 1. Fetch the active tab on initial render
        const fetchInitialTab = async () => {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab) setActiveTab(tab);
        };
        fetchInitialTab();

        // 2. Handle when the user switches tabs
        const handleTabActivated = async (activeInfo) => {
            const tab = await chrome.tabs.get(activeInfo.tabId);
            setActiveTab(tab);
        };

        // 3. Handle when the current tab navigates to a new URL or reloads
        const handleTabUpdated = (tabId, changeInfo, tab) => {
            if (tab.active && (changeInfo.url || changeInfo.title || changeInfo.status === 'complete')) {
                setActiveTab(tab);
            }
        };
        
        // 4. Handle when the user switches to a completely different Chrome window
        const handleWindowFocus = async (windowId) => {
             if (windowId !== chrome.windows.WINDOW_ID_NONE) {
                  const [tab] = await chrome.tabs.query({ active: true, windowId });
                  if (tab) setActiveTab(tab);
             }
        };

        // Register listeners
        chrome.tabs.onActivated.addListener(handleTabActivated);
        chrome.tabs.onUpdated.addListener(handleTabUpdated);
        chrome.windows.onFocusChanged.addListener(handleWindowFocus);

        // Cleanup listeners on unmount
        return () => {
            chrome.tabs.onActivated.removeListener(handleTabActivated);
            chrome.tabs.onUpdated.removeListener(handleTabUpdated);
            chrome.windows.onFocusChanged.removeListener(handleWindowFocus);
        };
    }, []);

    return activeTab;
};