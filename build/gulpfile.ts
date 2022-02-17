import { series, parallel } from "gulp";
import { mkdir, copyFile } from 'fs/promises'

import { run, withTaskName } from "./utils";
import { outDir, cpRoot, epOutput } from "./utils/paths";
import { genTypes } from './types-definitions'


// 拷贝.json文件
const copySourceCode = () => async () => {
  await run(`cp ${cpRoot}/package.json ${outDir}/package.json`)
}

// 执行命令[串行执行] -> clean -> 执行 packages 下每个模块的 build 命令 -> 全量打包组件 -> 对每个组件进行打包处理
export default series(
  // 清除 dist
  withTaskName("clean", async () => run("rm -rf ./dist")),
  // withTaskName('createOutput', () => mkdir(epOutput, { recursive: true })),

  parallel(
    // 运行 packages文件下每个模块的 build 命令（从 package.json 文件中查找，执行 gulpfile 文件）
    withTaskName("buildPackages", () => run("pnpm run --filter ./packages --parallel build")),
    // 全量组件打包 c-plus
    withTaskName("buildFullComponent", () => run("pnpm run build buildFullComponent")), // 执行build命令时会调用rollup, 我们给rollup传递参数buildFullComponent 那么就会执行导出任务叫 buildFullComponent
    // 对每个组件进行打包 components
    withTaskName("buildComponent", () => run("pnpm run build buildComponent"))
  ),
  parallel(genTypes, copySourceCode())
);


// 导入任务(任务执行器 ➕ 任务名, 就会执行对应的任务)
export * from "./full-component";
export * from "./component";