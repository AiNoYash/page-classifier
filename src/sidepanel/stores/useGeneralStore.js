import { create } from "zustand";
import { Pages } from "../_enums/PagesEnum";


export const useGeneralStore = create(
    (set, get) => ({
        page: Pages.HOME,

    })
);