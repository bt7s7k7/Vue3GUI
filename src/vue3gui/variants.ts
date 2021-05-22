
export type Variant = (typeof Variant.LIST)[number]

export namespace Variant {
    export const VARIANTS: Record<Variant, { bg: string, fg: string, invert: boolean }> = {
        "danger": {
            "bg": "#dc3545",
            "fg": "#ff0000",
            "invert": true
        },
        "white": {
            "bg": "#ffffff",
            "fg": "#ffffff",
            "invert": false
        },
        "black": {
            "bg": "#000000",
            "fg": "#000000",
            "invert": true
        },
        "secondary": {
            "bg": "#555555",
            "fg": "#555555",
            "invert": true
        },
        "primary": {
            "bg": "#0d6efd",
            "fg": "#006ee0",
            "invert": true
        },
        "warning": {
            "bg": "#ff6f00",
            "fg": "#ff7b00",
            "invert": true
        },
        "success": {
            "bg": "#28a745",
            "fg": "#28a745",
            "invert": true
        }
    }
    export const LIST = ["danger", "white", "black", "secondary", "primary", "warning", "success"] as const
    export const DEFAULT_VARIANT = "secondary"
}
