import { defineComponent, nextTick, PropType, ref, shallowReactive, watch } from "vue"
import { eventDecorator } from "../eventDecorator"
import { Theme } from "./Theme"
import { useEventListener } from "./util"

interface SliderHookOptions {
    direction: "horizontal" | "vertical"
    pivot: "start" | "end"
    initialValue: number
    onUpdate?: (value: number) => void
    onChange?: (value: number) => void
    onError?: (error: number) => void
}

export function useSlider(options: SliderHookOptions) {
    const slider = ref<HTMLDivElement>()
    const container = ref<HTMLDivElement>()
    const value = ref(options.initialValue)

    const dragging = ref<{
        startPos: number
        initialValue: number
        containerSize: number
        containerPos: number
        initialError: number
    } | null>(null)

    const direction = options.direction == "vertical" ? { type: "column", eventProp: "clientY", size: "height", axis: "y", cursor: "row-resize" } as const
        : { type: "row", eventProp: "clientX", size: "width", axis: "x", cursor: "col-resize" } as const

    useEventListener(window, "mousemove", (event) => {
        if (dragging.value) {
            update(processEvent(event))
        }
    })

    useEventListener(window, "mouseup", (event) => {
        if (dragging.value) {
            update(processEvent(event), "final")
        }
    })

    const processEvent = (event: MouseEvent) => event[direction.eventProp]

    const initDrag = (startPos: number) => {
        const containerRect = container.value!.getBoundingClientRect()
        dragging.value = {
            startPos: startPos,
            initialValue: value.value,
            containerSize: containerRect[direction.size],
            containerPos: containerRect[direction.axis],
            initialError: 0
        }
    }

    const start = (event: MouseEvent) => {
        event.preventDefault()

        initDrag(0)
        update(0, "final", () => {
            const startPos = processEvent(event)
            initDrag(startPos)
            update(startPos, "initial")
        })
    }

    const update = (pos: number, type: "initial" | "final" | "normal" = "normal", callback: (() => void) | null = null) => {
        const { initialValue, containerSize, startPos, containerPos, initialError } = dragging.value!

        const offset = pos - startPos

        let newValue = options.pivot == "start" ? initialValue + offset
            : initialValue - offset


        value.value = newValue + initialError
        options.onUpdate?.(value.value)

        nextTick(() => {
            let actualValue = (slider.value!.getBoundingClientRect()[direction.axis] - containerPos)

            if (options.pivot == "end") actualValue = containerSize - actualValue

            let error = value.value - actualValue - dragging.value!.initialError

            if (type == "initial") {
                dragging.value!.initialError = error
                value.value += error
            }

            options.onError?.(error)

            if (type == "final") {
                value.value -= error
                dragging.value = null

                options.onChange?.(value.value)
            }


            callback?.()
        })
    }

    const ret = shallowReactive({
        startProps: { class: "", style: { flexBasis: `` as string | undefined } },
        endProps: { class: "", style: { flexBasis: `` as string | undefined } },
        setValue: (newValue: number) => { value.value = newValue },
        direction,
        container: container,
        slider,
        start
    })

    watch(value, value => {
        if (options.pivot == "start") {
            ret.startProps = { class: "flex row", style: { flexBasis: `${value}px` } }
            ret.endProps = { class: "flex-fill flex row", style: { flexBasis: undefined } }
        } else {
            ret.startProps = { class: "flex-fill flex row", style: { flexBasis: undefined } }
            ret.endProps = { class: "flex row", style: { flexBasis: `${value}px` } }
        }
    })

    return ret
}

export const Slider = eventDecorator(defineComponent({
    name: "Slider",
    props: {
        horizontal: { type: Boolean },
        vertical: { type: Boolean },
        type: { type: String as PropType<"start" | "end">, default: "start" },
        initialValue: {
            type: Number,
            default: 0
        }
    },
    emits: {
        "input": (value: number) => true,
        "changed": (value: number) => true,
        "error": (error: number) => true
    },
    setup(props, ctx) {

        const slider = useSlider({
            direction: props.horizontal ? "horizontal" : "vertical",
            initialValue: props.initialValue,
            pivot: props.type,
            onChange: v => ctx.emit("changed", v),
            onUpdate: v => ctx.emit("input", v),
            onError: v => ctx.emit("error", v)
        })

        return () => (
            <div class={["flex", slider.direction.type]} ref={slider.container}>
                <div {...slider.startProps}>
                    {ctx.slots.start?.()}
                </div>
                <div class={`bg-${Theme.selected.object}`} style={{ flexBasis: "2px", cursor: slider.direction.cursor }} onMousedown={slider.start} ref={slider.slider}></div>
                <div {...slider.endProps}>
                    {ctx.slots.end?.()}
                </div>
            </div>
        )
    }
}))