import { stringifyStyle } from "@vue/shared"
import { App, DirectiveBinding, normalizeClass, normalizeStyle } from "vue"

function* _applyChildDirective(el: unknown, binding: DirectiveBinding) {
    if (!(el instanceof HTMLElement)) {
        throw new TypeError("Can only use v-affect on HTMLElement")
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

export const vue3gui = {
    install(app: App, options: {}) {
        app.directive("child-class", (el, binding, vnode, prevVNode) => {
            for (const child of _applyChildDirective(el, binding)) {
                const classname = normalizeClass([child.getAttribute("class"), binding.value])
                child.setAttribute("class", [...new Set(classname.split(" "))].join(" "))
            }
        })

        app.directive("child-style", (el, binding, vnode, prevVNode) => {
            for (const child of _applyChildDirective(el, binding)) {
                const style = normalizeStyle([child.getAttribute("style"), binding.value])
                child.setAttribute("style", stringifyStyle(style))
            }
        })
    },
}
