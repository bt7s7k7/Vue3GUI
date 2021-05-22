import { defineComponent } from "vue"
import { Button } from "../../vue3gui/Button"
import { Variant } from "../../vue3gui/variants"

export const Home = defineComponent({
    name: "Home",
    setup(props, ctx) {
        return () => (
            <div>
                <h1>Buttons</h1>
                <div class="flex row child-mr-2">
                    {Variant.LIST.map(variant => (<Button variant={variant}>{variant}</Button>))}
                </div>
                <h1>Text colors</h1>
                <div>
                    {Variant.LIST.map(variant => <div class={`text-${variant}`}>{variant}</div>)}
                </div>
            </div>
        )
    }
})