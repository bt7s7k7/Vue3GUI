import { defineComponent, h, PropType, ref, Slot, Teleport, Transition } from "vue"
import { eventDecorator } from "../eventDecorator"
import { Theme } from "./Theme"
import { Variant } from "./variants"

export namespace OverlayProps {
    export const BASE_PROPS = {
        variant: {
            type: String as PropType<Variant | "clear">,
            default: () => Theme.selected.overlay
        },
        noTransition: {
            type: Boolean
        },
        fill: {
            type: Boolean
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
        tag: { type: String, default: () => "div" }
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
            <Transition name={!props.noTransition ? "as-transition-fade" : undefined}>
                {props.show && <div
                    ref={backdrop}
                    onClick={event => event.target == backdrop.value && ctx.emit("backdropClick")}
                    style="pointer-events: auto; z-index: 20"
                    class={["absolute-fill flex", props.variant != "clear" && `bg-${props.variant}-transparent`, props.fill ? "column p-2" : "center", props.overlayClass]}
                >
                    {content?.()}
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