
// ? classifiers will be of type:
// {
// name: { 
//      labels: {
//          label: { url: doc, ... }         
//          }
//      }
// }

const defaultValues = {
    version: 1,
    classifiers: {},
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