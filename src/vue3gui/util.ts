import { Ref } from "@vue/reactivity"
import { computed, onUnmounted, reactive, ref, VNodeProps, watch, WatchOptions } from "vue"

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

interface AsyncComputedOptions<T, R> extends WatchOptions {
    persist?: boolean
    onError?: (err: any, inputs: T, lastValue: R | null) => R | null | void,
    onSuccess?: (value: R) => void
}

export function asyncComputed<T, R>(inputs: () => T, getter: (inputs: T) => Promise<R>, options: AsyncComputedOptions<T, R> = {}) {

    function reload(inputs: T) {
        if (!options.persist)
            ret.value = null
        ret.loading = true
        ret.error = null
        const lastValue = ret.value
        return getter(inputs).then(
            result => {
                ret.value = result
                options.onSuccess?.(result)
            },
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
    }


    const ret = reactive({
        value: null,
        loading: true,
        error: null,
        reload: () => reload(inputs())
    }) as { value: R | null, loading: boolean, error: any | null, reload: () => Promise<void> }

    watch(inputs, (inputs) => {
        reload(inputs)
    }, { ...options, immediate: true })

    return ret

}

export type ComponentProps<T extends { new(...args: any): { $props: any } }> = Omit<InstanceType<T>["$props"], Exclude<keyof VNodeProps, "class" | "style">>

export function useDebounce<T>(value: Ref<T>, { delay = 500, ...options }: { delay?: number } & WatchOptions) {
    let timeoutID: any = 0

    const result = ref(value.value) as Ref<T>

    watch(value, (value) => {
        clearTimeout(timeoutID)
        timeoutID = setTimeout(() => result.value = value, delay)
    }, { ...options })

    return result
}

export function stringifyError(error: any) {
    if (!error) return "Internal error"

    if (error.response) {
        if (error.response.data) {
            if (typeof error.response.data == "string") {
                try {
                    error = new DOMParser().parseFromString(error.response.data, "text/html").querySelector("body")!.innerText
                } catch { /* Ignore */ }
            } else if (typeof error.response.data == "object") {
                error = error.response.data
            }
        } else if (error.response.statusText) {
            error = error.response.statusText
        }
    }

    if (error.err) error = error.err
    if (error.error) error = error.error
    if (error.message) error = error.message

    return error
}

export function useEventListener<K extends keyof HTMLElementEventMap>(target: HTMLElement | Window, event: K, handler: (event: HTMLElementEventMap[K]) => void) {
    target.addEventListener(event, handler as any)
    onUnmounted(() => target.removeEventListener(event, handler as any))
}