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
    export const DEFAULT: Theme = {
        highlight: "primary",
        background: "white",
        object: "secondary",
        overlay: "secondary",
        inset: "white",
        border: "default"
    }

    export let selected = DEFAULT
}