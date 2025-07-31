import { escapeHtml, stringifyStyle } from "@vue/shared"
import { App, DirectiveBinding, normalizeClass, normalizeStyle } from "vue"

function* _applyChildDirective(el: unknown, binding: DirectiveBinding) {
    if (!(el instanceof HTMLElement)) {
        throw new TypeError("Can only use this directive on a HTMLElement")
    }

    let stride = 1
    let offset = 0
    let head = Infinity

    let match

    if (binding.arg == null) {
        // Keep default
    } else if ((match = binding.arg.match(/^(?:stride(\d)+)?(?:offset(\d)+)?(?:head(\d)+)?$/))) {
        if (match[1]) {
            stride = parseInt(match[1])
        }

        if (match[2]) {
            offset = parseInt(match[2])
        }

        if (match[3]) {
            head = parseInt(match[3])
        }
    } else if ((match = binding.arg.match(/index(\d+)/))) {
        stride = 1
        offset = parseInt(match[1])
        head = offset + 1
    } else if (binding.arg == "even") {
        stride = 2
        offset = 1
    } else if (binding.arg == "odd") {
        stride = 2
        offset = 0
    } else {
        throw new SyntaxError(`Invalid argument "${binding.arg}"`)
    }

    if (stride <= 0) throw new RangeError("Stride must be positive")

    const children = el.children
    for (let i = offset; i < children.length && i < head; i += stride) {
        const child = children[i]
        yield child
    }
}

function _addClass(element: Element, classToAdd: string) {
    const classname = normalizeClass([element.getAttribute("class"), classToAdd])
    element.setAttribute("class", [...new Set(classname.split(" "))].join(" "))
}

const _LABEL_HOST = Symbol.for("vue3gui.labelHost")
const _LABEL_ALIGNMENTS: Record<string, [string, string]> = {
    "bottom": ["top-100 left-0 w-fill h-0 flex center", "top-100 mt-1"],
    "bottom-right": ["top-100 left-0 w-fill h-0 flex", "top-100 mt-1"],
    "bottom-left": ["top-100 left-0 w-fill h-0 flex end-main", "top-100 mt-1"],
    "top": ["bottom-100 left-0 w-fill h-0 flex center", "bottom-100 mb-1"],
    "top-right": ["bottom-100 left-0 w-fill h-0 flex", "bottom-100 mb-1"],
    "top-left": ["bottom-100 left-0 w-fill h-0 flex end-main", "bottom-100 mb-1"],
    "right": ["left-100 top-0 h-fill w-0 flex center", "left-100 ml-1"],
    "left": ["right-100 top-0 h-fill w-0 flex center", "right-100 mr-1"],
}

export const vue3gui = {
    install(app: App, options: {}) {
        app.directive("child-class", (el, binding, vnode, prevVNode) => {
            for (const child of _applyChildDirective(el, binding)) {
                _addClass(child, binding.value)
            }
        })

        app.directive("child-style", (el, binding, vnode, prevVNode) => {
            for (const child of _applyChildDirective(el, binding)) {
                const style = normalizeStyle([child.getAttribute("style"), binding.value])
                child.setAttribute("style", stringifyStyle(style))
            }
        })

        app.directive("label", (el, binding, vnode, prevVNode) => {
            if (!(el instanceof HTMLElement)) {
                throw new TypeError("Can only use this directive on a HTMLElement")
            }

            _addClass(el, "hover-check")

            const prevLabel = el.ariaLabel
            const label = binding.value as string
            if (!label) {
                if (prevLabel == null) {
                    return
                }

                el.ariaLabel = null

                const labelHost = (el as any)[_LABEL_HOST] as [HTMLElement, HTMLElement] | null
                if (labelHost) {
                    labelHost[0].remove()
                }

                (el as any)[_LABEL_HOST] = null
                return
            }

            if (prevLabel == label) return

            el.ariaLabel = label

            let labelHost: [HTMLElement, HTMLElement] | null = (el as any)[_LABEL_HOST]
            if (labelHost == null) {
                labelHost = [document.createElement("div"), document.createElement("div")];
                (el as any)[_LABEL_HOST] = labelHost

                el.appendChild(labelHost[0])
                labelHost[0].appendChild(labelHost[1])

                labelHost[0].style.zIndex = "1000"
            }

            const alignment = _LABEL_ALIGNMENTS[binding.arg ?? "bottom"]
            if (alignment == null) throw new TypeError(`Invalid label alignment "${binding.arg}"`)

            labelHost[0].className = "if-hover-fade fade-delay absolute " + alignment[0]
            labelHost[1].className = "small rounded shadow bg-default absolute p-1 px-2 nowrap ignored " + alignment[1]

            labelHost[1].innerHTML = escapeHtml(label)
        })
    },
}
