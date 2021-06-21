import { computed, defineComponent, h, PropType } from "vue"
import { RouteLocationRaw, RouterLink } from "vue-router"
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
        }
    },
    setup(props, ctx) {

        const variant = computed(() => props.variant ?? Variant.DEFAULT_VARIANT)

        return () => (h as any)(
            props.href ? "a" :
                props.to ? RouterLink :
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
                    )
                ],
                ...(props.href ? { href: props.href } :
                    props.to ? { to: props.to } :
                        { onClick: () => ctx.emit("click") })
            },
            {
                default: ctx.slots.default ?? (() => "")
            }
        )
    }
}))