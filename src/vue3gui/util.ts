import { Events, Fragment, InjectionKey, Ref, VNodeArrayChildren, VNodeNormalizedChildren, VNodeProps, WatchOptions, computed, getCurrentInstance, isVNode, markRaw, onBeforeMount, onMounted, onUnmounted, reactive, ref, shallowRef, watch } from "vue"

export function numberModel(ref: { value: number }, options: { integer?: boolean } = {}): Ref<string> {
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

export interface AsyncComputedOptions<T, R> extends WatchOptions {
    persist?: boolean
    onError?: (err: any, inputs: T, lastValue: R | null) => R | null | void,
    onSuccess?: (value: R) => void,
    finalizer?: (value: R) => void,
    errorsSilent?: boolean
    markRaw?: boolean
    initialValue?: R
}

export function asyncComputed<T, R>(inputs: () => T, getter: (inputs: T) => Promise<R>, options: AsyncComputedOptions<T, R> = {}) {

    function reload(inputs: T) {
        if (!options.persist) {
            if (ret.value) options.finalizer?.(ret.value)
            ret.value = options.initialValue ?? null
        }
        ret.loading = true
        ret.error = null
        const lastValue = ret.value
        return getter(inputs).then(
            result => {
                if (ret.value) options.finalizer?.(ret.value)
                ret.value = options.markRaw && typeof result == "object" && result != null ? markRaw<any>(result) : result
                options.onSuccess?.(result)
            },
            err => {
                // eslint-disable-next-line no-console
                if (!options.errorsSilent) console.error(err)
                ret.error = err
                if (options.onError) {
                    const newValue = options.onError(err, inputs, lastValue)
                    if (newValue !== undefined) {
                        ret.error = null
                        if (ret.value) options.finalizer?.(ret.value)
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

export function useDebounce<T>(value: Ref<T>, { delay = 500, intermediateUpdates = false, ...options }: { delay?: number, intermediateUpdates?: boolean } & WatchOptions = {}) {
    let timeoutID: any = 0

    const result = ref(value.value) as Ref<T>
    let intermediate: T

    watch(value, (value) => {
        if (delay <= 0) {
            result.value = value
        } else {
            if (intermediateUpdates) {
                if (timeoutID == 0) {
                    intermediate = value
                    timeoutID = setTimeout(() => {
                        result.value = intermediate
                        timeoutID = 0
                    }, delay)
                }
            } else {
                clearTimeout(timeoutID)
                timeoutID = setTimeout(() => {
                    result.value = value
                    timeoutID = 0
                }, delay)
            }
        }
    }, { ...options })

    Object.assign(result, {
        updateNow() {
            clearTimeout(timeoutID)
            result.value = value.value
        }
    })

    return result as typeof result & { updateNow(): void }
}

export function stringifyError(error: any): string {
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

    if (error.startsWith("Server Error:")) error = error.slice(13)

    return error.trim()
}

export function useEventListener(target: "interval", interval: number, handler: () => void): void
export function useEventListener(target: { remove(): void }): void
export function useEventListener<K extends keyof HTMLElementEventMap>(target: HTMLElement | Window, event: K, handler: (event: HTMLElementEventMap[K]) => void, options?: boolean | AddEventListenerOptions): void
export function useEventListener(...args: any[]): void {
    if (args.length == 1) {
        const [target] = args as [{ remove(): void }]
        onUnmounted(() => target.remove())
    } else if (args[0] == "interval") {
        const [, interval, handler] = args as [void, number, () => void]
        const id = setInterval(handler, interval)
        onUnmounted(() => {
            clearInterval(id)
        })
    } else {
        const [target, event, handler, options] = args as [HTMLElement | Window, string, (event: Event) => void, boolean | AddEventListenerOptions]
        target.addEventListener(event, handler as any, options)
        onUnmounted(() => target.removeEventListener(event, handler as any))
    }
}

/** 
 * Is this component a direct descendant of RouterView. Returned
 * value becomes valid only after onBeforeMount event, but it is
 * safe to use in template.
 * */
export function useIsRouterRoot() {
    const ret = ref(false)

    onBeforeMount(() => {
        ret.value = getCurrentInstance()!.parent?.type.name == "RouterView"
    })

    return ret
}

const WINDOW_SIZE = self.window == undefined ? null : reactive({ width: window.innerWidth, height: window.innerHeight })
if (WINDOW_SIZE != null) {
    window.addEventListener("resize", () => {
        WINDOW_SIZE.height = window.innerHeight
        WINDOW_SIZE.width = window.innerWidth
    })
}

export function useResizeWatcher(callback?: (() => void) | null, options: { immediate?: boolean } = {}) {
    if (WINDOW_SIZE == null) throw new Error("Cannot useResizeWatcher because there is no window (self.window == undefined)")
    watch(() => WINDOW_SIZE, () => {
        callback?.()
    }, { deep: true })

    if (options.immediate) {
        onMounted(() => callback?.())
    }

    return WINDOW_SIZE
}

export function setPropertyReactive<T, K extends keyof T>(target: T, prop: K, options?: { shallow?: boolean, computed?: () => T[K] }) {
    if (options?.computed) {
        const store = computed(options.computed)

        Object.defineProperty(target, prop, {
            get: () => store.value,
            enumerable: true,
            configurable: true
        })
    } else {
        const store = (options?.shallow ? shallowRef : ref)(target[prop as keyof T])

        Object.defineProperty(target, prop, {
            get: () => store.value,
            set: (value) => store.value = value,
            enumerable: true,
            configurable: true
        })
    }
}

const _classSymbols = new Map<abstract new (...args: any) => any, Symbol>()
export function getClassSymbol<T extends abstract new (...args: any) => any, R = { value: InstanceType<T> | null }>(ctor: T): InjectionKey<R> {
    let symbol = _classSymbols.get(ctor)
    if (symbol != null) return symbol
    symbol = Symbol(ctor.name)
    _classSymbols.set(ctor, symbol)
    return symbol
}

declare module "vue" {
    interface ComponentCustomProps {
        id?: string
    }
}

export function normalizeVNodeChildren(target: VNodeNormalizedChildren | VNodeArrayChildren[number]): Exclude<VNodeArrayChildren[number], any[]>[] {
    if (target == null) return []
    if (typeof target == "string" || typeof target == "number" || typeof target == "boolean") return [target]
    if (target instanceof Array) return target.flatMap(normalizeVNodeChildren)
    if (isVNode(target)) {
        if (target.type == Fragment) return normalizeVNodeChildren(target.children)
        return [target]
    }
    return []
}

export const NATIVE_EVENTS = {} as { [P in Exclude<keyof Events, "style" | "class">]: { type: { new(): (event: Events[P]) => void } } }

/** Polyfill for older vue versions */
export function normalizeClass(value: unknown): string {
    let res = ""
    if (typeof value == "string") {
        res = value
    } else if (value instanceof Array) {
        for (let i = 0; i < value.length; i++) {
            const normalized = normalizeClass(value[i])
            if (normalized) {
                res += normalized + " "
            }
        }
    } else if (value != null && typeof value == "object") {
        for (const name in value) {
            if (value[name as keyof typeof value]) {
                res += name + " "
            }
        }
    }
    return res.trim()
}
