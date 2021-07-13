import { LIGHT_THEME } from "./themes/light"
import { Variant } from "./variants"

export interface Theme {
    name: string
    object: Variant
    background: Variant
    highlight: Variant
    overlay: Variant
    inset: Variant
    border: Variant | "default",
    style?: string
}

export namespace Theme {
    export let selected: Theme = LIGHT_THEME
}