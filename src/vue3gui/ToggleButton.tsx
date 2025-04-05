import { defineComponent, inject, InputHTMLAttributes, onMounted, PropType, ref, renderSlot, watch } from "vue"
import { eventDecorator } from "../eventDecorator"
import { Button, ButtonProps } from "./Button"

export const ToggleButton = eventDecorator(defineComponent({
    name: "ToggleButton",
    props: {
        modelValue: { type: Boolean, default: false },
        focus: { type: Boolean },
        fieldProps: { type: Object as PropType<InputHTMLAttributes> },
        required: { type: Boolean },
        enabledStyle: { type: Object as PropType<ButtonProps.Style & { class?: any, style?: any }> },
        ...ButtonProps.FUNCTION,
        ...ButtonProps.STYLE,
    },
    emits: {
        "update:modelValue": (value: boolean) => true,
        "change": (value: boolean) => true,
    },
    setup(props, ctx) {
        const value = ref(props.modelValue)
        const input = ref<HTMLInputElement>()

        ctx.expose({ input })

        onMounted(() => {
            if (props.focus) input.value!.focus()
        })

        watch(() => props.modelValue, (newValue) => {
            value.value = newValue
        })

        watch(value, (value, oldValue) => {
            if (value == oldValue) return

            ctx.emit("update:modelValue", value)
            ctx.emit("change", value)
        })

        function handleChanged(event: Event) {
            const newValue = (event.target as HTMLInputElement).checked
            if (newValue != value.value) value.value = newValue
        }

        const inherited = inject(ButtonProps.GROUP_SYMBOL, undefined)?.props

        return () => {
            const disabled = props.disabled || inherited?.disabled
            const { modelValue: _0, focus: _1, fieldProps, required, enabledStyle, ...buttonProps } = props
            const renderCheckbox = enabledStyle == null

            return (
                <Button
                    {...buttonProps} nativeElement={"label"} class="px-1 gap-1 flex row center-cross"
                    {...(enabledStyle != null && value.value ? enabledStyle : undefined)}
                >
                    <input
                        class={renderCheckbox ? "m-0" : "hidden"}
                        type="checkbox"
                        required={required}
                        disabled={disabled}
                        onChange={handleChanged}
                        checked={value.value}
                        ref={input}
                        {...fieldProps}
                    />
                    {renderSlot(ctx.slots, "default")}
                </Button>
            )
        }
    }
}))
