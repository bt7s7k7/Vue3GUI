import { defineComponent, PropType } from "vue"
import { eventDecorator } from "../eventDecorator"

export const Button = eventDecorator(defineComponent({
    name: "Button",
    emits: {
        click: () => true,
        dummy: (x: number, c: string) => true
    },
    props: {
        variant: {
            type: String as PropType<"white" | "black" | "danger" | "secondary">
        }
    },
    setup(props, ctx) {

        return () => (
            <button class={`as-button bg-${props.variant ?? "secondary"}`} onClick={() => ctx.emit("click")}>{ctx.slots.default?.()}</button>
        )
    }
}))