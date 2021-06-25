import { Ref } from "@vue/reactivity"
import { computed, reactive, watch, WatchOptions } from "vue"

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

export const TRANSITION_NAMES = [
    "fade",
    "slide-up",
    "slide-down",
    "slide-left",
    "slide-right",
    "shrink"
] as const

export function asyncComputed<T, R>(inputs: () => T, getter: (inputs: T) => Promise<R>, options: { persist?: boolean, onError?: (err: any, inputs: T, lastValue: R | null) => R | null } & WatchOptions = {}) {
    const ret = reactive({
        value: null,
        loading: true,
        error: null
    }) as { value: R | null, loading: boolean, error: any | null }

    watch(inputs, (inputs) => {
        if (!options.persist) ret.value = null
        ret.loading = true
        ret.error = null
        const lastValue = ret.value
        getter(inputs).then(
            result => ret.value = result,
            err => {
                // eslint-disable-next-line no-console
                console.error(err)
                ret.error = err
                if (options.onError) {
                    const newValue = options.onError(err, inputs, lastValue)
                    if (newValue !== undefined) {
                        ret.error = null
                        ret.value = newValue
                    }
                }
            }
        ).finally(() => ret.loading = false)
    }, { ...options, immediate: true })

    return ret
}