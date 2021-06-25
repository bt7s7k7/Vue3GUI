import { defineComponent, PropType, ref, Slot, Teleport, Transition } from "vue"
import { eventDecorator } from "../eventDecorator"
import { Variant } from "./variants"

export namespace OverlayProps {
    export const BASE_PROPS = {
        variant: {
            type: String as PropType<Variant>,
            default: "secondary"
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
        }
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
                    class={["absolute-fill flex", `bg-${props.variant}-transparent`, props.fill ? "column p-2" : "center"]}
                >
                    {content?.()}
                </div>}
            </Transition>
        )

        return () => {
            if (props.fullScreen) return (
                <Teleport to="body">
                    {drawOverlay(ctx.slots.default)}
                </Teleport>
            )
            else return (
                <div>
                    {ctx.slots.default?.()}
                    {drawOverlay(ctx.slots.overlay)}
                </div>
            )
        }
    }
}))