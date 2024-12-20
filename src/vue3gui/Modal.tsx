import { ComponentInternalInstance, computed, defineComponent, getCurrentInstance, onUnmounted, PropType, reactive, Transition, watch } from "vue"
import { eventDecorator } from "../eventDecorator"
import { Button } from "./Button"
import { Overlay, OverlayProps } from "./Overlay"
import { Variant } from "./variants"

export const Modal = eventDecorator(defineComponent({
    name: "Modal",
    props: {
        ...OverlayProps.PROPS,
        background: {
            type: String as PropType<Variant | "clear">,
        },
        cancelButton: {
            type: [Boolean, String],
        },
        okButton: {
            type: [Boolean, String],
        },
        backdropCancels: {
            type: null as unknown as PropType<undefined | boolean | null>,
            default: null,
        },
        ignoreEnter: { type: Boolean },
        contentClass: { type: null },
        noDefaultStyle: { type: Boolean },
        contain: { type: Boolean },
    },
    inheritAttrs: false,
    emits: {
        cancel: () => true,
        ok: () => true,
        mounted: (element: HTMLDivElement) => true,
    },
    setup(props, ctx) {
        const overlayProps = computed(() => {
            const { background, cancelButton, okButton, backdropCancels, contentClass, noDefaultStyle, ignoreEnter, contain, ...ret } = props
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

                const isEnter = event.code == "Enter" || event.code == "NumpadEnter"
                if (props.ignoreEnter) return

                if (
                    (props.okButton && isEnter) ||
                    (backdropCancels.value && (event.code == "Escape" || isEnter))
                ) {
                    if (event.target instanceof HTMLInputElement && event.target.form != null) {
                        return
                    }

                    modalStack.handled = true
                    if (isEnter) ctx.emit("ok")
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

        let mounted = false
        function notify(element: any) {
            if (mounted) return
            ctx.emit("mounted", element)
            mounted = true
        }

        const cancel = () => ctx.emit("cancel")

        return () => <Overlay onBackdropClick={() => backdropCancels.value && ctx.emit("cancel")} {...overlayProps.value} fullScreen>
            <Transition name={overlayProps.value.noTransition ? undefined : (overlayProps.value.transition ?? "as-transition-shrink")} appear>
                <div
                    class={[
                        props.background ? `bg-${props.background}` : "bg-default",
                        !props.noDefaultStyle && "p-2 w-min-200 h-min-100 as-reset rounded w-max-fill",
                        props.fill && "flex-fill",
                        props.contain && "as-overlay-contain",
                    ]}
                    {...ctx.attrs}
                    ref={notify}
                >
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
    },
}))

export function useModal(options: { show?: boolean, onMounted?: (element: HTMLElement) => void } = {}) {
    let resolve: ((v: boolean) => void) | null = null

    const ret = reactive({
        element: null! as HTMLElement,
        props: {
            show: options.show ?? false,
            onCancel: () => {
                ret.close(false)
            },
            onOk: () => {
                if (ret.okBlocked) return
                ret.close(true)
            },
            onMounted: (element: any) => {
                ret.element = element
                options?.onMounted?.(element)
            },
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
        },
    })

    return ret
}

export type ModalController = ReturnType<typeof useModal>
