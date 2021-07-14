import { computed, defineComponent, PropType, Transition } from "vue"
import { LoadingIndicator } from "./LoadingIndicator"
import { StateInfo } from "./StateInfo"

const stateTypeLookup: Record<StateInfo["type"], Function> = {
    error: () => <div class="w-5-em h-5-em bg-danger circle flex center user-select-none"><b>!</b></div>,
    done: () => <div class="w-2-em h-2-em bg-success circle"></div>,
    working: () => <LoadingIndicator prewarm inline />
}

export const StateCard = (defineComponent({
    name: "StateCard",
    props: {
        state: {
            type: Object as PropType<{ type: StateInfo["type"], text: string }>,
        },
        error: { type: Boolean },
        working: { type: Boolean },
        done: { type: Boolean },
        textClass: { type: null }
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
                <div class="flex-basis-5-em">
                    <Transition name="as-transition-fade" mode="default">
                        <div key={type.value} class="absolute-fill flex center">
                            {stateTypeLookup[type.value]()}
                        </div>
                    </Transition>
                </div>
                &nbsp;
                <div class={[type.value == "error" && "text-danger", props.textClass]}>
                    {props.state?.text ?? ctx.slots.default?.()}
                </div>
            </div>
        )
    }
}))