import { defineComponent } from "vue"
import { Theme } from "../vue3gui/Theme"

export const App = defineComponent({
    name: "App",
    setup(props, ctx) {
        return () => (
            <router-view class={`bg-${Theme.selected.background}`} />
        )
    }
})