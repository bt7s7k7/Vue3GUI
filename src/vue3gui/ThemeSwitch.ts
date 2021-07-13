import { reactive } from "vue"
import { Theme } from "./Theme"

interface ThemeReference {
    theme: Theme,
    element?: HTMLStyleElement
}

export class ThemeSwitch {
    public selectedTheme = ""

    public registerTheme(theme: Theme) {
        this.selectedTheme = theme.name
        const element = Array.from(this.head.children).find(v => v.innerHTML == theme.style) as HTMLStyleElement | undefined
        if (element) this.themeRefs.forEach(v => v.element?.remove())
        this.themeRefs.push({ theme, element })
        this.selectedTheme = theme.name
        Theme.selected = theme
    }

    public setTheme(name: string) {
        const themeRef = this.themeRefs.find(v => v.theme.name == name)
        if (themeRef) {
            this.selectedTheme = themeRef.theme.name
            this.themeRefs.forEach(v => v.element?.remove())
            if (themeRef.element) {
                this.head.appendChild(themeRef.element)
            }
            Theme.selected = themeRef.theme
        } else throw new RangeError(`No theme named ${JSON.stringify(name)} found`)
    }

    protected themeRefs: ThemeReference[] = []

    constructor(
        protected readonly head = document.head
    ) {
        return reactive(this) as this
    }
}