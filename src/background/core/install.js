
const defaultValues = {
    version: 1,
    isOn: true
}


chrome.runtime.onInstalled.addListener(details => {
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        chrome.storage.local.set({ ...defaultValues });
    }
    else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
        chrome.storage.local.get(null, (currentValues) => {
            chrome.storage.local.set({ ...defaultValues, ...currentValues });
        });
    }
});