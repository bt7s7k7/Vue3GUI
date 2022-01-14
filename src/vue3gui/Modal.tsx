import { ComponentInternalInstance, computed, defineComponent, getCurrentInstance, onUnmounted, PropType, reactive, Transition, watch } from "vue"
import { eventDecorator } from "../eventDecorator"
import { Button } from "./Button"
import { Overlay, OverlayProps } from "./Overlay"
import { Theme } from "./Theme"
import { Variant } from "./variants"

export const Modal = eventDecorator(defineComponent({
    name: "Modal",
    props: {
        ...OverlayProps.PROPS,
        background: {
            type: String as PropType<Variant>,
            default: () => Theme.selected.background
        },
        cancelButton: {
            type: [Boolean, String]
        },
        okButton: {
            type: [Boolean, String]
        },
        backdropCancels: {
            type: null as unknown as PropType<undefined | boolean | null>,
            default: null
        },
        contentClass: { type: null }
    },
    inheritAttrs: false,
    emits: {
        cancel: () => true,
        ok: () => true
    },
    setup(props, ctx) {
        const overlayProps = computed(() => {
            const { background, cancelButton, okButton, backdropCancels, contentClass, ...ret } = props
            return ret
        })

        const backdropCancels = computed(() => {
            if (props.backdropCancels === true) return true
            if (props.backdropCancels == null) return !!props.cancelButton
            if (props.backdropCancels === false) return false
        })

        const instance = getCurrentInstance()
        if (instance) {
            const root = instance.root as unknown as { "__v3g_modalStack": { stack: ComponentInternalInstance[], handled: boolean } }
            if (root["__v3g_modalStack"] == null) {
                root["__v3g_modalStack"] = { stack: [], handled: false }
            }
            const modalStack = root["__v3g_modalStack"]

            const handler = (event: KeyboardEvent) => {
                if (modalStack.handled) return

                // @ts-ignore
                if (event.target?.tagName?.toLowerCase() == "textarea") return

                if (modalStack.handled || instance != modalStack.stack[modalStack.stack.length - 1]) return

                if (
                    (props.okButton && event.code == "Enter" || event.code == "NumpadEnter") ||
                    (backdropCancels.value && (event.code == "Escape" || event.code == "Enter" || event.code == "NumpadEnter"))
                ) {
                    modalStack.handled = true
                    if (event.code == "Enter" || event.code == "NumpadEnter") ctx.emit("ok")
                    else ctx.emit("cancel")
                    event.preventDefault()
                    event.stopPropagation()
                    setTimeout(() => {
                        modalStack.handled = false
                    }, 10)

                    return
                }
            }

            watch(() => props.show, (show, oldValue) => {
                if (show == oldValue) return

                const index = modalStack.stack.indexOf(instance)

                if (show) {
                    if (index != -1) throw new Error("Duplicate addition of modal on stack")
                    window.addEventListener("keydown", handler)
                    modalStack.stack.push(instance)
                } else {
                    if (index == -1) return
                    window.removeEventListener("keydown", handler)
                    modalStack.stack.splice(index, 1)
                }
            }, { immediate: true })

            onUnmounted(() => {
            })
        }

        const cancel = () => ctx.emit("cancel")

        return () => <Overlay onBackdropClick={() => backdropCancels.value && ctx.emit("cancel")} {...overlayProps.value} fullScreen>
            <Transition name={overlayProps.value.noTransition ? undefined : "as-transition-shrink"} appear>
                <div class={[`bg-${props.background}`, "p-2 w-min-200 h-min-100 as-reset rounded", props.fill && "flex-fill"]} {...ctx.attrs}>
                    <div class={["flex-fill flex column", props.contentClass]}>
                        {ctx.slots.default?.()}
                    </div>
                    {(props.okButton || props.cancelButton) && <div class="flex row">
                        {ctx.slots.buttonsLeft?.()}
                        <div class="flex-fill"></div>
                        {ctx.slots.buttons?.(cancel)}
                        {props.okButton && <Button class="text-primary" variant="primary" onClick={() => { ctx.emit("ok") }} clear>{typeof props.okButton == "string" ? props.okButton : "OK"}</Button>}
                        {props.cancelButton && <Button onClick={cancel} clear>{typeof props.cancelButton == "string" ? props.cancelButton : "Cancel"}</Button>}
                    </div>}
                </div>
            </Transition>
        </Overlay>
    }
}))

export function useModal(options: { show?: boolean } = {}) {
    let resolve: ((v: boolean) => void) | null = null

    const ret = reactive({
        props: {
            show: options.show ?? false,
            onCancel: () => {
                ret.close(false)
            },
            onOk: () => {
                if (ret.okBlocked) return
                ret.close(true)
            }
        },
        open: () => {
            return new Promise<boolean>(v => {
                resolve = v
                ret.props.show = true
            })
        },
        okBlocked: false,
        close: (success = false) => {
            ret.props.show = false
            resolve?.(success)
            resolve = null
        }
    })

    return ret
}

export type ModalController = ReturnType<typeof useModal>