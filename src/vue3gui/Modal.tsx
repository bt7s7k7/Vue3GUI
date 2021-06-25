import { computed, defineComponent, PropType, reactive, Transition } from "vue"
import { eventDecorator } from "../eventDecorator"
import { Button } from "./Button"
import { Overlay, OverlayProps } from "./Overlay"
import { Variant } from "./variants"

export const Modal = eventDecorator(defineComponent({
    name: "Modal",
    props: {
        ...OverlayProps.PROPS,
        background: {
            type: String as PropType<Variant>,
            default: "white"
        },
        cancelButton: {
            type: [Boolean, String]
        },
        okButton: {
            type: [Boolean, String]
        },
        backdropCancels: {
            type: Boolean
        },
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

        return () => <Overlay onBackdropClick={() => props.backdropCancels && ctx.emit("cancel")} {...overlayProps.value} fullScreen>
            <Transition name="as-transition-shrink" appear>
                <div class={[`bg-${props.background}`, "p-2 w-min-200 h-min-100 as-reset rounded", props.fill && "flex-fill"]} {...ctx.attrs}>
                    {ctx.slots.default?.()}
                    <div class="flex-fill"></div>
                    {(props.okButton || props.cancelButton) && <div class="flex row">
                        <div class="flex-fill"></div>
                        {ctx.slots.buttons?.()}
                        {props.okButton && <Button onClick={() => { ctx.emit("ok") }} clear>{typeof props.okButton == "string" ? props.okButton : "OK"}</Button>}
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
                ret.props.show = false
                resolve?.(false)
            },
            onOk: () => {
                ret.props.show = false
                resolve?.(true)
            }
        },
        open: () => {
            return new Promise<boolean>(v => {
                resolve = v
                ret.props.show = true
            })
        }
    })

    return ret
}