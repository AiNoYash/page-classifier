import { create } from "zustand";
import { chromeExtensionStorage } from "./storage";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";


// models: {
//     modelName: {
//         labels: []
//         dataset: {
//             url: {
//                 content: "",
//                 labels: []
//             }
//         }
//     }
// }

// dataset:{
//     datasetName: []
// }

export const useClassifierStore = create(
    persist(
        immer(
            (set, get) => ({

                models: {},
                selectedModel: "",

                addModel: (newModel) =>
                    set((state) => {
                        state.models[newModel] = {};
                        state.models[newModel]["labels"] = [];
                        state.models[newModel]["dataset"] = {};
                    }),

                removeModel: (model) =>
                    set(state => {
                        delete state.models[model]
                    }),

                // ? When new labels come and stuff like that happen we are at that time still gonna use this same method to update it.
                addModelItem: (model, url, item) =>
                    set((state) => {
                        state.models[model]["dataset"][url] = item; // ? item is an obj here
                    }),

                removeModelItem: (model, item) =>
                    set((state) => {
                        delete state.models[model]["dataset"][item] // ? item is name here
                    }),

                addModelLabel: (model, label) =>
                    set(state => {
                        state.models[model]["labels"].push(label)
                    }),

                removeModelLabel: (model, label) =>
                    set((state) => {
                        const labels = state.models[model]["labels"];
                        const dataset = state.models[model]["dataset"];

                        // Remove from global labels array
                        const globalIndex = labels.indexOf(label);
                        if (globalIndex !== -1) {
                            state.models[model]["labels"].splice(globalIndex, 1);
                        }

                        // Remove from individual dataset items
                        Object.keys(dataset).forEach(url => {
                            const itemLabels = state.models[model]["dataset"][url].labels;
                            const index = itemLabels.indexOf(label);

                            // Only splice if the label actually exists in this document
                            if (index !== -1) {
                                itemLabels.splice(index, 1);

                                if (itemLabels.length === 0) {
                                    delete state.models[model]["dataset"][url];
                                }
                            }
                        });
                    }),

                datasets: {},
                selectedDataset: "",

                addDataset: (newDataset) =>
                    set((state) => {
                        state.datasets[newDataset] = [];
                    }),
                removeDataset: (dataset) =>
                    set(state => {
                        delete state.datasets[dataset]
                    }),
                addDatasetItem: (dataset, item) =>
                    set((state) => {
                        state.datasets[dataset].push(item);
                    }),
                removeDatasetItem: (dataset, itemIndex) =>
                    set((state) => {
                        state.datasets[dataset].splice(itemIndex, 1);
                    }),
            })
        ),
        {
            name: 'classifier-store',
            storage: chromeExtensionStorage,
            partialize: (state) =>
                Object.fromEntries(
                    Object.entries(state).filter(([key, value]) => typeof value !== 'function')
                ),
        }
    )
);