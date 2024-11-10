import { defineComponent } from "vue"

export const LoadingIndicator = (defineComponent({
    name: "LoadingIndicator",
    props: {
        inline: { type: Boolean },
        prewarm: { type: Boolean },
    },
    setup(props, ctx) {
        return () => (
            <div class={["as-loading-indicator", props.inline && "inline", props.prewarm && "prewarm"]}>
                <div></div>
                <div></div>
                <div></div>
            </div>
        )
    },
}))