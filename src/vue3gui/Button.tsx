import { defineComponent, PropType } from "vue"
import { eventDecorator } from "../eventDecorator"
import { DEFAULT_VARIANT, Variant } from "./constants"

export const Button = eventDecorator(defineComponent({
    name: "Button",
    emits: {
        click: () => true,
        dummy: (x: number, c: string) => true
    },
    props: {
        variant: {
            type: String as PropType<Variant>
        }
    },
    setup(props, ctx) {

        return () => (
            <button class={`as-button bg-${props.variant ?? DEFAULT_VARIANT}`} onClick={() => ctx.emit("click")}>{ctx.slots.default?.()}</button>
        )
    }
}))