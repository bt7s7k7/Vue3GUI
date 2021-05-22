import { computed, defineComponent, PropType } from "vue"
import { eventDecorator } from "../eventDecorator"
import { Variant } from "./variants"

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

        const variant = computed(() => props.variant ?? Variant.DEFAULT_VARIANT)

        return () => (
            <button
                class={`as-button bg-${variant.value} as-clickable-${Variant.VARIANTS[variant.value].invert ? "positive" : "negative"}`}
                onClick={() => ctx.emit("click")}
            >
                {ctx.slots.default?.()}
            </button>
        )
    }
}))