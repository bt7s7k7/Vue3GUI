import { defineComponent, markRaw, PropType, reactive, ref } from "vue"
import { Modal, useModal } from "./Modal"
import { StateInfo } from "./StateInfo"
import { TextField } from "./TextField"
import { ComponentProps } from "./util"

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
    checker?: (value: string, state: StateInfo) => void | Promise<void>,
    checkerDebounce?: number
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
                        return () => (
                            <>
                                <div>{options.title ?? "Enter value"}</div>
                                <TextField focus onConfirm={() => promise.controller.close(true)} modelValue={result.value} onInput={v => result.value = v} />
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
