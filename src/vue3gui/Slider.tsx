import { InputHTMLAttributes, PropType, computed, defineComponent, onMounted, ref, watch } from "vue"
import { eventDecorator } from "../eventDecorator"
import { ProgressBar } from "./ProgressBar"
import { GrabMoveEvent, useGrab } from "./useGrab"
import { Variant } from "./variants"

export const Slider = eventDecorator(defineComponent({
    name: "Slider",
    props: {
        modelValue: { type: Number, default: 0 },
        variant: { type: String as PropType<Variant> },
        focus: { type: Boolean },
        fieldProps: { type: Object as PropType<InputHTMLAttributes> },
        disabled: { type: Boolean },
        min: { type: Number, default: 0 },
        max: { type: Number, default: 1 },
        step: { type: Number, default: 0.1 },
        stepped: { type: Boolean }
    },
    emits: {
        "update:modelValue": (value: number) => true,
        "input": (value: number) => true,
        "dragStart": () => true,
        "dragEnd": () => true
    },
    setup(props, ctx) {
        const value = ref(props.modelValue)
        const input = ref<HTMLInputElement>(null!)

        onMounted(() => {
            if (props.focus) input.value.focus()
        })

        watch(() => props.modelValue, (newValue) => {
            value.value = newValue
        })

        function update() {
            ctx.emit("update:modelValue", value.value)
            ctx.emit("input", value.value)
        }

        let rect: DOMRect = null!
        function handleStart(event: MouseEvent | TouchEvent) {
            input.value.focus()
            if (props.disabled) return
            rect = input.value.parentElement!.getBoundingClientRect()
            ctx.emit("dragStart")
            grab(event)
        }

        function handleUpdate(event: GrabMoveEvent) {
            let newValue = (event.currentX - rect.left) / rect.width
            if (newValue > 1) newValue = 1
            if (newValue < 0) newValue = 0

            const step = props.step / (props.max - props.min)

            if (props.stepped) {
                newValue = Math.round(newValue / step) * step
            }

            value.value = newValue * (props.max - props.min) + props.min
            update()
        }

        const grab = useGrab({
            onMoveStart: handleUpdate,
            onMove: handleUpdate,
            onMoveEnd() {
                ctx.emit("dragEnd")
            }
        })

        const steps = computed(() => {
            if (props.stepped == false) return []
            const step = props.step / (props.max - props.min)
            const count = Math.floor(1 / step)
            return Array.from({ length: count }, (_, i) => i / count)
        })

        return () => {
            const variant = props.variant ?? "primary"
            const progress = (value.value - props.min) / (props.max - props.min)

            return (
                <div
                    class={["as-slider inline-flex row center-cross", `text-${variant}`, props.disabled && "-disabled"]}
                    onMousedown={handleStart} onTouchstart={handleStart}
                >
                    <input
                        type="range" ref={input}
                        min={props.min} max={props.max} step={props.step} value={value.value}
                        onInput={() => (value.value = +input.value.value, update())}
                        class="ignored absolute"
                        disabled={props.disabled}
                    />
                    <ProgressBar
                        progress={progress} inline filler
                        variant={variant} class="flex-fill"
                    />
                    {steps.value.map(step => (
                        <div class={["-progress -step", step > progress ? "bg-text" : `bg-default`]} style={`---progress: ${step}`}></div>
                    ))}
                    <div class={["-handle -progress circle bg-text"]} style={`---progress: ${progress}`} />
                </div>
            )
        }
    }
}))
