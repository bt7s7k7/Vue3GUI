import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"
import * as dotenv from "dotenv"
import { resolve } from "path"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig(() => {
    dotenv.config()

    return {
        plugins: [vue(), vueJsx()],
        server: {
            port: +process.env.PORT ?? 8080
        },
        ...(!process.env.IS_DEMO ? {
            build: {
                lib: {
                    entry: resolve(__dirname, "src/index.ts"),
                    name: "Vue3GUI",
                    fileName: (format) => `index.${format}.js`
                },
                rollupOptions: {
                    external: ["vue", "vue-router"],
                    output: {
                        globals: {
                            vue: "Vue"
                        }
                    }
                },
            }
        } : {
            base: "./"
        })
    }
})
