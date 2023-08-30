import { App, InjectionKey, Ref, inject, shallowRef } from "vue"
import { Theme } from "./Theme"

const THEME_KEY = Symbol("vue3gui:theme") as InjectionKey<Ref<Theme>>
let didWarning = false
type ReadonlyThemeRef = Omit<Ref<Theme>, "value"> & { readonly value: Theme }

export function useTheme() {
    const injectTheme = inject(THEME_KEY, null)
    if (injectTheme != null) return {
        theme: injectTheme as ReadonlyThemeRef,
        setTheme(theme: Theme) {
            injectTheme.value = theme
        }
    }

    if (!didWarning) {
        didWarning = true
        // @ts-ignore
        if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.warn("[Vue3GUI] Using the deprecated global theme constant, in the future use the `vue3gui` Vue plugin to set a theme")
        }
    }

    return {
        theme: shallowRef(Theme.selected) as ReadonlyThemeRef,
        setTheme(theme: Theme) {
            // eslint-disable-next-line no-console
            console.error("[Vue3GUI] Cannot set a theme when the deprecated theme system is used")
        }
    }
}

export const vue3gui = {
    install(app: App, options: { theme: Theme }) {
        const themeRef = shallowRef(options.theme)
        app.provide(THEME_KEY, themeRef)
    }
}
