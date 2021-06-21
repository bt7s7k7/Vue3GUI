import { defineComponent, PropType, Transition } from "vue"
import { Variant } from "./variants"

export const Overlay = (defineComponent({
    name: "Overlay",
    props: {
        show: {
            type: Boolean,
            required: false
        },
        variant: {
            type: String as PropType<Variant>,
            default: "secondary"
        },
        noTransition: {
            type: Boolean
        },
        styleOnly: {
            type: Boolean
        }
    },
    setup(props, ctx) {
        return () => (
            <div>
                {ctx.slots.default?.()}
                {
                    props.styleOnly ? <div class={["absolute-fill flex center", `bg-${props.variant}-transparent`, !props.show && "hidden"]}>
                        {ctx.slots.overlay?.()}
                    </div>
                        : <Transition name={!props.noTransition ? "as-transition-fade" : undefined}>
                            {props.show && <div class={["absolute-fill flex center", `bg-${props.variant}-transparent`]}>
                                {ctx.slots.overlay?.()}
                            </div>}
                        </Transition>
                }
            </div>
        )
    }
}))