import { Variant } from "./variants"

interface Theme {
    object: Variant
    background: Variant
    highlight: Variant
    overlay: Variant
    inset: Variant
    border: Variant | "default"
}

export namespace Theme {
    export const LIGHT: Theme = {
        highlight: "primary",
        background: "white",
        object: "secondary",
        overlay: "secondary",
        inset: "white",
        border: "default"
    }

    export const DARK: Theme = {
        highlight: "white",
        background: "dark",
        object: "secondary",
        overlay: "black",
        inset: "black",
        border: "secondary"
    }

    export let selected = LIGHT
}