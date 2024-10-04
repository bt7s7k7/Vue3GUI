
export type Variant = (typeof Variant.LIST)[number]

export namespace Variant {
    export const LIST = ["danger", "white", "black", "secondary", "primary", "warning", "success", "dark", "default", "highlight"] as const
}
