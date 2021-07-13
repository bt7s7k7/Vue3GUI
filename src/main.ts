import { createApp } from "vue"
import { App } from "./app/App"
import { router } from "./app/router"
import "./vue3gui/themes/dark"
import "./vue3gui/themes/dark/style.scss"

const app = createApp(App)

app.use(router)

app.mount("#app")

