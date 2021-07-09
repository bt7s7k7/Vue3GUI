import { Variant } from "./variants"

interface Theme {
    object: Variant
    background: Variant
    highlight: Variant
    overlay: Variant
}

export namespace Theme {
    export const LIGHT: Theme = {
        highlight: "primary",
        background: "white",
        object: "secondary",
        overlay: "secondary"
    }

    export const DARK: Theme = {
        highlight: "white",
        background: "dark",
        object: "secondary",
        overlay: "black"
    }

    export let selected = LIGHT
}