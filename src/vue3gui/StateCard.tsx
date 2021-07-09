import { computed, defineComponent, PropType, Transition } from "vue"
import { LoadingIndicator } from "./LoadingIndicator"
import { StateInfo } from "./StateInfo"

const stateTypeLookup: Record<StateInfo["type"], Function> = {
    error: () => <div class="w-5 h-5 bg-danger circle flex center user-select-none"><b>!</b></div>,
    done: () => <div class="w-2 h-2 bg-success circle"></div>,
    working: () => <LoadingIndicator prewarm inline />
}

export const StateCard = (defineComponent({
    name: "StateCard",
    props: {
        state: {
            type: Object as PropType<StateInfo>,
        },
        error: { type: Boolean },
        working: { type: Boolean },
        done: { type: Boolean }
    },
    setup(props, ctx) {
        const type = computed<StateInfo["type"]>(() =>
            props.done ? "done"
                : props.error ? "error"
                    : props.working ? "working"
                        : props.state?.type ?? "working"
        )

        return () => (
            <div class="flex row">
                <div class="flex-basis-5 mr-2">
                    <Transition name="as-transition-fade" mode="default">
                        <div key={type.value} class="absolute-fill flex center">
                            {stateTypeLookup[type.value]()}
                        </div>
                    </Transition>
                </div>
                <div class={[type.value == "error" && "text-danger"]}>
                    {props.state?.text ?? ctx.slots.default?.()}
                </div>
            </div>
        )
    }
}))