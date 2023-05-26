import { ButtonHTMLAttributes, computed, defineAsyncComponent, defineComponent, h, PropType } from "vue"
import type { RouteLocationRaw } from "vue-router"
import { eventDecorator } from "../eventDecorator"
import { Theme } from "./Theme"
import { Variant } from "./variants"

let routerLink = defineAsyncComponent(() => import("vue-router").then(v => v.RouterLink))

export const Button = eventDecorator(defineComponent({
    name: "Button",
    emits: {
        click: (click: MouseEvent) => true,
        mouseDown: (click: MouseEvent) => true,
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
        },
        disabled: {
            type: Boolean
        },
        nativeProps: {
            type: Object as PropType<ButtonHTMLAttributes>
        }
    },
    setup(props, ctx) {

        const variant = computed(() => props.variant ?? Theme.selected.object)

        return () => (h as any)(
            props.href ? "a" :
                props.to ? routerLink :
                    "button",
            {
                ...props.nativeProps,
                class: [
                    `as-button`,
                    !props.disabled && !props.clear && `as-clickable-${Variant.VARIANTS[variant.value].invert ? "positive" : "negative"}`,
                    ...(
                        props.clear ? ["flat", !props.disabled && `bg-${variant.value}-transparent-hover`]
                            : [
                                props.flat && "flat",
                                !props.textual ? `bg-${variant.value}` : "textual flat",
                            ]
                    ),
                    props.small && "small"
                ],
                ...(props.href ? { href: props.href } :
                    props.to ? { to: props.to } :
                        props.submit ? { type: "submit" } :
                            { type: "button" }),
                ...(props.disabled ? { disabled: true } : {}),
                onClick: (event: MouseEvent) => { event.stopPropagation(); ctx.emit("click", event) },
                onMousedown: (event: MouseEvent) => { event.stopPropagation(); ctx.emit("mouseDown", event) }
            },
            {
                default: ctx.slots.default ?? (() => "")
            }
        )
    }
}))
