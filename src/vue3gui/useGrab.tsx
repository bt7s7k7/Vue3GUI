export interface GrabMoveEvent {
    startX: number
    startY: number
    currentX: number
    currentY: number
    deltaX: number
    deltaY: number
}

interface HandlerInput {
    pageX: number
    pageY: number
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

    return (event: MouseEvent | TouchEvent) => {
        if (dragging) return
        if (event instanceof MouseEvent) if (event.button != button) return

        event.preventDefault()
        event.stopPropagation()

        let touch: Touch = null!
        if (event instanceof MouseEvent) {
            startX = event.pageX
            startY = event.pageY
        } else {
            touch = event.changedTouches.item(0)!
            startX = touch.pageX
            startY = touch.pageY
        }

        dragging = true

        const state = onMoveStart({ startX, startY, currentX: startX, currentY: startY, deltaX: 0, deltaY: 0 })

        const element = document.createElement("div")
        document.body.appendChild(element)
        element.classList.add("as-fullscreen-overlay")
        element.style.cursor = cursor

        const moveHandler = (event: HandlerInput) => {
            const currentX = event.pageX
            const currentY = event.pageY
            onMove({ startX, startY, currentX, currentY, deltaX: currentX - startX, deltaY: currentY - startY }, state)
        }

        const upHandler = (event: HandlerInput) => {
            element.remove()
            dragging = false

            const currentX = event.pageX
            const currentY = event.pageY
            onMoveEnd({ startX, startY, currentX, currentY, deltaX: currentX - startX, deltaY: currentY - startY }, state)
        }

        if (event instanceof MouseEvent) {
            const moveListener = (event: MouseEvent) => {
                moveHandler(event)
            }

            const upListener = (event: MouseEvent) => {
                if (event.button != button)
                    return

                upHandler(event)

                window.removeEventListener("mousemove", moveListener)
                window.removeEventListener("mouseup", upListener)
            }

            window.addEventListener("mousemove", moveListener)
            window.addEventListener("mouseup", upListener)
        } else if (event instanceof TouchEvent) {
            const moveListener = (event: TouchEvent) => {
                const newTouch = event.changedTouches.item(0)!
                if (newTouch.identifier != touch.identifier) return
                touch = newTouch

                moveHandler(touch)
            }

            const upListener = (event: TouchEvent) => {
                const newTouch = event.changedTouches.item(0)!
                if (newTouch.identifier != touch.identifier) return
                touch = newTouch

                upHandler(touch)

                window.removeEventListener("touchmove", moveListener)
                window.removeEventListener("touchend", upListener)
            }

            window.addEventListener("touchmove", moveListener)
            window.addEventListener("touchend", upListener)
        }
    }
}
