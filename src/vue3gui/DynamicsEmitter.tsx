import { defineComponent, markRaw, PropType, reactive, Ref, ref, watch } from "vue"
import { Button } from "./Button"
import { Modal, useModal } from "./Modal"
import { StateCard } from "./StateCard"
import { StateInfo, useState } from "./StateInfo"
import { TextField } from "./TextField"
import { Theme } from "./Theme"
import { ComponentProps, useDebounce } from "./util"
import { Variant } from "./variants"

interface ModalDefinition {
    props: Omit<ComponentProps<typeof Modal>, keyof ReturnType<typeof useModal>["props"]>
    content: any
    controller: ReturnType<typeof useModal>
    id: number
    buttons: ButtonDefinition[]
}

interface BaseOptions {
    title?: string
    cancelable?: boolean
    props?: ModalDefinition["props"]
    buttons?: ModalDefinition["buttons"]
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

export function useDynamicEmitter() {

    return reactive({
        modal(content: ModalDefinition["content"], props: ModalDefinition["props"] = {}, buttons: ModalDefinition["buttons"] = []) {
            const controller = useModal()

            this.modals.push({ content: typeof content == "object" ? markRaw(content) : content, controller, props, id: nextID++, buttons })

            const promise = controller.open()

            // @ts-ignore
            promise.controller = controller

            return promise as Promise<boolean> & { controller: typeof controller }
        },
        prompt(options: PromptOptions = {}) {
            return new Promise<string | null>(resolve => {
                const result = ref<string>(options.initialValue ?? "")

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
                            watch(result, () => state!.working("Waiting for input"))

                            watch(() => state!.type, (type) => {
                                if (!options.verifierOptional) promise.controller.okBlocked = type != "done"
                            })
                        }

                        return () => (
                            <>
                                <div class="mb-3">{options.title ?? "Enter value"}</div>
                                <TextField focus onConfirm={() => promise.controller.close(true)} modelValue={result.value} onInput={v => result.value = v} />
                                {state && <StateCard class="mt-3" state={state} />}
                            </>
                        )
                    }
                })

                const promise = this.modal(component, {
                    okButton: true,
                    cancelButton: options.cancelable ?? true,
                    ...options.props,
                }, options.buttons)

                promise.then(ok => resolve(ok ? result.value : null))
            })
        },
        listPrompt<T extends any[]>(items: T, options: BaseOptions & { label: (v: T[number]) => string | string[] }) {
            return new Promise<T[number] | null>(resolve => {
                const result = ref(null) as Ref<T[number] | null>
                const itemList: { label: string[], value: T[number] }[] = items
                    .map(v => ({ label: options.label(v), value: v }))
                    .map(v => ({ value: v.value, label: typeof v.label == "string" ? [v.label] : v.label }))

                const component = defineComponent({
                    name: "ListPrompt",
                    setup: () => {
                        return () => <>
                            <div class="mb-3">{options.title ?? "Select value"}</div>
                            <div class={["border rounder scroll contain w-500 h-500 flex column", `border-${Theme.selected.border}`, `bg-${Theme.selected.inset}`]}>
                                {itemList.map(({ label, value }) => <Button onClick={() => { result.value = value; promise.controller.close(true) }} clear class="text-left flex row">
                                    {label.map(v => <div class="flex-fill">{v}</div>)}
                                </Button>)}
                            </div>
                        </>
                    }
                })

                const promise = this.modal(component, {
                    cancelButton: options.cancelable ?? true,
                    ...options.props,
                }, options.buttons)

                promise.then(ok => resolve(ok ? result.value : null))
            })
        },
        alert(content: ModalDefinition["content"], props: ModalDefinition["props"] = {}) {
            return this.modal(content, { ...props, cancelButton: "Close" })
        },
        modals: [] as ModalDefinition[]
    })
}

export const DynamicsEmitter = (defineComponent({
    name: "DynamicsEmitter",
    props: {
        emitter: {
            type: Object as PropType<ReturnType<typeof useDynamicEmitter>>,
            required: true
        }
    },
    setup(props, ctx) {
        return () => (
            <>
                {props.emitter?.modals.map(modal => <Modal {...modal.props} {...modal.controller.props} key={modal.id}>{{
                    default: () => typeof modal.content == "string" ? modal.content
                        : <modal.content />,
                    buttons: () => modal.buttons && <ButtonDefinitionRenderer definition={modal.buttons} close={(v = false) => modal.controller.close(v)} />
                }}</Modal>)}
            </>
        )
    }
}))
