import { computed, onMounted, reactive, ref } from "vue"

export function useAbsoluteResize(strategy: "max" | "last" | "first" = "max") {
    const height = ref(0)
    const target = ref<HTMLElement>()
    function recalculate() {
        const container = target.value!

        if (strategy == "max") {
            let max = 0
            for (const child of Array.from(container.children)) {
                max = Math.max(max, child.getBoundingClientRect().height)
            }

            height.value = max
        } else if (strategy == "first") {
            height.value = container.children[0]?.getBoundingClientRect().height ?? 0
        } else if (strategy == "last") {
            height.value = container.children[container.children.length - 1]?.getBoundingClientRect().height ?? 0
        }
    }

    onMounted(() => {
        recalculate()
        setTimeout(() => {
            recalculate()
        }, 110)
    })

    const ret = {
        targetProps: {
            ref: target,
            style: reactive({ height: computed(() => height.value + "px"), transition: "height 0.1s ease-in-out" }),
        },
        recalculate,
    }

    return ret
}
