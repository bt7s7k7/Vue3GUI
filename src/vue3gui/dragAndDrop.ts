import { reactive, Ref } from "vue"

let dropTargetID = 1

function getTargetID(event: DragEvent) {
    const target = event.composedPath().find((element: any) => {
        return "dataset" in element && element.dataset.dropTargetId
    })

    return target ? (target as any).dataset.dropTargetId as string : null
}

export function useDropTarget(options: {
    accept: string | ((transfer: DataTransfer) => boolean),
    onDrop?: (transfer: DataTransfer) => void,
    onStateChanged?: (over: boolean) => void
}) {
    const accept = (transfer: DataTransfer) => {
        if (typeof options.accept == "string") {
            return transfer.types.includes(options.accept)
        } else {
            return options.accept(transfer)
        }
    }

    let count = 0

    const id = (dropTargetID++).toString()
    const ret = reactive({
        over: false,
        props: {
            onDragover(event: DragEvent) {
                if (getTargetID(event) != id) return

                if (event.dataTransfer && accept(event.dataTransfer)) {
                    event.preventDefault()
                }
            },
            onDragenter(event: DragEvent) {
                if (getTargetID(event) != id) return

                if (event.dataTransfer && accept(event.dataTransfer)) {
                    count++
                    ret.over = !!count
                    options.onStateChanged?.(ret.over)
                }
            },
            onDragleave() {
                count--
                if (count == -1) count = 0
                ret.over = !!count
                options.onStateChanged?.(ret.over)
            },
            onDrop(event: DragEvent) {
                if (getTargetID(event) != id) return

                count--
                if (count == -1) count = 0
                ret.over = !!count
                options.onStateChanged?.(ret.over)
                if (event.dataTransfer && accept(event.dataTransfer)) {
                    event.preventDefault()
                    options.onDrop?.(event.dataTransfer)
                }
            },
            "data-drop-target-id": id,
        },
    })

    return ret
}

export function useDraggable(options: {
    format: string,
    data?: Ref<string> | (() => string),
    onStateChanged?: (over: boolean) => void
}) {
    const ret = reactive({
        dragged: false,
        props: {
            draggable: true,
            onDragstart(event: DragEvent) {
                ret.dragged = true
                options.onStateChanged?.(ret.dragged)
                if (event.dataTransfer) event.dataTransfer.setData(options.format, options.data ? (typeof options.data == "function" ? options.data() : options.data.value) : "")
            },
            onDragend() {
                ret.dragged = false
                options.onStateChanged?.(ret.dragged)
            },
        },
    })

    return ret
}

export function useFileDropTarget(options: {
    onDrop: (files: File[], raw: FileList) => void
}) {
    const ret = useDropTarget({
        accept(transfer) {
            return transfer.types.includes("Files")
            /* const files = Array.from(transfer.files)
            return files.length > 0 && (options.type == null || !files.find(v =>
                typeof options.type == "string" ? options.type != v.type
                    : !options.type!.includes(v.type)
            )) */
        },
        onDrop(transfer) {
            options.onDrop(Array.from(transfer.files), transfer.files)
        },
    })

    return ret
}
