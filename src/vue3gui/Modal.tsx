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
            type: Boolean
        }
    },
    inheritAttrs: false,
    emits: {
        cancel: () => true,
        ok: () => true
    },
    setup(props, ctx) {
        const overlayProps = computed(() => {
            const { background, cancelButton, okButton, backdropCancels, ...ret } = props
            return ret
        })

        const instance = getCurrentInstance()
        if (instance) {
            const root = instance.root as unknown as { "__v3g_modalStack": { stack: ComponentInternalInstance[], handled: boolean } }
            if (root["__v3g_modalStack"] == null) {
                root["__v3g_modalStack"] = { stack: [], handled: false }
            }
            const modalStack = root["__v3g_modalStack"]

            const handler = (event: KeyboardEvent) => {
                // @ts-ignore
                if (event.target?.tagName?.toLowerCase() == "input" || event.target?.tagName?.toLowerCase() == "textarea") return

                if (modalStack.handled || instance != modalStack.stack[modalStack.stack.length - 1]) return

                if (event.code == "Enter" && props.okButton) {
                    modalStack.handled = true
                    ctx.emit("ok")
                    setTimeout(() => {
                        modalStack.handled = false
                    }, 10)

                    return
                }

                if ((props.backdropCancels || props.cancelButton) && (event.code == "Escape" || event.code == "Enter")) {
                    modalStack.handled = true
                    ctx.emit("cancel")
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

        return () => <Overlay onBackdropClick={() => props.backdropCancels && ctx.emit("cancel")} {...overlayProps.value} fullScreen>
            <Transition name="as-transition-shrink" appear>
                <div class={[`bg-${props.background}`, "p-2 w-min-200 h-min-100 as-reset rounded", props.fill && "flex-fill"]} {...ctx.attrs}>
                    {ctx.slots.default?.()}
                    <div class="flex-fill"></div>
                    {(props.okButton || props.cancelButton) && <div class="flex row">
                        {ctx.slots.buttonsLeft?.()}
                        <div class="flex-fill"></div>
                        {ctx.slots.buttons?.()}
                        {props.okButton && <Button class="text-primary" variant="primary" onClick={() => { ctx.emit("ok") }} clear>{typeof props.okButton == "string" ? props.okButton : "OK"}</Button>}
                        {props.cancelButton && <Button onClick={() => { ctx.emit("cancel") }} clear>{typeof props.cancelButton == "string" ? props.cancelButton : "Cancel"}</Button>}
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