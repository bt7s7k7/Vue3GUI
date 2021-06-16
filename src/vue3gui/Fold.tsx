import { defineComponent, PropType, Ref, ref } from "vue"
import { eventDecorator } from "../eventDecorator"

export const Fold = eventDecorator(defineComponent({
    name: "Fold",
    props: {
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
            <span>
                <div
                    class={["as-fold", props.negative ? "as-clickable-negative" : "as-clickable-positive", open.value && "open", "inline-block", "muted"]}
                    onClick={() => open.value = !open.value}
                >
                    ▶
                </div>
                {" "}
                <span>
                    {ctx.slots[open.value ? "default" : "hidden"]?.()}
                </span>
            </span>
        )
    }
}))