import { computed, defineComponent, InputHTMLAttributes, onMounted, PropType, ref, watch } from "vue"
import { eventDecorator } from "../eventDecorator"
import { Variant } from "./variants"
import { useTheme } from "./vue3gui"

export const TextField = eventDecorator(defineComponent({
    name: "TextField",
    props: {
        modelValue: {
            type: String,
            default: ""
        },
        type: {
            type: String as PropType<"text" | "number" | "password" | "email" | "date" | "datetime-local" | "month" | "tel" | "url" | "time" | "week">,
            default: "text"
        },
        variant: {
            type: String as PropType<Variant>,
        },
        focus: { type: Boolean },
        autoResize: { type: Boolean },
        placeholder: { type: String },
        autocomplete: { type: String },
        clear: { type: Boolean },
        noIndicator: { type: Boolean },
        fieldProps: { type: Object as PropType<InputHTMLAttributes> },
        disabled: { type: Boolean },
        borderVariant: { type: String as PropType<Variant> },
        plain: { type: Boolean },
        label: { type: String },
        alwaysHighlight: { type: Boolean },
        pattern: { type: String },
        error: { type: String },
        validate: { type: Boolean },
        errorOverride: { type: String },
        min: { type: [Number, String] },
        max: { type: [Number, String] },
        step: { type: [Number, String] },
    },
    emits: {
        "update:modelValue": (value: string) => true,
        "input": (value: string) => true,
        "confirm": (value: string) => true,
        "change": (value: string) => true,
        "blur": () => true,
        "focus": () => true
    },
    setup(props, ctx) {
        const { theme } = useTheme()

        const value = ref(props.modelValue)
        const input = ref<HTMLInputElement>()
        let computedStyle: any = null!

        const selfError = ref("")
        const error = computed(() => props.error ?? selfError.value)

        ctx.expose({ input })

        onMounted(() => {
            if (props.focus) input.value!.focus()
            if ("computedStyleMap" in input.value!) computedStyle = (input.value as any).computedStyleMap()
            setTimeout(() => {
                if (props.autoResize && input.value) autoResize()
            }, 10)
        })

        watch(() => props.modelValue, (newValue) => {
            value.value = newValue
            if (props.autoResize) autoResize()
        })

        let measureElement: HTMLSpanElement | null = null
        const autoResize = () => {
            const inputElement = input.value!
            const container = inputElement.parentElement!

            if (!measureElement) {
                measureElement = document.createElement("span")
                measureElement.classList.add("nowrap")
            }

            measureElement.innerText = value.value || props.placeholder || "0"
            if (computedStyle != null) {
                measureElement.style.fontSize = computedStyle.get("font-size") as any
                measureElement.style.padding = computedStyle.get("padding") as any
            }

            container.appendChild(measureElement)
            const width = measureElement.getBoundingClientRect().width
            container.removeChild(measureElement)

            container.style.width = `${width + 5}px`
        }

        watch(value, (value, oldValue) => {
            if (value == oldValue) return
            ctx.emit("update:modelValue", value)
            ctx.emit("input", value)

            if (props.validate) {
                const invalid = input.value!.validationMessage
                if (invalid) {
                    selfError.value = props.errorOverride ?? invalid
                } else {
                    selfError.value = ""
                }
            }

            if (props.autoResize) {
                autoResize()
            }
        })

        watch(() => props.autoResize, enabled => enabled && autoResize())

        function keydown(event: KeyboardEvent) {
            const newValue = (event.target as HTMLInputElement).value
            if (newValue != value.value) value.value = newValue

            if (event.code == "Enter" || event.code == "NumpadEnter") {
                ctx.emit("confirm", value.value)
                ctx.emit("change", value.value)
            }
        }

        return () => {
            const always = props.alwaysHighlight || error.value != ""
            const highlight = error.value != "" ? "danger" : props.variant ?? theme.value.highlight
            const hasLabel = props.label != null || error.value != "" || props.validate
            const showLabel = hasLabel && (!!props.label || error.value != "")
            const label = error.value || props.label

            return (
                <div
                    class={[
                        "flex row as-text-field",
                        !props.clear && !props.plain && `border-bottom border-${props.borderVariant ?? theme.value.border}`,
                        props.plain && "-plain",
                        showLabel && "-show-label",
                        always && "-always"
                    ]}
                    style={[props.plain || hasLabel ? `--text-field-color: var(--bg-${highlight})` : ""]}
                >
                    <input
                        type={props.type}
                        onKeydown={keydown}
                        onBlur={() => { ctx.emit("change", value.value); ctx.emit("blur") }}
                        onFocus={() => ctx.emit("focus")}
                        v-model={value.value}
                        class="flex-fill"
                        ref={input}
                        size={1}
                        placeholder={props.placeholder}
                        autocomplete={props.autocomplete}
                        disabled={props.disabled}
                        pattern={props.pattern}
                        min={props.min}
                        max={props.max}
                        step={props.step}
                        {...props.fieldProps}
                    />
                    {ctx.slots.default?.()}
                    {!props.noIndicator && !props.disabled && !props.plain && <div class={["focus-indicator", `border-${highlight}`]}></div>}
                    {hasLabel && <div class={["-label", `text-${highlight}`]}>{label}</div>}
                </div>
            )
        }
    }
}))
