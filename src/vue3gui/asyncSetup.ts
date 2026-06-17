import { onUnmounted, shallowRef } from "vue"

export function asyncSetup(process: (abort: AbortSignal) => Promise<() => any>, defaultResult: () => any, errorResult?: (error: Error) => any) {
    const render = shallowRef(defaultResult)
    const abort = new AbortController()

    onUnmounted(() => {
        abort.abort()
    })

    process(abort.signal).then((result) => {
        render.value = result
    }, error => {
        if (errorResult) {
            render.value = () => errorResult(error)
        } else {
            throw error
        }
    })

    return () => render.value()
}
