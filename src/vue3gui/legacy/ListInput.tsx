import { defineComponent, isRef, PropType, reactive, ref, Ref } from "vue"
import { eventDecorator } from "../../eventDecorator"
import { Button } from "../Button"
import { ComponentProps } from "../util"

interface ChangeEventBase<T> {
    index: number,
    value: T,
    state: T[]
}

interface DeleteChangeEvent<T> extends ChangeEventBase<T> {
    type: "delete"
}

interface SetChangeEvent<T> extends ChangeEventBase<T> {
    type: "set"
}

type AnyChangeEvent<T> = DeleteChangeEvent<T> | SetChangeEvent<T>

interface ListInputHookOptions<T> {
    factory?: (index: number) => T | Promise<T | null> | null
    key: (v: T, index: number) => string
    disposer?: (v: T) => void
    onChange?: (event: AnyChangeEvent<T>) => void
    noDelete?: boolean
}

/** @deprecated */
export function useListInput<T>(_list: Ref<T[]> | T[], options: ListInputHookOptions<T>) {
    const list = !isRef(_list) ? (ref(_list) as Ref<T[]>) : _list

    const ret = {
        props: {
            get items() { return list.value },
            key: options.key,
            addButton: !!options.factory,
            deleteButton: !options.noDelete,
            async onAdd(index: number) {
                const newValue = await options.factory!(index)
                if (newValue == null) return
                this.items.push(newValue)
                options.onChange?.({ type: "set", index, value: newValue, state: this.items as T[] })
            },
            onRemove(index, value) {
                options.disposer?.(value)
                this.items.splice(index, 1)
                options.onChange?.({ type: "delete", index, value, state: this.items as T[] })
            },
        } as ComponentProps<typeof ListInput>,
    }

    ret.props.onAdd = ret.props.onAdd!.bind(ret.props)
    ret.props.onRemove = ret.props.onRemove!.bind(ret.props)

    return reactive(ret) as typeof ret
}

/** @deprecated */
export const ListInput = eventDecorator(defineComponent({
    name: "ListInput",
    props: {
        listClass: {
            type: null,
        },
        itemClass: {
            type: null,
        },
        titleClass: { type: null },
        title: {
            type: String,
        },
        items: {
            type: Array,
            required: true,
        },
        key: {
            type: Function as PropType<(v: any, index: number) => string>,
        },
        addButton: { type: Boolean },
        deleteButton: { type: Boolean },
        deleteConfirm: { type: Boolean },
    },
    emits: {
        add: (length: number) => true,
        remove: (index: number, value: any) => true,
    },
    setup(props, ctx) {
        const slots = ctx.slots as ListInput.Slots

        return () => (
            <div class="flex column">
                <div class={["flex row", props.titleClass]}>
                    <div class="flex-fill flex row center-cross">
                        <div>
                            {props.title}
                        </div>
                        {slots.title?.()}
                    </div>
                    {props.addButton && <Button clear onClick={() => ctx.emit("add", props.items.length)}>+</Button>}
                </div>
                {(props.items.length > 0 || slots.placeholder) && <div class={["flex column", props.listClass]}>
                    {
                        props.items.length > 0 ? props.items.map((item, i) => {
                            const key = props.key?.(item, i) ?? i.toString()

                            return (
                                <div class={["flex row", props.itemClass]} key={key}>
                                    <div class="flex-fill flex row">
                                        {slots.item?.(item, i, key) ?? key}
                                    </div>
                                    {props.deleteButton && <Button clear onClick={() => ctx.emit("remove", i, item)} >-</Button>}
                                </div>
                            )
                        })
                            : slots.placeholder?.()
                    }
                </div>}
            </div>
        )
    },
}))

/** @deprecated */
export namespace ListInput {
    export interface Slots<T = any> {
        title?: () => any,
        item?: (value: T, index: number, key: string) => any,
        placeholder?: () => any
    }
}
