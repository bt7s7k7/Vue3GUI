import { defineComponent } from "vue"

export const LoadingIndicator = (defineComponent({
    name: "LoadingIndicator",
    setup(props, ctx) {
        return () => (
            <div class="as-loading-indicator">
                <div><div>•</div></div>
                <div><div>•</div></div>
                <div><div>•</div></div>
            </div>
        )
    }
}))