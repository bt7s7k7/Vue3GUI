import { defineComponent, h, onMounted, PropType, reactive, watch } from "vue"
import { Button } from "./Button"
import { Theme } from "./Theme"
import { Variant } from "./variants"

interface TypedTabsState<T extends Record<string, string> = Record<string, string>> {
    selected: keyof T
    list: [keyof T, string][]
    next(): void
}

interface TabsStateBase {
    selected: string | null
    list: [string, any][]
}

export function useTabs<T extends Record<string, string>>(tabs: T, defaultValue: keyof T | null = null) {
    const state = reactive<TypedTabsState<T>>({
        selected: defaultValue ?? Object.keys(tabs)[0],
        list: Object.entries(tabs),
        next() {
            const index = this.list.findIndex(v => v[0] == this.selected) % this.list.length
            this.selected = this.list[index][0]
        }
    })

    return state
}

export const Tabs = (defineComponent({
    name: "Tabs",
    props: {
        variant: {
            type: String as PropType<Variant>,
            default: () => Theme.selected.highlight
        },
        tabs: {
            type: Object as PropType<TabsStateBase>,
            required: true
        }
    },
    setup(props, ctx) {
        const indicators: Record<string, HTMLDivElement> = {}

        watch(() => props.tabs.selected, (selected, oldSelected) => {
            if (!selected) throw new Error("Selected state changed to null")

            if (!oldSelected) {
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
        })

        onMounted(() => {
            if (props.tabs.selected) indicators[props.tabs.selected].classList.add("active")
        })

        return () => (
            <div class="flex row gap-4">
                {props.tabs.list.map(([key, label]) => (
                    <Button onClick={() => props.tabs.selected = key} textual flat key={key} class="pb-1 px-0">
                        {typeof label == "string" ? label : h(label)}
                        <div ref={v => indicators[key] = v as HTMLDivElement} class={["as-tabs-indicator", `bg-${props.variant}`]}></div>
                    </Button>
                ))}
            </div>
        )
    }
}))
