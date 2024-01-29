import { defineComponent, ExtractPropTypes, h, nextTick, onMounted, PropType, reactive, watch } from "vue"
import { Button } from "./Button"
import { NATIVE_EVENTS, normalizeVNodeChildren } from "./util"
import { Variant } from "./variants"
import { useTheme } from "./vue3gui"

interface TypedTabsState<T extends Record<string, string> = Record<string, string>> {
    selected: keyof T
    list: [keyof T, string][]
    next(): void
}

interface TabsStateBase {
    selected: string | null
    list: [string, any][]
}

export function useTabs<T extends Record<string, any>>(tabs: T, defaultValue?: keyof T | null): TypedTabsState<T>
export function useTabs(): TabsStateBase
export function useTabs<T extends Record<string, any>>(tabs: T = {} as T, defaultValue: keyof T | null = null) {
    const state = reactive<TypedTabsState<T>>({
        selected: defaultValue ?? Object.keys(tabs)[0],
        list: Object.entries(tabs),
        next() {
            const index = this.list.findIndex(v => v[0] == this.selected) % this.list.length
            this.selected = this.list[index][0]
        }
    })

    return state as any
}

const _TABS_PROPS = {
    /** Variant of the selected tab indicator */
    variant: {
        type: String as PropType<Variant>,
    },
    /** Tabs definition from `useTabs` */
    tabs: {
        type: Object as PropType<TabsStateBase>,
        required: true as const
    },
    /** Remove gap between tab buttons */
    compact: { type: Boolean },
    /** Set style for individual tab buttons */
    buttonClass: { type: String },
    /** Retro-style skeuomorphic tabs */
    border: { type: Boolean }
}
type _TabsProps = ExtractPropTypes<typeof _TABS_PROPS>

export const Tabs = (defineComponent({
    name: "Tabs",
    props: _TABS_PROPS,
    setup(props, ctx) {
        if (props.border) {
            return () => (
                <div class={["flex row pt-1", !props.compact && "gap-1"]}>
                    {props.tabs.list.map(([key, label]) => (
                        <Button onClick={() => props.tabs.selected = key} textual key={key} class={[props.buttonClass, "as-retro-tab", props.tabs.selected == key && "-selected"]}>
                            {typeof label == "string" ? label : label()}
                            <div class="-border"></div>
                            <div class="-connector"></div>
                        </Button>
                    ))}
                </div>
            )
        }

        const { theme } = useTheme()

        const indicators: Record<string, HTMLDivElement> = {}

        function doIndicatorAnimation(selected: string | null, oldSelected: string | null, deferred: boolean) {
            if (!selected) throw new Error("Selected state changed to null")

            if (!oldSelected) {
                if (!(selected in indicators)) {
                    if (deferred) throw new Error("Selected tab does not exist")
                    nextTick(() => doIndicatorAnimation(selected, oldSelected, true))
                    return
                }

                indicators[selected].classList.add("active")
                return
            }

            const oldIndicator = indicators[oldSelected]
            const targetIndicator = indicators[selected]

            const targetRect = oldIndicator.getBoundingClientRect()
            oldIndicator.classList.remove("active")
            targetIndicator.classList.add("active")

            const currRect = targetIndicator.getBoundingClientRect()
            const dx = (targetRect.left + targetRect.width / 2) - (currRect.left + currRect.width / 2)
            const sw = targetRect.width / currRect.width

            targetIndicator.style.transform = `translateX(${dx}px) scaleX(${sw})`

            setTimeout(() => {
                targetIndicator.classList.add("moving")
                targetIndicator.style.transform = "none"

                setTimeout(() => {
                    targetIndicator.classList.remove("moving")
                }, 100)
            }, 10)
        }

        watch(() => props.tabs.selected, (selected, oldSelected) => {
            if (props.tabs.list.length == 0) return

            doIndicatorAnimation(selected, oldSelected, false)
        })

        onMounted(() => {
            if (props.tabs.selected) {
                if (!(props.tabs.selected in indicators)) {
                    props.tabs.selected = Object.keys(indicators)[0]
                }

                indicators[props.tabs.selected].classList.add("active")
            }
        })

        return () => (
            <div class={["flex row", !props.compact && "gap-4"]}>
                {props.tabs.list.map(([key, label]) => (
                    <Button onClick={() => props.tabs.selected = key} textual flat key={key} class={["pb-1 px-0", props.buttonClass]}>
                        {typeof label == "string" ? label : h(label)}
                        <div ref={v => indicators[key] = v as HTMLDivElement} class={["as-tabs-indicator", `bg-${props.variant ?? theme.value.highlight}`]}></div>
                    </Button>
                ))}
            </div>
        )
    }
}))

interface _ChildTab {
    name: string
    label: string
    content: any
}

export const TabbedContainer = (defineComponent({
    name: "TabbedContainer",
    props: {
        defaultValue: { type: String },
        tabsProps: { type: Object as PropType<Omit<_TabsProps, "tabs"> & { class: any, style: any }> },
        tabsWrapper: { type: Function as PropType<(vnode: any) => any> },
        externalTabs: { type: Object as PropType<TabsStateBase> },
        ...NATIVE_EVENTS
    },
    setup(props, ctx) {
        function getChildren() {
            const children = normalizeVNodeChildren(ctx.slots.default?.())
            const tabs: _ChildTab[] = []

            for (const child of children) {
                if (typeof child == "object" && child != null && child.type == Tab) {
                    if (child.props == null || child.props.name == null) continue

                    const name = child.props.name
                    const label = child.props.label ?? name
                    tabs.push({ name, label, content: child })
                }
            }

            return tabs
        }

        function updateTabList(children: _ChildTab[]) {
            const oldTabs = tabs.list
            const newTabs: typeof oldTabs = children.map(v => [v.name, v.label])
            if (oldTabs.map(v => v[0]).join(",") != newTabs.map(v => v[0]).join(",")) {
                nextTick(() => {
                    if (!newTabs.some(v => v[0] == tabs.selected)) {
                        tabs.selected = newTabs[0]?.[0] ?? ""
                    }

                    tabs.list = newTabs
                })
            }

        }

        const tabs = props.externalTabs ?? useTabs({}) as TabsStateBase

        return () => {
            const children = getChildren()
            updateTabList(children)
            const selected = children.find(v => v.name == tabs.selected)
            const content = props.tabsWrapper ? props.tabsWrapper(selected?.content) : selected?.content

            if (props.externalTabs) {
                return (
                    <div>
                        {content}
                    </div>
                )
            } else {
                return (
                    <div>
                        <Tabs {...props.tabsProps} tabs={tabs} />
                        {content}
                    </div>
                )
            }
        }
    }
}))

export const Tab = (defineComponent({
    name: "TabbedContainer",
    props: {
        name: { type: String, required: true },
        label: { type: null as unknown as PropType<String | (() => any)> },
    },
    setup(props, ctx) {
        return () => (
            ctx.slots.default?.()
        )
    }
}))
