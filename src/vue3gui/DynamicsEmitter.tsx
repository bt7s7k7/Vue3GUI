import { defineComponent, markRaw, PropType, reactive, ref, watch } from "vue"
import { Modal, useModal } from "./Modal"
import { StateCard } from "./StateCard"
import { StateInfo, useState } from "./StateInfo"
import { TextField } from "./TextField"
import { ComponentProps, useDebounce } from "./util"

interface ModalDefinition {
    props: Omit<ComponentProps<typeof Modal>, keyof ReturnType<typeof useModal>["props"]>
    content: any
    controller: ReturnType<typeof useModal>
    id: number
}

interface PromptOptions {
    cancelable?: boolean,
    initialValue?: string,
    props?: ModalDefinition["props"],
    title?: string,
    verifier?: (value: string, state: StateInfo) => void | Promise<void>,
    verifierDebounce?: number,
    verifierOptional?: boolean
}

let nextID = 0

export function useDynamicEmitter() {

    return reactive({
        modal(content: ModalDefinition["content"], props: ModalDefinition["props"] = {}) {
            const controller = useModal()

            this.modals.push({ content: typeof content == "object" ? markRaw(content) : content, controller, props, id: nextID++ })

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

                            const value = useDebounce(result, { delay: options.verifierDebounce ?? 100 })
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
                                    })
                                }

                            }

                            watch(value, check, { immediate: true })

                            watch(() => state!.type, (type) => {
                                if (!options.verifierOptional) promise.controller.okBlocked = type != "done"
                            })
                        }

                        return () => (
                            <>
                                <div>{options.title ?? "Enter value"}</div>
                                <TextField focus onConfirm={() => promise.controller.close(true)} modelValue={result.value} onInput={v => result.value = v} />
                                {state && <StateCard state={state} />}
                            </>
                        )
                    }
                })

                const promise = this.modal(component, {
                    okButton: true,
                    cancelButton: options.cancelable ?? true,
                    ...options.props,
                })

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
                {props.emitter?.modals.map(modal => <Modal {...modal.props} {...modal.controller.props} key={modal.id}>
                    {
                        typeof modal.content == "string" ? modal.content
                            : <modal.content />
                    }
                </Modal>)}
            </>
        )
    }
}))
