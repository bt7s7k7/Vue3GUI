import { defineComponent, InputHTMLAttributes, onMounted, PropType, ref, watch } from "vue"
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
        focus: { type: Boolean },
        autoResize: { type: Boolean },
        placeholder: { type: String },
        clear: { type: Boolean },
        fieldProps: { type: Object as PropType<InputHTMLAttributes> }
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
            setTimeout(() => {
                if (props.autoResize && input.value) autoResize()
            }, 10)
        })

        watch(() => props.modelValue, (newValue) => {
            value.value = newValue
        })

        let measureElement: HTMLSpanElement | null = null
        const autoResize = () => {
            const inputElement = input.value!
            const container = inputElement.parentElement!

            if (!measureElement) measureElement = document.createElement("span")
            measureElement.innerText = value.value || "0"
            container.appendChild(measureElement)
            const width = measureElement.getBoundingClientRect().width
            container.removeChild(measureElement)

            container.style.width = `${width + 5}px`
        }

        watch(value, (value) => {
            ctx.emit("update:modelValue", value)
            ctx.emit("input", value)

            if (props.autoResize) {
                autoResize()
            }
        })

        return () => (
            <div class={["flex row as-text-field", !props.clear && `border-bottom border-${Theme.selected.border}`]}>
                <input
                    type={props.type}
                    onKeydown={e => (e.code == "Enter" || e.code == "NumpadEnter") && (ctx.emit("confirm", value.value), ctx.emit("change", value.value))}
                    onBlur={() => ctx.emit("change", value.value)}
                    v-model={value.value}
                    class="flex-fill"
                    ref={input}
                    size={1}
                    placeholder={props.placeholder}
                    {...props.fieldProps}
                />
                <div class={["focus-indicator", `bg-${props.variant}`]}></div>
            </div>
        )
    }
}))