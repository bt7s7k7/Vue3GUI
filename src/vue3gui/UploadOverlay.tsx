import { defineComponent, ref, Transition, watch } from "vue"
import { eventDecorator } from "../eventDecorator"
import { useFileDropTarget } from "./dragAndDrop"
import { Overlay, OverlayProps } from "./Overlay"

export const UploadOverlay = eventDecorator(defineComponent({
    name: "UploadOverlay",
    emits: {
        drop: (files: File[], raw: FileList) => true,
    },
    props: OverlayProps.BASE_PROPS,
    setup(props, ctx) {

        const fileDropTarget = useFileDropTarget({ onDrop: (v, w) => ctx.emit("drop", v, w) })

        const show = ref(false)
        const showChildren = ref(false)

        watch(() => fileDropTarget.over, (over) => {
            show.value = over
            setTimeout(() => showChildren.value = over, 10)
        })

        return () => (
            <Overlay overlayClass="ignored" show={show.value} {...fileDropTarget.props} {...props}>{{
                default: ctx.slots.default ?? (() => <div></div>),
                overlay: () => <div class="as-upload-overlay absolute-fill">
                    <div class="absolute-fill flex center arrow-1">
                        <Transition name="as-transition-slide-down">
                            {showChildren.value && <div></div>}
                        </Transition>
                    </div>
                    <div class="absolute-fill flex center arrow-2">
                        <Transition name="as-transition-slide-down">
                            {showChildren.value && <div></div>}
                        </Transition>
                    </div>
                    <div class="absolute-fill flex center arrow-3">
                        <Transition name="as-transition-slide-down">
                            {showChildren.value && <div></div>}
                        </Transition>
                    </div>
                </div>,
            }}</Overlay>
        )
    },
}))
