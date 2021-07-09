import { reactive } from "vue"

type StateType = "working" | "error" | "done"
function useState() {
    return reactive({
        type: "working" as StateType,
        text: "Loading...",
        error(text: string) {
            this.type = "error"
            this.text = text
            return this
        },
        done(text: string) {
            this.type = "done"
            this.text = text
            return this
        },
        working(text: string) {
            this.type = "working"
            this.text = text
            return this
        }
    })
}

const _useState = useState as () => StateInfo
export { _useState as useState }

export interface StateInfo extends ReturnType<typeof useState> { }