import { computed, defineComponent, h, PropType } from "vue"
import type { RouteLocationRaw } from "vue-router"
import { eventDecorator } from "../eventDecorator"
import { Theme } from "./Theme"
import { Variant } from "./variants"

export const Button = eventDecorator(defineComponent({
    name: "Button",
    emits: {
        click: (event: MouseEvent) => true,
    },
    props: {
        variant: {
            type: String as PropType<Variant>
        },
        to: {
            type: null as unknown as PropType<RouteLocationRaw>
        },
        href: {
            type: String
        },
        flat: {
            type: Boolean
        },
        textual: {
            type: Boolean
        },
        clear: {
            type: Boolean
        },
        submit: {
            type: Boolean
        },
        small: {
            type: Boolean
        }
    },
    setup(props, ctx) {

        const variant = computed(() => props.variant ?? Theme.selected.object)

        return () => (h as any)(
            props.href ? "a" :
                props.to ? "router-link" :
                    props.submit ? "input" :
                        "button",
            {
                class: [
                    `as-button`,
                    `as-clickable-${Variant.VARIANTS[variant.value].invert ? "positive" : "negative"}`,
                    ...(
                        props.clear ? ["flat", `bg-${variant.value}-transparent-hover`]
                            : [
                                props.flat && "flat",
                                !props.textual ? `bg-${variant.value}` : "textual flat",
                            ]
                    ),
                    props.small && "small"
                ],
                ...(props.href ? { href: props.href } :
                    props.to ? { to: props.to } :
                        props.submit ? { type: "submit", value: ctx.slots.default?.()[0].children ?? "" } :
                            { onClick: (event: MouseEvent) => { event.stopPropagation(); ctx.emit("click", event) } })
            },
            {
                default: ctx.slots.default ?? (() => "")
            }
        )
    }
}))