import { defineComponent, markRaw, PropType, reactive } from "vue"
import { eventDecorator } from "../../eventDecorator"
import { Button } from "../Button"

/** @deprecated */
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
                required: true,
            },
            label: {
                type: String,
                required: false,
            },
        },
        setup(props, ctx) {
            return () => (
                <div class="flex column">
                    {props.label && <div class="flex row mb-1 child-mr-2">
                        <div>{props.label}</div>
                        <Button onClick={() => controller.add()}>+</Button>
                        {controller.list.length > 0 && <Button onClick={() => controller.clear()} variant="danger">Clear</Button>}
                    </div>}
                    {controller.list.map((v, i) => (
                        <div key={(v as any).id ?? i} class="flex row mb-1">
                            {props.renderElem(v, i)}
                            <Button variant="danger" onClick={() => controller.remove(i)}>-</Button>
                        </div>
                    ))}
                    {!props.label && <div class="flex row child-mr-2">
                        <Button onClick={() => controller.add()}>+</Button>
                        {controller.list.length > 0 && <Button onClick={() => controller.clear()} variant="danger">Clear</Button>}
                    </div>}
                </div>
            )
        },
    }))

    class Controller {
        public list: T[] = options.initial ?? []
        public readonly view = markRaw(ListControllerView)

        public add() {
            this.list.push(options.factory())
        }

        public clear() {
            for (let i = this.list.length - 1; i >= 0; --i) {
                this.remove(i)
            }
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
