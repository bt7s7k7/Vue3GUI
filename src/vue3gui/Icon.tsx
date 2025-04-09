import { computed, defineComponent, PropType } from "vue"
import { eventDecorator } from "../eventDecorator"
import { Variant } from "./variants"

export function getIconHtml(icon: string, className: string | null) {
    return `<svg class="as-icon${className != null ? " " + className : ""}" fill="currentColor" viewBox="0 0 24 24"><g><path d="${icon}" /><rect width="24" height="24" fill="transparent" /></g></svg>`
}

export const Icon = eventDecorator(defineComponent({
    name: "Icon",
    props: {
        icon: {
            type: String,
            required: true,
        },
        scale: {
            type: [Number, String],
        },
        color: {
            type: String,
        },
        variant: {
            type: String as PropType<Variant>,
        },
        rotate: {
            type: [Number, String],
        },
    },
    setup(props, ctx) {
        const style = computed(() => {
            const style: Record<string, string> = {}
            const transform: string[] = []

            if (props.scale) {
                transform.push(`scale(${props.scale})`)
            }

            if (props.color) {
                style.color = props.color
            }

            if (props.rotate) {
                transform.push(`rotate(${props.rotate}deg)`)
            }

            style.transform = transform.join(" ")
            style.transformOrigin = "center"

            return style
        })

        return () => (
            <svg class={["as-icon", props.variant && `text-${props.variant}`]} fill="currentColor" viewBox="0 0 24 24" style={style.value}>
                <g style={style.value}>
                    <path d={props.icon} />
                    <rect width="24" height="24" fill="transparent" />
                </g>
            </svg>
        )
    },
}))
