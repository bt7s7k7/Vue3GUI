interface GrabMoveEvent {
    startX: number
    startY: number
    currentX: number
    currentY: number
    deltaX: number
    deltaY: number
}

export function useGrab<T = null>({
    cursor = "grabbing",
    button = 0,
    onMove = (event: GrabMoveEvent, state: T) => { },
    onMoveEnd = (event: GrabMoveEvent, state: T) => { },
    onMoveStart = (event: GrabMoveEvent): T => { return null! as T }
} = {}) {
    let dragging = false
    let startX = 0
    let startY = 0

    return (event: MouseEvent) => {
        if (dragging) return
        if (event.button != button) return

        event.preventDefault()
        event.stopPropagation()

        startX = event.pageX
        startY = event.pageY
        dragging = true
        const state = onMoveStart({ startX, startY, currentX: startX, currentY: startY, deltaX: 0, deltaY: 0 })

        const element = document.createElement("div")
        document.body.appendChild(element)
        element.classList.add("as-fullscreen-overlay")
        element.style.cursor = cursor

        const moveListener = (event: MouseEvent) => {
            const currentX = event.pageX
            const currentY = event.pageY
            onMove({ startX, startY, currentX, currentY, deltaX: currentX - startX, deltaY: currentY - startY }, state)
        }
        const upListener = (event: MouseEvent) => {
            if (event.button != button)
                return
            element.remove()
            dragging = false

            const currentX = event.pageX
            const currentY = event.pageY
            onMoveEnd({ startX, startY, currentX, currentY, deltaX: currentX - startX, deltaY: currentY - startY }, state)

            window.removeEventListener("mousemove", moveListener)
            window.removeEventListener("mouseup", upListener)
        }

        window.addEventListener("mousemove", moveListener)
        window.addEventListener("mouseup", upListener)
    }
}