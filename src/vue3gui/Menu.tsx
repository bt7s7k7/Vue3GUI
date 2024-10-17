import { reactive } from "vue"
import { ButtonProps } from "./Button"
import { MenuContent, MenuItem, MenuItemProps } from "./MenuItem"

export abstract class Menu<T> {
    public abstract getItems(): T[]
    public abstract getKey(item: T): string

    public getLabel(item: T): any {
        return this.getKey(item)
    }

    public getIcon(item: T): string | null {
        return null
    }

    public getContent(item: T): any {
        return null
    }

    public renderItem(item: T) {
        const content = this.getContent(item)
        const key = this.getKey(item)
        const label = this.getLabel(item)

        return <MenuItem key={key}>
            {label}
            {content && <MenuContent>{content}</MenuContent>}
        </MenuItem>
    }

    public getProps(item: T): MenuItemProps.Function & ButtonProps.Function {
        return {}
    }

    public renderItems(items: T[]) {
        return <>
            {items.map(item => {
                const children = this.getNestedItems(item)
                if (children == null) {
                    return this.renderItem(item)
                } else {
                    return [
                        this.renderItem(item),
                        <div class="ml-2" key={this.getKey(item) + "_children"}>
                            {this.renderItems(children)}
                        </div>
                    ]
                }
            })}
        </>
    }

    public renderRoot() {
        return this.renderItems(this.getItems())
    }

    public getNestedItems(item: T): T[] | null {
        return []
    }

    constructor() {
        return reactive(this) as this
    }
}
