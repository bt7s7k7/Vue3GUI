import { defineComponent, PropType, ref, watch } from "vue"
import { eventDecorator } from "../eventDecorator"
import { Variant } from "./variants"

export const TextField = eventDecorator(defineComponent({
    name: "TextField",
    props: {
        modelValue: {
            type: String,
            default: ""
        },
        type: {
            type: String as PropType<"text" | "number" | "password" | "email">,
            default: "text"
        },
        variant: {
            type: String as PropType<Variant>,
            default: "primary"
        }
    },
    emits: {
        "update:modelValue": (value: string) => true,
        "input": (value: string) => true,
        "confirm": (value: string) => true
    },
    setup(props, ctx) {
        const value = ref(props.modelValue)

        watch(() => props.modelValue, (newValue) => {
            value.value = newValue
        })

        watch(value, (value) => {
            ctx.emit("update:modelValue", value)
            ctx.emit("input", value)
        })

        return () => (
            <div class="flex row as-text-field">
                <input
                    type={props.type}
                    onKeydown={e => e.code == "Enter" && ctx.emit("confirm", value.value)}
                    onBlur={() => ctx.emit("confirm", value.value)}
                    v-model={value.value}
                    class="flex-fill"
                />
                <div class={["focus-indicator", `bg-${props.variant}`]}></div>
            </div>
        )
    }
}))