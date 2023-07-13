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
    /** @deprecated Use the `vue3gui` mixin and `useTheme` */
    export let selected: Theme = null!
}
