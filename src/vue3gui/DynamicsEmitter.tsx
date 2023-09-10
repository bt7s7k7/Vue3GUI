import { ComponentPublicInstance, computed, defineComponent, h, inject, InjectionKey, markRaw, PropType, provide, reactive, Ref, ref, watch } from "vue"
import { Button } from "./Button"
import { Modal, ModalController, useModal } from "./Modal"
import { StateCard } from "./StateCard"
import { StateInfo, useState } from "./StateInfo"
import { TextField } from "./TextField"
import { Theme } from "./Theme"
import { ComponentProps, useDebounce } from "./util"
import { Variant } from "./variants"
import { useTheme } from "./vue3gui"

type PopupAlign = "top-left" | "top-right" | "left-up" | "left-down" |
    "right-up" | "right-down" | "bottom-left" | "bottom-right" | "over" | {
        offsetX: number,
        offsetY: number
    }

interface ModalDefinition {
    props: Omit<ComponentProps<typeof Modal>, keyof ReturnType<typeof useModal>["props"]>
    contentProps: any
    content: any
    controller: ReturnType<typeof useModal>
    id: number
    buttons: ButtonDefinition[]
}

export interface GenericModalHandle<T> {
    resultFactory: () => T
    submit(): void
    cancel(): void
    controller: ModalController
}

interface ModalOptions {
    props?: ModalDefinition["props"]
    contentProps?: ModalDefinition["contentProps"]
    buttons?: ModalDefinition["buttons"]
}

interface BaseOptions extends ModalOptions {
    title?: string
    cancelable?: boolean
}

interface AlertOptions extends ModalOptions {
    error?: boolean,
    state?: StateInfo["type"]
}

interface PromptOptions extends BaseOptions {
    initialValue?: string
    verifier?: (value: string, state: StateInfo) => void | Promise<void>
    verifierDebounce?: number
    verifierOptional?: boolean
}

interface ButtonDefinition {
    label: string
    variant?: Variant
    callback: (close: (success?: boolean) => void) => void
}

let nextID = 0

const ButtonDefinitionRenderer = defineComponent({
    name: "ButtonDefinitionRenderer",
    props: {
        definition: {
            type: Array as PropType<ButtonDefinition[]>,
            required: true
        },
        close: {
            type: null as unknown as PropType<(success?: boolean) => void>,
            required: true
        }
    },
    setup(props) {
        return () => props.definition.map(({ callback, label, variant }, i) =>
            <Button clear onClick={() => callback(props.close)} variant={variant} class={[!!variant && `text-${variant}`]} key={i}>{label}</Button>
        )
    }
})

export interface DynamicsEmitter extends ReturnType<typeof makeDynamicEmitter> { }

const DYNAMICS_EMITTER_KEY: InjectionKey<DynamicsEmitter> = Symbol("dynamicsEmitter")

const AlertPopup = defineComponent({
    name: "AlertPopup",
    props: {
        state: { type: String as PropType<StateInfo["type"]> },
        content: { type: null, required: true }
    },
    setup(props) {

        const content = computed(() => typeof props.content != "function" ? (() => <>{props.content}</>) : props.content)

        return () => (
            <div class="mb-5 mt-5 ml-2 mr-4">
                {props.state ? <div class="flex row">
                    <h3 class="m-0 mb-3 mr-7">
                        <StateCard state={{ text: "", type: props.state }}></StateCard>
                    </h3>
                    <div class={props.state == "error" && "text-danger"}>
                        <content.value />
                    </div>
                </div> : <content.value />}
            </div>
        )
    }
})

