/// <reference path="./.vscode/config.d.ts" />

const { project, run, constants } = require("ucpem")

project.prefix("src").res("vue3gui")

project.script("script", async ([name]) => {
    await run(`${process.argv[0]} ./scripts/node_modules/.bin/ts-node-script ./scripts/src/scripts/${name}.ts`, constants.projectPath)
}, { desc: "Runs a script from the script directory :: Arguments: <script name>", argc: 1 })