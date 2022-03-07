import { defineComponent, PropType } from "vue"
import { Variant } from "./variants"

export const ProgressBar = (defineComponent({
    name: "ProgressBar",
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
            <svg viewBox="0 0 200 2" preserveAspectRatio="none" class={[
                "as-progress-bar",
                props.inline && "inline",
                props.indeterminate || isNaN(props.progress) && "indeterminate",
                props.transition && "transition",
                props.variant && `text-${props.variant}`
            ]} stroke="currentColor" fill="none">
                {props.filler && <line x1="0" x2="200" y1="1" y2="1" class="filler" />}
                <line x1="0" x2="200" y1="1" y2="1" class="main" pathLength="1" stroke-dashoffset={1 * (1 - props.progress)} />
            </svg>
        )
    }
}))