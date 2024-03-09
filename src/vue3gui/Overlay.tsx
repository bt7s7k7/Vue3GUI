import { defineComponent, h, PropType, ref, Slot, Teleport, Transition } from "vue"
import { eventDecorator } from "../eventDecorator"
import { LoadingIndicator } from "./LoadingIndicator"
import { Variant } from "./variants"

export namespace OverlayProps {
    export const BASE_PROPS = {
        variant: {
            type: String as PropType<Variant | "clear">,
        },
        noTransition: {
            type: Boolean
        },
        fill: {
            type: Boolean
        },
        transition: {
            type: String
        }
    }

    export const PROPS = {
        ...BASE_PROPS,
        show: {
            type: Boolean,
            required: false
        }
    }

    export const EXTENDED_PROPS = {
        ...PROPS,
        fullScreen: {
            type: Boolean
        },
        overlayClass: { type: null },
        tag: { type: String, default: () => "div" },
        loading: { type: Boolean }
    }
}

export const Overlay = eventDecorator(defineComponent({
    name: "Overlay",
    props: OverlayProps.EXTENDED_PROPS,
    emits: {
        backdropClick: () => true
    },
    setup(props, ctx) {
        const backdrop = ref<HTMLDivElement>()

        const drawOverlay = (content: Slot | undefined) => (
            <Transition name={!props.noTransition ? (props.transition ?? "as-transition-fade") : undefined}>
                {props.show && <div
                    ref={backdrop}
                    onClick={event => event.target == backdrop.value && ctx.emit("backdropClick")}
                    style="pointer-events: auto; z-index: 20"
                    class={[
                        props.overlayClass, "flex",
                        props.variant != "clear" && `bg-${props.variant ?? "black"}-transparent`,
                        props.fill ? "column p-2" : "center",
                        props.fullScreen ? "as-fullscreen-overlay as-reset" : "absolute-fill"
                    ]}
                >
                    {content?.() ?? (props.loading ? <LoadingIndicator /> : null)}
                </div>}
            </Transition>
        )

        return () => {
            if (props.fullScreen) return (
                <Teleport to={Overlay.fullScreenTarget}>
                    {drawOverlay(ctx.slots.default)}
                </Teleport>
            )
            else return (
                h(props.tag, {}, [
                    ctx.slots.default?.(),
                    drawOverlay(ctx.slots.overlay)
                ])
            )
        }
    }
}))

Overlay.fullScreenTarget = "body"
