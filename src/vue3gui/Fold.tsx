import { defineComponent, PropType, Ref, ref } from "vue"
import { eventDecorator } from "../eventDecorator"

export const Fold = eventDecorator(defineComponent({
    name: "Fold",
    props: {
        inline: {
            type: Boolean,
            default: false
        },
        negative: {
            type: Boolean,
            default: false
        },
        open: {
            type: Object as PropType<Ref<boolean>>
        }
    },
    setup(props, ctx) {
        const open = props.open ?? ref(false)

        return () => (
            <div class={[props.inline && "inline-block"]}>
                <div
                    class={["as-fold", props.negative ? "as-clickable-negative" : "as-clickable-positive", open.value && "open", "inline-block"]}
                    onClick={() => open.value = !open.value}
                >
                    ▶
                </div>
                {" "}
                <span>
                    {ctx.slots[open.value ? "default" : "hidden"]?.()}
                </span>
            </div>
        )
    }
}))