import { Ref } from "@vue/reactivity"
import { computed } from "vue"

export function numberModel(ref: Ref<number>, options: { integer?: boolean } = {}): Ref<string> {
    return computed({
        get() {
            return ref.value.toString()
        },
        set(newValue) {
            let number = (options.integer ? parseInt : parseFloat)(newValue)
            if (isNaN(number)) number = 0
            ref.value = number
        }
    })
}