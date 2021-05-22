export const VARIANTS = ["danger", "white", "black", "secondary"] as const
export const DEFAULT_VARIANT = "secondary"
export type Variant = (typeof VARIANTS)[number]