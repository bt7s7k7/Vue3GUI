import { defineComponent, onMounted, onUnmounted, ref } from "vue"

export const DelayMount = (defineComponent({
    name: "DelayMount",
    props: {
        time: { type: Number }
    },
    setup(props, ctx) {
        const mount = ref(false)

        let timeoutID: any = -1
        onMounted(() => {
            timeoutID = setTimeout(() => {
                mount.value = true
            }, props.time ?? 10)
        })

        onUnmounted(() => {
            clearTimeout(timeoutID)
        })

        return () => (
            mount.value && ctx.slots.default?.()
        )
    }
}))