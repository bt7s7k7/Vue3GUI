import { ComponentInternalInstance, PropType, createCommentVNode, defineComponent, getCurrentInstance, onMounted, onUnmounted, onUpdated, watch } from "vue"

export const MountNode = (defineComponent({
    name: "MountElement",
    props: {
        node: { type: Node as PropType<Node | null> }
    },
    setup(props, ctx) {
        let instance: ComponentInternalInstance | null = null
        let lastNode: Node | null = null

        function update() {
            if (instance == null) return null

            const node = props.node
            const element = instance.vnode.el

            if (element == null) {
                lastNode?.parentNode?.removeChild(lastNode)
                lastNode = null
                return
            }

            if (lastNode != null && lastNode != node) {
                lastNode.parentNode?.removeChild(lastNode)
            }

            lastNode = null

            if (!(element instanceof Comment)) throw new Error("MountNode root is not a comment")
            if (!element.parentElement) return

            if (node != null) {
                element.parentElement.insertBefore(node, element.nextSibling)
            }
            lastNode = node ?? null
        }

        onMounted(() => {
            instance = getCurrentInstance()
            update()
        })

        onUnmounted(() => {
            lastNode?.parentNode?.removeChild(lastNode)
        })

        watch(() => props.node, update)
        onUpdated(update)

        return () => (
            createCommentVNode("MountNode")
        )
    }
}))
