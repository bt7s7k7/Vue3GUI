import { ButtonHTMLAttributes, computed, defineAsyncComponent, defineComponent, ExtractPropTypes, h, inject, InjectionKey, PropType, provide, reactive, watch } from "vue"
import type { RouteLocationRaw } from "vue-router"
import { eventDecorator } from "../eventDecorator"
import { Icon } from "./Icon"
import { Variant } from "./variants"

let routerLink = defineAsyncComponent(() => import("vue-router").then(v => v.RouterLink))

export namespace ButtonProps {
    export const STYLE = {
        variant: { type: String as PropType<Variant> },
        flat: { type: Boolean },
        textual: { type: Boolean },
        clear: { type: Boolean },
        small: { type: Boolean },
        disabled: { type: Boolean },
        plain: { type: Boolean },
        shadow: { type: Boolean },
    }

    export type Style = Partial<ExtractPropTypes<typeof STYLE>>

    export const FUNCTION = {
        /** Creates a `<a href />` element */
        href: { type: String },
        /** Creates a `RouterLink` component */
        to: { type: null as unknown as PropType<RouteLocationRaw> },
        /** When used with router links, replaces the current route instead of pushing it to history */
        replace: { type: Boolean },
        /** Creates an `<input type="submit" />` element */
        submit: { type: Boolean },
        nativeProps: { type: Object as PropType<ButtonHTMLAttributes> },
        label: { type: String },
        icon: { type: String },
        forceFocus: { type: Boolean }
    }

    export type Function = Partial<ExtractPropTypes<typeof FUNCTION>> & { onClick?(click: MouseEvent): void, onMouseDown?(click: MouseEvent): void, }

    export type Group = { props: ButtonProps.Style & { class?: any, style?: any } }
    export const GROUP_SYMBOL = Symbol.for("vue3gui.buttonGroup") as InjectionKey<Group>

    export function useDisabled(disabled?: { value: boolean }) {
        const inherited = inject(ButtonProps.GROUP_SYMBOL, undefined)
        return computed(() => disabled?.value || inherited?.props.disabled || false)
    }
}

export const Button = eventDecorator(defineComponent({
    name: "Button",
    emits: {
        click: (click: MouseEvent) => true,
        mouseDown: (click: MouseEvent) => true,
    },
    props: {
        ...ButtonProps.STYLE,
        ...ButtonProps.FUNCTION
    },
    setup(props, ctx) {
        const groupData = inject(ButtonProps.GROUP_SYMBOL, undefined)

        return () => {
            const inherited = groupData?.props
            const plain = props.plain || inherited?.plain
            const disabled = props.disabled || inherited?.disabled
            const variant = props.variant ?? inherited?.variant ?? "secondary"
            const clear = props.clear || inherited?.clear
            const flat = props.flat || inherited?.flat
            const textual = props.textual || inherited?.textual
            const small = props.small || inherited?.small
            const shadow = props.shadow || inherited?.shadow

            return (h as any)(
                props.href ? "a" :
                    props.to ? routerLink :
                        "button",
                {
                    ...props.nativeProps,
                    class: !plain && [
                        `as-button`,
                        !disabled && !clear && !textual && "as-clickable",
                        ...(
                            clear ? ["flat", !disabled && `as-clickable`]
                                : [
                                    flat && "flat",
                                    !textual ? `bg-${variant}` : "textual flat",
                                ]
                        ),
                        small && "small",
                        shadow && "as-clickable-shadow",
                        props.forceFocus && "force-focus",
                    ],
                    ...(props.href ? { href: props.href } :
                        props.to ? { to: props.to } :
                            props.submit ? { type: "submit" } :
                                { type: "button" }),
                    ...(disabled ? { disabled: true } : {}),
                    ...(props.replace ? { replace: true } : {}),
                    onClick: (event: MouseEvent) => { event.stopPropagation(); ctx.emit("click", event) },
                    onMousedown: (event: MouseEvent) => { event.stopPropagation(); ctx.emit("mouseDown", event) }
                },
                {
                    default: (props.label || props.icon) ? (
                        () => [props.icon && <Icon icon={props.icon} />, props.label && props.icon && " ", props.label, ctx.slots.default?.()]
                    ) : (
                        ctx.slots.default ?? (() => "")
                    )
                }
            )
        }
    }
}))

export const _STYLE_KEYS = Object.keys(ButtonProps.STYLE) as (keyof typeof ButtonProps.STYLE | "class" | "style")[]
_STYLE_KEYS.push("class", "style")
export const ButtonGroup = defineComponent({
    name: "ButtonGroup",
    props: {
        ...ButtonProps.STYLE,
        actions: { type: Array as PropType<ButtonProps.Function[]> },
        style: { type: null },
        class: { type: null },
    },
    inheritAttrs: false,
    setup(props, ctx) {
        const inherited = inject(ButtonProps.GROUP_SYMBOL, undefined)

        const finalProps: ButtonProps.Group["props"] = reactive({})
        watch(() => [props, inherited?.props], ([props, inherited]: any) => {
            for (const key of _STYLE_KEYS) {
                if (props[key]) {
                    finalProps[key] = props[key]
                } else if (inherited != undefined && inherited[key]) {
                    finalProps[key] = inherited
                } else {
                    delete finalProps[key]
                }
            }
        }, { immediate: true, deep: true })

        provide(ButtonProps.GROUP_SYMBOL, reactive({ props: finalProps }))

        return () => <>
            {props.actions?.map(action => (
                <Button {...action} />
            ))}
            {ctx.slots.default?.()}
        </>
    }
})
