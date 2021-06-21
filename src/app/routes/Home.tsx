import { mdiAlert, mdiBorderStyle, mdiLinkVariantOff, mdiTrashCan } from "@mdi/js"
import { defineComponent, ref, Transition } from "vue"
import { Button } from "../../vue3gui/Button"
import { useDraggable, useDropTarget, useFileDropTarget } from "../../vue3gui/dragAndDrop"
import { Icon } from "../../vue3gui/Icon"
import { LoadingIndicator } from "../../vue3gui/LoadingIndicator"
import { Overlay } from "../../vue3gui/Overlay"
import { Tabs, useTabs } from "../../vue3gui/Tabs"
import { TRANSITION_NAMES } from "../../vue3gui/util"
import { Variant } from "../../vue3gui/variants"

export const Home = defineComponent({
    name: "Home",
    setup(props, ctx) {
        const buttonsCounter = ref(0)

        const capitalize = (v: string) => v.replace(/^(.)/, v => v.toUpperCase())

        const tabs = useTabs({
            first: "First",
            second: "Second",
            third: "Third",
            long: "This is a long one!",
        })

        const draggable = useDraggable({ format: "vue3gui-drag" })
        const dropTarget = useDropTarget({ accept: "vue3gui-drag" })
        const lastFilesDropped = ref<string[]>([])
        const fileDropTarget = useFileDropTarget({ onDrop: v => lastFilesDropped.value = v.map(v => v.name) })
        const showOverlay = ref(false)
        const transitions = ref(false)

        return () => (
            <Overlay class="flex flex-fill" show={showOverlay.value}>{{
                default: () => <div class="pl-4 pb-5 scroll contain flex-fill">
                    <h1>Buttons</h1>
                    <div class="child-mb-2">
                        <div class="child-mr-2">
                            {Variant.LIST.map(variant => (<Button variant={variant} onClick={() => buttonsCounter.value++}>{capitalize(variant)}</Button>))}
                        </div>
                        <div class="child-mr-2">
                            {Variant.LIST.map(variant => (<Button variant={variant} clear onClick={() => buttonsCounter.value++}>{capitalize(variant)}</Button>))}
                        </div>
                        <div>Clicks: {buttonsCounter.value}</div>
                    </div>
                    <div class="flex row child-mr-5">
                        <div>
                            <h2>With href:</h2>
                            <Button href="https://www.github.com/bt7s7k7">My GitBub page</Button>
                        </div>
                        <div>
                            <h2>With router to:</h2>
                            <Button to="/link">Link test</Button>
                        </div>
                    </div>
                    <h1>Text colors</h1>
                    <div>
                        {Variant.LIST.map(variant => <div class={`text-${variant}`}>{variant}</div>)}
                    </div>
                    <h1>Icons</h1>
                    <p>
                        Using <code>@mdi/js</code>: <Icon icon={mdiAlert} /> <Icon icon={mdiLinkVariantOff} variant="success" /> <Icon icon={mdiBorderStyle} />
                    </p>
                    <p>
                        <Button variant="danger"> <Icon icon={mdiTrashCan} /> Delete </Button>
                    </p>
                    <h1>Loading indicator</h1>
                    <p>
                        <LoadingIndicator />
                    </p>
                    <h1>Tabs</h1>
                    <p>
                        <Tabs tabs={tabs} />
                        <small>State:</small> <code>{tabs.selected}</code>
                    </p>
                    <h1>{"Drag & Drop"}</h1>
                    <div class="flex row child-mr-2">
                        <div class="p-2 bg-primary" {...draggable.props}>
                            Drag: {draggable.dragged.toString()}
                        </div>
                        <div class="p-2 bg-danger" {...dropTarget.props}>
                            Over: {dropTarget.over.toString()}
                        </div>
                    </div>
                    <div class="flex row child-mr-2 center-cross mt-2">
                        <div class="p-2 bg-danger" {...fileDropTarget.props}>
                            File drop target
                        </div>
                        <div>Files: {JSON.stringify(lastFilesDropped.value)}</div>
                    </div>
                    <h1>{"Overlay"}</h1>
                    <Button onClick={() => showOverlay.value = true}>Show</Button>
                    <h1>Transitions</h1>
                    <div class="flex row">
                        <Button onClick={() => transitions.value = !transitions.value}>Toggle</Button>
                        <div class="ml-2">
                            <small>State:</small> <code>{transitions.value.toString()}</code>
                        </div>
                    </div>
                    <div class="flex row child-mr-2 h-50 center-cross">
                        {TRANSITION_NAMES.map((v, i) => <Transition key={v} name={"as-transition-" + v}>
                            {transitions.value && <div class="bg-success p-2">{v}</div>}
                        </Transition>)}
                    </div>
                </div>,
                overlay: () => <Button variant="primary" clear onClick={() => showOverlay.value = false}>Hide</Button>
            }}</Overlay>
        )
    }
})