import { defineComponent } from "vue"

export const HelloWorld = defineComponent({
    name: "HelloWorld",
    setup(props, ctx) {
        return () => (
            <div>Hello World!</div>
        )
    }
})