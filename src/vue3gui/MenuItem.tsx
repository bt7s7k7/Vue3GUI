import { ComponentPublicInstance, ExtractPropTypes, InjectionKey, computed, defineComponent, inject, provide, ref, toRef } from "vue"
import { eventDecorator } from "../eventDecorator"
import { Button, ButtonGroup, ButtonProps } from "./Button"
import { DynamicsEmitter, useDynamicsEmitter } from "./DynamicsEmitter"
import { Icon } from "./Icon"
import { normalizeClass, normalizeVNodeChildren } from "./util"

const _PARENT = Symbol.for("vue3gui.menuParent") as InjectionKey<{ done(): void }>

export namespace MenuItemProps {
    export const STYLE = {
        noContextMenu: { type: Boolean },
        noKebab: { type: Boolean },
        forceWidth: { type: Boolean }
    }

    export type Style = Partial<ExtractPropTypes<typeof STYLE>>

    export const FUNCTION = {
        defaultAction: { type: Boolean },
        elevated: { type: Boolean }
    }

    export type Function = Partial<ExtractPropTypes<typeof FUNCTION>>
}

const _MENU_PROPS = Object.keys(MenuItemProps.STYLE).concat(Object.keys(MenuItemProps.FUNCTION))
export type MenuOpenEvent = ReturnType<DynamicsEmitter["menu"]>

export const MenuItem = eventDecorator(defineComponent({
    name: "MenuItem",
    emits: {
        click: (event: MouseEvent) => true,
        mouseDown: (event: MouseEvent) => true,
        open: (menu: MenuOpenEvent) => true
    },
    props: {
        ...ButtonProps.STYLE,
        ...ButtonProps.FUNCTION,
        ...MenuItemProps.STYLE,
        ...MenuItemProps.FUNCTION
    },
    setup(props, ctx) {
        const emitter = useDynamicsEmitter()
        const disabled = ButtonProps.useDisabled(toRef(props, "disabled"))
        const parent = inject(_PARENT, undefined)
        const menuOpen = ref(false)
        const element = ref<ComponentPublicInstance>()

        let hasInternal = false

        function openMenuElement(event: MouseEvent) {
            const target = event.target as HTMLElement
            const open = openMenu(target.closest("button")!)

            if (!open && !disabled.value) {
                parent?.done()
            }
        }

        function openMenuClick(event: MouseEvent) {
            ctx.emit("click", event)
            if (props.defaultAction) {
                openMenuElement(event)
            } else {
                if (!disabled.value) {
                    parent?.done()
                }
            }
        }

        function openMenuContext(event: MouseEvent) {
            if (props.noContextMenu || props.defaultAction) return
            event.preventDefault()
            openMenu({ x: event.clientX, y: event.clientY })
        }

        function openMenu(target: Parameters<typeof emitter.menu>[0]) {
            if (disabled.value) return false
            if (!hasInternal) return false

            const forceWidth = props.forceWidth ? (element.value!.$el as HTMLElement).getBoundingClientRect().width : null

            const menu = emitter.menu(target, {
                setup() {
                    provide(_PARENT, { done: () => menu.controller.close() })
                    return () => (
                        <div class="flex column" style={forceWidth != null ? `width: ${forceWidth}px` : undefined}>
                            <ButtonGroup clear style="font-family:monospace">
                                {getChildren(false).internal}
                            </ButtonGroup>
                        </div>
                    )
                }
            }, {
                props: {
                    backdropCancels: true,
                    class: "border rounded p-0",
                    noDefaultStyle: true,
                    noTransition: true
                }
            })

            menuOpen.value = true
            menu.finally(() => menuOpen.value = false)
            ctx.emit("open", menu)

            return true
        }

        function getChildren(manageElevated: boolean) {
            const children = normalizeVNodeChildren(ctx.slots.default?.())

            const normal: typeof children = []
            const elevated: typeof children = []
            const internal: typeof children = []

            for (const child of children) {
                if (typeof child == "object" && child != null) {
                    if (child.type == MenuItem) {
                        internal.push(child)
                        if (child.props?.elevated) {
                            if (manageElevated) {
                                if (child.props == null) child.props = {}
                                child.props.label = undefined
                                child.children = ""
                                child.props.class = normalizeClass([child.props.class, "if-hover-fade"])
                            }
                            elevated.push(child)
                        }
                        continue
                    }

                    if (child.type == MenuContent) {
                        internal.push(child)
                        continue
                    }
                }

                normal.push(child)
            }

            if (internal.length > elevated.length && !props.defaultAction && !props.noKebab) {
                elevated.push(<Button
                    onClick={openMenuElement}
                    icon="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z"
                    class="if-hover-fade"
                />)
            }

            hasInternal = internal.length > 0

            return { normal, elevated, internal }
        }

        const buttonProps = computed(() => {
            const result = Object.assign({}, props) as any
            for (const prop of _MENU_PROPS) delete result[prop]
            return result
        })

        return () => {
            const { normal, elevated } = getChildren(true)
            return <Button
                {...buttonProps.value}
                onClick={openMenuClick}
                onMouseDown={(event: MouseEvent) => ctx.emit("mouseDown", event)}
                nativeProps={{ onContextmenu: openMenuContext }}
                class="flex row center-cross hover-check text-left"
                label={undefined}
                icon={undefined}
                forceFocus={props.forceFocus || menuOpen.value}
                ref={element}
            >
                <div class="flex-fill flex row center-cross">
                    {props.icon && <Icon icon={props.icon} class="mr-1" />}
                    {props.label}{normal}</div>
                <ButtonGroup clear>{elevated}</ButtonGroup>
            </Button>
        }
    }
}))

export const MenuContent = (defineComponent({
    name: "MenuContent",
    setup(props, ctx) {
        return () => (
            <div>{ctx.slots.default?.()}</div>
        )
    }
}))
