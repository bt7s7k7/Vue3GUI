import { defineComponent, reactive } from "vue"
import { Tabs } from "./Tabs"

export const TabsRouter = (defineComponent({
    name: "TabsRouter",
    props: {
        contentClass: { type: null },
    },
    setup(props, ctx) {
        const slotNames = Object.keys(ctx.slots)

        const state = reactive({
            selected: slotNames[0],
            list: slotNames.map(v => [v, v] as [string, string]),
        })

        return () => (
            <div class="flex column">
                <Tabs tabs={state} />
                {Object.entries(ctx.slots).map(([name, slot]) => (
                    <div key={name} class={["flex column flex-fill", name != state.selected && "hidden", props.contentClass]}>
                        {slot?.()}
                    </div>
                ))}
            </div>
        )
    },
}))