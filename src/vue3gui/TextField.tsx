import { defineComponent, onMounted, PropType, ref, watch } from "vue"
import { eventDecorator } from "../eventDecorator"
import { Theme } from "./Theme"
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
            default: () => Theme.selected.highlight
        },
        focus: { type: Boolean }
    },
    emits: {
        "update:modelValue": (value: string) => true,
        "input": (value: string) => true,
        "confirm": (value: string) => true,
        "change": (value: string) => true,
    },
    setup(props, ctx) {
        const value = ref(props.modelValue)
        const input = ref<HTMLInputElement>()

        onMounted(() => {
            if (props.focus) input.value?.focus()
        })

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
                    onKeydown={e => e.code == "Enter" && (ctx.emit("confirm", value.value), ctx.emit("change", value.value))}
                    onBlur={() => ctx.emit("change", value.value)}
                    v-model={value.value}
                    class="flex-fill"
                    ref={input}
                />
                <div class={["focus-indicator", `bg-${props.variant}`]}></div>
            </div>
        )
    }
}))