function makeDynamicEmitter(theme: { readonly value: Theme }, callback: (key: typeof DYNAMICS_EMITTER_KEY, emitter: DynamicsEmitter) => void) {
    const emitter = reactive({
        modal(content: ModalDefinition["content"], options: ModalOptions = {}) {
            const controller = useModal()

            const modal: ModalDefinition = {
                content: typeof content == "object" ? markRaw(content) : content,
                controller,
                props: options.props ?? {},
                id: nextID++,
                buttons: options.buttons ?? [],
                contentProps: options.contentProps
            }

            this.modals.push(modal)

            const promise = controller.open()

            // @ts-ignore
            promise.controller = controller

            promise.finally(() => {
                this.modals.splice(this.modals.indexOf(modal), 1)
            })

            return promise as Promise<boolean> & { controller: typeof controller }
        },
        genericModal<T>(content: { new(...args: any): { $props: { handle: GenericModalHandle<T> } } } | { value: T, render: (value: T, handle: GenericModalHandle<T>) => any }, options: ModalOptions = {}) {
            const handle: GenericModalHandle<T> = {
                cancel: () => promise.controller.close(false),
                submit: () => promise.controller.close(true),
                resultFactory: () => { throw new Error("Result factory was not set") },
                controller: null!
            }

            if ("value" in content) {
                const simpleModal = content
                handle.resultFactory = () => simpleModal.value
                content = (() => simpleModal.render(simpleModal.value, handle)) as any
            }

            const promise = this.modal(content, {
                ...options,
                contentProps: {
                    handle,
                    ...options.contentProps
                }
            })

            handle.controller = promise.controller

            const result = promise.then(success => success ? handle.resultFactory() : null) as Promise<T | null> & { controller: typeof promise.controller }
            result.controller = promise.controller
            return result
        },
        prompt(options: PromptOptions = {}): Promise<string | null> & { result: Ref<string> } {
            const result = ref<string>(options.initialValue ?? "")

            const ret = new Promise<string | null>(resolve => {
                const component = defineComponent({
                    name: "Prompt",
                    setup: () => {
                        let state = null as StateInfo | null
                        if (options.verifier) {
                            if (!options.verifierOptional) promise.controller.okBlocked = true

                            const value = useDebounce(result, { delay: options.verifierDebounce })
                            state = useState()
                            let blocked = false
                            let dirty = false
                            const check = () => {
                                if (blocked) {
                                    dirty = true
                                    return
                                }

                                const promise = options.verifier!(value.value, state!)
                                if (promise instanceof Promise) {
                                    blocked = true
                                    promise.then(() => {
                                        blocked = false
                                        if (dirty) check()
                                        dirty = false
                                    })
                                }

                            }

                            watch(value, check, { immediate: true })
                            watch(result, () => options.verifierDebounce && options.verifierDebounce > 0 && state!.working("Waiting for input"))

                            watch(() => state!.type, (type) => {
                                if (!options.verifierOptional) promise.controller.okBlocked = type != "done"
                            }, { immediate: true })
                        }

                        return () => (
                            <>
                                <div class="mb-3">{options.title ?? "Enter value"}</div>
                                <TextField focus modelValue={result.value} onInput={v => result.value = v} />
                                {state && <StateCard class="mt-3" state={state} />}
                            </>
                        )
                    }
                })

                const promise = this.modal(component, {
                    ...options,
                    props: {
                        okButton: true,
                        cancelButton: options.cancelable ?? true,
                        ...options.props
                    }
                })

                promise.then(ok => resolve(ok ? result.value : null))
            })

            return Object.assign(ret, { result })
        },
        listPrompt<T extends any[]>(items: T, options: BaseOptions & { label?: (v: T[number]) => string | string[] } = {}) {
            return new Promise<T[number] | null>(resolve => {
                const result = ref(null) as Ref<T[number] | null>
                const itemList: { label: string[], value: T[number] }[] = items
                    .map(v => ({ label: options.label?.(v) ?? v.toString(), value: v }))
                    .map(v => ({ value: v.value, label: typeof v.label == "string" ? [v.label] : v.label }))

                const component = defineComponent({
                    name: "ListPrompt",
                    setup: () => {
                        return () => <>
                            <div class="mb-3">{options.title ?? "Select value"}</div>
                            <div class={["border rounder scroll contain w-500 h-500 flex column", `border-${theme.value.border}`, `bg-${theme.value.inset}`]}>
                                {itemList.map(({ label, value }) => <Button onClick={() => { result.value = value; promise.controller.close(true) }} clear class="text-left flex row">
                                    {label.map(v => <div class="flex-fill">{v}</div>)}
                                </Button>)}
                            </div>
                        </>
                    }
                })

                const promise = this.modal(component, {
                    ...options,
                    props: {
                        cancelButton: options.cancelable ?? true,
                        ...options.props
                    }
                })

                promise.then(ok => resolve(ok ? result.value : null))
            })
        },
        alert(content: ModalDefinition["content"], options: AlertOptions = {}) {
            const state = options.error ? "error" : options.state

            return this.modal(AlertPopup, {
                ...options,
                props: { cancelButton: true, ...options.props },
                contentProps: { content, state, ...options.props }
            })
        },
        confirm(content: ModalDefinition["content"], options: ModalOptions = {}) {
            return this.alert(content, {
                ...options,
                props: {
                    okButton: true,
                    ...options.props,
                }
            })
        },
        work(message: any = "", options: ModalOptions = {}) {
            const result = reactive({
                message,
                done: null! as () => void
            })

            const { controller } = this.modal(AlertPopup, { ...options, contentProps: { content: computed(() => result.message), state: "working", ...options.contentProps } })

            result.done = () => controller.close()

            return result
        },
        modals: [] as ModalDefinition[],
        popup(target: HTMLElement | ComponentPublicInstance, content: ModalDefinition["content"], options: ModalOptions & { align?: PopupAlign } = {}) {
            const rect = ("$el" in target ? target.$el as HTMLElement : target).getBoundingClientRect()
            let offsetX = 0
            let offsetY = 0

            if (typeof options.align == "object") {
                ({ offsetX, offsetY } = options.align)
                options.align = "over"
            }

            const [base, extend] = (options.align ?? "bottom-left").split("-")
            const pos: any = {}
            if (base == "right" || base == "left") {
                if (extend == "down") {
                    pos.top = rect.top + "px"
                } else {
                    pos.bottom = (window.innerHeight - rect.bottom) + "px"
                }

                if (base == "right") {
                    pos.left = rect.right + "px"
                } else {
                    pos.right = (window.innerWidth - rect.left) + "px"
                }
            } else if (base == "top" || base == "bottom") {
                if (extend == "right") {
                    pos.left = rect.left + "px"
                } else {
                    pos.right = (window.innerWidth - rect.right) + "px"
                }

                if (base == "bottom") {
                    pos.top = rect.bottom + "px"
                } else {
                    pos.bottom = (window.innerHeight - rect.top) + "px"
                }
            } else if (base == "over") {
                pos.left = rect.left + offsetX + "px"
                pos.top = rect.top + offsetY + "px"
            }

            return this.modal(content, {
                ...options,
                props: {
                    variant: "clear",
                    style: { position: "absolute", ...pos, minWidth: "unset", minHeight: "unset" },
                    ...options.props
                }
            })
        },
    })

    callback(DYNAMICS_EMITTER_KEY, emitter)

    return emitter
}

export function useOptionalDynamicsEmitter() {
    return inject(DYNAMICS_EMITTER_KEY, null)
}

export function useDynamicsEmitter() {
    const emitter = inject(DYNAMICS_EMITTER_KEY)
    if (!emitter) throw new Error("No dynamics emitter provided")
    return emitter
}

export const DynamicsEmitter = (defineComponent({
    name: "DynamicsEmitter",
    setup(props, ctx) {
        if (inject(DYNAMICS_EMITTER_KEY, null)) throw new Error("Multiple dynamics emitters")
        const { theme } = useTheme()
        const emitter = makeDynamicEmitter(theme, (key, emitter) => provide(key, emitter))

        return () => (
            <>
                {ctx.slots.default ? h(ctx.slots.default, { key: "main" }) : null}
                {emitter.modals.map(modal => <Modal {...modal.props} {...modal.controller.props} key={modal.id}>{{
                    default: () => typeof modal.content == "string" ? modal.content
                        : <modal.content {...modal.contentProps} />,
                    buttons: () => modal.buttons && <ButtonDefinitionRenderer definition={modal.buttons} close={(v = false) => modal.controller.close(v)} />
                }}</Modal>)}
            </>
        )
    }
}))
