import { defineComponent } from "vue"
import { HelloWorld } from "../../vue3GUI/HelloWorld"

export const Home = defineComponent({
    name: "Home",
    setup(props, ctx) {
        return () => (
            <HelloWorld />
        )
    }
})