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
            const { modelValue: _0, focus: _1, fieldProps: _2, required: _3, ...buttonProps } = props

            return (
                <Button {...buttonProps} nativeElement={"label"} class="px-0 pr-1">
                    <input
                        type="checkbox"
                        required={props.required}
                        disabled={disabled}
                        onChange={handleChanged}
                        checked={value.value}
                        ref={input}
                        {...props.fieldProps}
                    />
                    {renderSlot(ctx.slots, "default")}
                </Button>
            )
        }
    }
}))
