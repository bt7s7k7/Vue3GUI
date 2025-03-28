import { CSSProperties } from "vue"

function ensureValue(value: string | number) {
    return typeof value == "string" ? value : `calc(var(--size-int) * ${value})`
}

/**
 * Grid style builder, use methods to setup a style and use the `$` property to get a `CSSProperties`
 * object to be put into the style attribute. Most methods accept a string which is copied
 * verbatim or a number which is multiplied by the size increment.
 * */
export function grid() {
    const data: CSSProperties = {
        display: "grid",
    }

    let isContainer = false
    let isChild = false

    return {
        /**
         * Sets the `grid-template-rows` property.
         * Number values are multipliers for the `--size-int` CSS variable, string variables are copied verbatim
         * (you can use `<>fr` for fill and `auto` for fit). All values are concatenated by a space.
        */
        rows(...value: (string | number)[]) {
            data.gridTemplateRows = value.map(ensureValue).join(" ")
            isContainer = true

            return this
        },
        /** Sets the `grid-template-columns` property.
         * Number values are multipliers for the `--size-int` CSS variable, string variables are copied verbatim
         * (you can use `<>fr` for fill and `auto` for fit). All values are concatenated by a space.
        */
        columns(...value: (string | number)[]) {
            data.gridTemplateColumns = value.map(ensureValue).join(" ")
            isContainer = true

            return this
        },
        /** Sets the `grid-auto-rows` property.
         * Number values are multipliers for the `--size-int` CSS variable, string variables are copied verbatim
         * (you can use `<>fr` for fill and `auto` for fit). All values are concatenated by a space.
        */
        autoRows(value: string | number) {
            data.gridAutoRows = ensureValue(value)
            isContainer = true

            return this
        },
        /** Sets the `grid-auto-column` property.
         * Number values are multipliers for the `--size-int` CSS variable, string variables are copied verbatim
         * (you can use `<>fr` for fill and `auto` for fit). All values are concatenated by a space.
        */
        autoColumns(value: string | number) {
            data.gridAutoColumns = ensureValue(value)
            isContainer = true

            return this
        },
        /** Sets the `grid-column` property to specific coordinates. **The numbers start at 1!**. You can use `span <>` for size. When end is not specified it is the same as start. */
        left(start: number | string, end?: number | string) {
            isChild = true

            if (end == null) {
                data.gridColumn = start.toString()
            } else {
                data.gridColumn = `${start} / ${end}`
            }

            return this
        },
        /** Sets the `grid-row` property to specific coordinates. **The numbers start at 1!**. You can use `span <>` for size. When end is not specified it is the same as start. */
        top(start: number | string, end?: number | string) {
            isChild = true

            if (end == null) {
                data.gridRow = start.toString()
            } else {
                data.gridRow = `${start} / ${end}`
            }

            return this
        },
        /** Sets `grid-column` to `auto / span ${count}`. */
        colspan(count: number) {
            return this.left("auto", `span ${count}`)
        },
        /** Sets `grid-row` to `auto / span ${count}`. */
        rowspan(count: number) {
            return this.top("auto", `span ${count}`)
        },
        /** If your style is not applied, some property values may be invalid. This method prints the values into a `--debug` property. */
        debug() {
            (data as any)["--debug"] = JSON.stringify(JSON.stringify(data))
            return this
        },
        get $() {
            if (isChild && !isContainer) delete data["display"]
            return data
        },
    }
}
