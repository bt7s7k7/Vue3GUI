
export interface FlipTransitionOptions {
    /** If we are animating `from` a state to default position or `to` a state from current state. */
    type: "to" | "from"
    /** Element to animate */
    element: HTMLElement
    /** When animation translation is the provided position absolute or relative to the element's default position. @default false */
    absolute?: boolean
    /** Animating horizontal translation. @default undefined */
    x?: number
    /** Animating vertical translation. @default undefined */
    y?: number
    /** Animating scale. @default undefined */
    scale?: number
    /** Duration of the transition. @default var(--flip-duration) */
    duration?: string
    /** Transition function of the transition. @default var(--flip-transition) */
    transition?: string
}

const _TRANSITION = "transform var(--flip-duration) var(--flip-transition)"

export function triggerFlipTransition({
    type, element,
    absolute = false,
    x, y, scale,
    duration, transition,
}: FlipTransitionOptions) {
    function transitionEndCallback(event: TransitionEvent) {

        if (event.target != element) {
            // Ignore inherited transition
            return
        }

        if (event.pseudoElement != "") {
            // Ignore transition events from pseudo elements
            return
        }

        if (element.dataset.flipTransitionChange) {
            // Don't do anything on transition change, another event will be fired when the new transition finishes
            delete element.dataset.flipTransitionChange
            return
        }

        element.removeEventListener("transitionend", transitionEndCallback)
        element.removeEventListener("transitioncancel", transitionEndCallback)

        if (duration != undefined) element.style.setProperty("--flip-duration", null)
        if (transition != undefined) element.style.setProperty("--flip-transition", null)

        element.style.transition = ""
    }

    let transform = ""
    let bb!: DOMRect

    if (absolute) {
        bb = element.getBoundingClientRect()
    }

    if (x != undefined) {
        if (absolute) x -= bb.x
        transform += ` translateX(${x}px)`
    }

    if (y != undefined) {
        if (absolute) y -= bb.y
        transform += ` translateY(${y}px)`
    }

    if (scale != undefined) {
        transform += ` scale(${scale})`
    }


    if (duration != undefined) element.style.setProperty("--flip-duration", duration)
    if (transition != undefined) element.style.setProperty("--flip-transition", transition)

    if (element.classList.contains("as-flip-active")) {
        // If there is already a FLIP transition being performed only change its destination
        // Because this will throw a `transitioncancel` event, we need to inform the callback
        // that this is just a change at it should wait for the new transition to end
        element.dataset.flipTransitionChange = "1"
        if (type == "to") {
            element.style.transform = transform
        } else if (type == "from") {
            element.style.transform = ""
        }
        return
    }

    element.addEventListener("transitionend", transitionEndCallback)
    element.addEventListener("transitioncancel", transitionEndCallback)

    if (type == "to") {
        element.style.transition = _TRANSITION
        setTimeout(() => {
            element.style.transform = transform
        }, 10)
    } else if (type == "from") {
        // If we do not set a start state, transition from the existing state
        if (transform != "") element.style.transform = transform

        setTimeout(() => {
            element.style.transition = _TRANSITION
            setTimeout(() => {
                element.style.transform = "none"
            }, 10)
        }, 10)
    }
}
