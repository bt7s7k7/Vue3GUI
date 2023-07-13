import { mdiAlert, mdiBorderStyle, mdiLinkVariantOff, mdiTrashCan } from "@mdi/js"
import { Transition, defineComponent, onUnmounted, ref } from "vue"
import { Button } from "../../vue3gui/Button"
import { Circle } from "../../vue3gui/Circle"
import { useDynamicsEmitter } from "../../vue3gui/DynamicsEmitter"
import { Icon } from "../../vue3gui/Icon"
import { LoadingIndicator } from "../../vue3gui/LoadingIndicator"
import { Modal } from "../../vue3gui/Modal"
import { Overlay } from "../../vue3gui/Overlay"
import { ProgressBar } from "../../vue3gui/ProgressBar"
import { StateCard } from "../../vue3gui/StateCard"
import { useState } from "../../vue3gui/StateInfo"
import { Tabs, useTabs } from "../../vue3gui/Tabs"
import { TextField } from "../../vue3gui/TextField"
import { UploadOverlay } from "../../vue3gui/UploadOverlay"
import { useDraggable, useDropTarget, useFileDropTarget } from "../../vue3gui/dragAndDrop"
import { grid } from "../../vue3gui/grid"
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

        const inputValue = ref("")

        const draggable = useDraggable({ format: "vue3gui-drag" })
        const dropTarget = useDropTarget({ accept: "vue3gui-drag" })
        const lastFilesDropped = ref<string[]>([])
        const fileDropTarget = useFileDropTarget({ onDrop: v => lastFilesDropped.value = v.map(v => v.name) })
        const showOverlay = ref(false)
        const showModal = ref(false)
        const transitions = ref(false)
        const state = useState()
        const emitter = useDynamicsEmitter()
        const random = ref(Math.random())

        const _1 = setInterval(() => {
            random.value = Math.random()
        }, 500)
        onUnmounted(() => clearInterval(_1))

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
                        <div class="child-mr-2">
                            {Variant.LIST.map(variant => (<Button variant={variant} plain onClick={() => buttonsCounter.value++}>{capitalize(variant)}</Button>))}
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
                    <h1>Text Field</h1>
                    <div class="gap-1 start-cross" style={grid().columns("100px", "300px").$}>
                        Normal: <TextField placeholder="Placeholder" />
                        Clear: <TextField clear placeholder="Placeholder" />
                        Plain: <TextField plain placeholder="Placeholder" />
                        <b style={grid().colspan(2).$}>Label</b>
                        Static: <TextField modelValue="Has label" label="Said label" />
                        Dynamic: <TextField vModel={inputValue.value} label={inputValue.value != "" ? "Something written" : ""} />
                        <b style={grid().colspan(2).$}>Validation</b>
                        Email: <TextField validate type="email" plain />
                        Custom: <TextField validate pattern="^(?!error).*$" plain label="Write 'error' to error" />
                        Number: <TextField validate type="number" min="10" max="20" step="1" plain />
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
                    <UploadOverlay class="w-200 h-200"></UploadOverlay>
                    <h1>Overlay</h1>
                    <Button onClick={() => showOverlay.value = true}>Show</Button>
                    <h1>Modal</h1>
                    <Button onClick={() => showModal.value = true}>Show</Button>
                    <Modal show={showModal.value} cancelButton onCancel={() => showModal.value = false}>
                        This is a modal
                    </Modal>
                    <h2>Using dynamics emitter:</h2>
                    <div class="flex row gap-2">
                        <Button onClick={() => emitter.alert("Hello world!")}>Open alert</Button>
                        <Button onClick={() => emitter.alert("Failed to do stuff\n\n" + new Error("Wrong data").stack, { error: true })}>Open error</Button>
                        <Button onClick={() => {
                            const work = emitter.work()
                            let left: any = 2
                            const intervalID = setInterval(() => {
                                if (left < 0) {
                                    work.done()
                                    clearInterval(intervalID)
                                }
                                work.message = `Loading (${((2 - left) / 0.02).toFixed(0)}%)`
                                left -= 0.01
                            }, 10)
                        }}>Open working</Button>
                        <Button onClick={() => emitter.prompt().then(v => v != null ? emitter.alert(`Entered text: ${JSON.stringify(v)}`) : null)}>Open prompt</Button>
                    </div>
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
                    <h1>State card</h1>
                    <div class="child-mr-2 mb-2">
                        <Button variant="primary" onClick={() => state.working("Loading...")}>Working</Button>
                        <Button variant="danger" onClick={() => state.error("There was an error")}>Error</Button>
                        <Button variant="success" onClick={() => state.done("Done!")}>Done</Button>
                    </div>
                    <StateCard state={state} />
                    <h1>Progress</h1>
                    <Circle indeterminate />
                    <Circle transition variant="primary" filler progress={random.value} /><br />
                    <ProgressBar variant="success" filler progress={random.value} /><br />
                    <ProgressBar variant="warning" transition filler progress={random.value} />
                </div>,
                overlay: () => <Button variant="primary" clear onClick={() => showOverlay.value = false}>Hide</Button>
            }}</Overlay>
        )
    }
})
