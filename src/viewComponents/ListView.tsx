import { defineComponent, PropType } from "vue"
import { Button } from "../vue3gui/Button"
import { Icon } from "../vue3gui/Icon"
import { LoadingIndicator } from "../vue3gui/LoadingIndicator"
import { Overlay } from "../vue3gui/Overlay"
import { DataAdapter } from "./DataAdapter"

export const ListView = (defineComponent({
    name: "ListView",
    props: {
        adapter: { type: Object as PropType<DataAdapter>, required: true },
    },
    setup(props, ctx) {
        function drawIcon(item: unknown, index: number) {
            const icon = props.adapter.getIcon(item, index)
            if (icon == null) return null
            if (typeof icon == "string") {
                if (icon[0] == "M") return <Icon icon={icon} />
                else return <img class="as-icon img-contain" src={icon} />
            } else {
                return icon
            }
        }

        return () => (
            <Overlay class="border rounded flex column" show={props.adapter.loading}>{{
                overlay: () => <LoadingIndicator />,
                default: () => <>
                    {props.adapter.getHeader()}
                    <div class="flex-fill flex column scroll contain">{
                        props.adapter.data?.map((v, i) => (
                            <Button onClick={() => props.adapter.select(v, i)} clear class="flex row center-cross text-left gap-1 hover-check" key={props.adapter.getID(v, i)}>
                                {drawIcon(v, i)}
                                <div class="flex-fill">{props.adapter.getLabel(v, i)}</div>
                                {props.adapter.getItemActions(v, i)}
                            </Button>
                        ))
                    }</div>
                    {props.adapter.getFooter()}
                </>
            }}</Overlay>
        )
    }
}))