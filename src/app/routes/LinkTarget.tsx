import { defineComponent } from "vue"
import { eventDecorator } from "../../eventDecorator"
import { Button } from "../../vue3gui/Button"

export const LinkTarget = eventDecorator(defineComponent({
    name: "LinkTarget",
    setup(props, ctx) {
        return () => (
            <div class="flex-fill flex center">
                <Button variant="success" to="/">Back</Button>
            </div>
        )
    }
}))

export default LinkTarget