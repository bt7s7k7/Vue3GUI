import { defineComponent, ref } from "vue"
import { Button } from "../../vue3gui/Button"
import { Variant } from "../../vue3gui/variants"

export const Home = defineComponent({
    name: "Home",
    setup(props, ctx) {
        const buttonsCounter = ref(0)

        const capitalize = (v: string) => v.replace(/^(.)/, v => v.toUpperCase())

        return () => (
            <div class="ml-4">
                <h1>Buttons</h1>
                <div class="flex row child-mr-2">
                    {Variant.LIST.map(variant => (<Button variant={variant} onClick={() => buttonsCounter.value++}>{capitalize(variant)}</Button>))}
                    <div>Clicks: {buttonsCounter.value}</div>
                </div>
                <div class="flex row child-mr-5">
                    <div>
                        <h2>With href:</h2>
                        <Button href="https://www.github.com/bt7s7k7">My GitBub page</Button>
                    </div>
                    <div>
                        <h2>With router to:</h2>
                        <Button to="/link">Link test</Button>
                    </div>
                </div>
                <h1>Text colors</h1>
                <div>
                    {Variant.LIST.map(variant => <div class={`text-${variant}`}>{variant}</div>)}
                </div>
            </div>
        )
    }
})