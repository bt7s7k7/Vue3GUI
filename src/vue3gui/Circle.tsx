import { defineComponent, PropType } from "vue"
import { Variant } from "./variants"

export const Circle = (defineComponent({
    name: "Circle",
    props: {
        variant: { type: String as PropType<Variant> },
        inline: { type: Boolean },
        filler: { type: Boolean },
        transition: { type: Boolean },
        indeterminate: { type: Boolean },
        progress: { type: Number, default: () => 1 },
    },
    setup(props, ctx) {
        return () => (
            <svg viewBox="0 0 32 32" class={[
                "as-circle",
                props.inline && "inline",
                props.indeterminate && "indeterminate",
                props.transition && "transition",
                props.variant && `text-${props.variant}`
            ]} stroke="currentColor" fill="none">
                {props.filler && <circle r="12.5" cx="16" cy="16" class="filler" />}
                <circle r="12.5" cx="16" cy="16" class="main" pathLength="1" stroke-dashoffset={1 * (1 - props.progress)} />
            </svg>
        )
    }
}))