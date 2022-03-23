import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router"
import { Home } from "./routes/Home"

const routes: RouteRecordRaw[] = [
    {
        name: "Home",
        path: "/",
        component: Home
    },
    {
        name: "Link",
        path: "/link",
        component: () => import(/* webpackChunkName: "link-target" */ "./routes/LinkTarget")
    }
    // {
    //     path: '/about',
    //     name: 'About',
    //     component: () => import(/* webpackChunkName: "about" */ './routes/About.tsx')
    // }
]

export const router = createRouter({
    history: createWebHashHistory(),
    routes
})