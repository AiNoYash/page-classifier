

export const chromeExtensionStorage = {
    getItem: async (name) => {
        const result = await chrome.storage.local.get(name);
        return result[name] || null;
    },
    setItem: async (name, value) => {
        await chrome.storage.local.set({ [name]: value });
    },
    removeItem: async (name) => {
        await chrome.storage.local.remove(name);
    },
};


// ? This is just a template for zustand store with chromeExtensionStorage 
// export const useStore = create(
//     persist(
//         (set) => ({
//         }),
//         {
//             name: 'chrome-local-store',
//             storage: chromeExtensionStorage,
//             partialize: (state) =>
//                 Object.fromEntries(
//                     Object.entries(state).filter(([key, value]) => typeof value !== 'function')
//                 ),
//         }
//     )
// );