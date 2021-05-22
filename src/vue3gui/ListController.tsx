import { defineComponent, markRaw, PropType, reactive } from "vue"
import { eventDecorator } from "../eventDecorator"
import { Button } from "./Button"

export function useListController<T>(options: {
    initial?: T[]
    factory: () => T,
    dispose?: (elem: T) => void
}) {
    const ListControllerView = eventDecorator(defineComponent({
        name: "ListController",
        props: {
            renderElem: {
                type: Function as PropType<(elem: T, index: number) => any>,
                required: true
            },
            label: {
                type: String,
                required: false
            }
        },
        setup(props, ctx) {
            return () => (
                <div class="flex column">
                    {props.label && <div class="flex row mb-1">
                        <div class="mr-2">{props.label}</div>
                        <Button onClick={() => controller.add()}>+</Button>
                    </div>}
                    {controller.list.map((v, i) => (
                        <div key={(v as any).id ?? i} class="flex row mb-1">
                            {props.renderElem(v, i)}
                            <Button variant="danger" onClick={() => controller.remove(i)}>-</Button>
                        </div>
                    ))}
                    {!props.label && <div>
                        <Button onClick={() => controller.add()}>+</Button>
                    </div>}
                </div>
            )
        }
    }))

    class Controller {
        public list: T[] = options.initial ?? []
        public readonly view = markRaw(ListControllerView)

        public add() {
            this.list.push(options.factory())
        }

        public remove(index: number) {
            const elem = this.list[index]
            if (elem) {
                options.dispose?.(elem)
                this.list.splice(index, 1)
            }
        }
    }

    const controller = reactive(new Controller()) as Controller

    return controller
}