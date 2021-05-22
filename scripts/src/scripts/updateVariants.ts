import { readFileSync, writeFileSync } from "fs"
import { join } from "path"

const sourceFile = readFileSync(join(__dirname, "../../../src/vue3gui/style/constants.scss")).toString()
    .replace(/;/g, ",")
    .replace(/\(/g, "{")
    .replace(/\)/g, "}")
    .replace(/(#......)/g, `"$1"`)
    .replace(/\$([\w-]+)/g, `"$1"`)
    .replace(/: (\.?\d+\w+)/g, `: "$1"`)

const source = eval(`({${sourceFile}})`)

const output = `
export type Variant = (typeof Variant.LIST)[number]

export namespace Variant {
    export const VARIANTS: Record<Variant, { bg: string, fg: string, invert: boolean }> = ${JSON.stringify(source.colors, null, 4).replace(/\n/g, "\n    ")}
    export const LIST = ${JSON.stringify(Object.keys(source.colors)).replace(/,/g, ", ")} as const
    export const DEFAULT_VARIANT = "secondary"
}
`

writeFileSync(join(__dirname, "../../../src/vue3gui/variants.ts"), output)