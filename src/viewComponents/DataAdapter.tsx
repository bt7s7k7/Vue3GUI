import { mdiChevronLeft, mdiPlus, mdiTrashCan } from "@mdi/js"
import { computed, reactive } from "vue"
import { Button } from "../vue3gui/Button"
import { Icon } from "../vue3gui/Icon"

interface ViewActionEvent {
    target: HTMLElement
}

export interface DataAdapterConfig<T> {
    data: () => T[] | null
    loading?: () => boolean
    header?: () => any
    back?: any
    id?: (item: T, index: number) => string
    icon?: (item: T, index: number) => any
    label?: (item: T, index: number) => any
    select?: (item: T, index: number) => void
    canDelete?: (item: T, index: number) => void
    delete?: (item: T, index: number, event: ViewActionEvent) => void
    add?: (event: ViewActionEvent) => void
    addIcon?: string
    deleteIcon?: string
}

export function useDataAdapter<T = any>(config: DataAdapterConfig<T>) {
    const ret = reactive(new class {
        public data = computed(() => config.data())
        public loading = computed(() => config.loading?.() ?? this.data == null)

        public getID(item: T, index: number) {
            return config.id?.(item, index) ?? index.toString()
        }

        public getIcon(item: T, index: number) {
            const icon = config.icon?.(item, index) ?? null
            if (icon == null) return null
            if (typeof icon == "string") {
                if (icon[0] == "M") return <Icon icon={icon} />
                else return <img class="as-icon img-contain" src={icon} />
            } else {
                return icon
            }
        }

        public getLabel(item: T, index: number) {
            return config.label?.(item, index) ?? this.getID(item, index)
        }

        public getHeader() {
            if (!config.header && !config.back) return null
            return <div class="border-bottom center-cross px-2 py-1 gap-2 flex row">
                {config.back && (
                    typeof config.back == "function" && config.back.length == 0 ? <Button clear onClick={config.back}> <Icon icon={mdiChevronLeft} /> </Button>
                        : config.back
                )}
                {config.header?.()}
            </div>
        }

        public getFooter() {
            if (!config.add) return null
            return <div class="border-top center-cross px-2 py-1 gap-2 flex row">
                <div class="flex-fill"></div>
                <Button clear onClick={(event: MouseEvent) => config.add!({ target: event.target as HTMLElement })}> <Icon icon={config.addIcon ?? mdiPlus} /> </Button>
            </div>
        }

        public select(item: T, index: number) {
            config.select?.(item, index)
        }

        public getItemActions(item: T, index: number) {
            return [
                (config.delete != null && (config.canDelete?.(item, index) ?? true)) && (
                    <Button clear class="if-hover-fade" onClick={(event: MouseEvent) => config.delete!(item, index, { target: event.target as HTMLElement })}>
                        <Icon icon={config.deleteIcon ?? mdiTrashCan} />
                    </Button>
                )
            ]
        }
    })

    return ret
}

export interface DataAdapter extends ReturnType<typeof useDataAdapter> { }
