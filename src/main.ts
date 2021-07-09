import { createApp } from "vue"
import { App } from "./app/App"
import { router } from "./app/router"
import "./vue3gui/style.scss"
import { Theme } from "./vue3gui/Theme"

Theme.selected = Theme.DARK

const app = createApp(App)

app.use(router)

app.mount("#app")

