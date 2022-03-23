/// <reference path="./.vscode/config.d.ts" />

const { project, run, constants, join, copy } = require("ucpem")
const { mkdir } = require("fs/promises")

const vue3gui = project.prefix("src").res("vue3gui")

project.prefix("src").res("viewComponents",
    vue3gui
)

project.script("script", async ([name]) => {
    await run(`${process.argv[0]} ./scripts/node_modules/.bin/ts-node-script ./scripts/src/scripts/${name}.ts`, constants.projectPath)
}, { desc: "Runs a script from the script directory :: Arguments: <script name>", argc: 1 })

project.script("deploy-docs", async () => {
    const origin = await run(`git remote get-url origin`, constants.projectPath)
    await run(`IS_DEMO=1 yarn vite build`, constants.projectPath)
    const dist = join(constants.projectPath, "dist")
    await run("git init", dist)
    await run("git checkout -b docs", dist)
    await run("git remote add origin " + JSON.stringify(origin.trim()), dist)
    await run("git add .", dist)
    await run("git commit -m " + JSON.stringify("Deploy " + new Date().toISOString()), dist)
    await run("git push --force origin docs", dist)
})