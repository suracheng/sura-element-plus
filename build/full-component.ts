import path from "path";
import fs from 'fs/promises'
import commonjs from "@rollup/plugin-commonjs";
import vue from "rollup-plugin-vue";
import typescript from "rollup-plugin-typescript2";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { rollup, OutputOptions } from "rollup";

import { parallel } from "gulp";
import { outDir, cpRoot } from "./utils/paths";
import { buildConfig } from "./utils/config";
import { pathRewriter } from "./utils";

// packages/c-plus组件打包,打包出的文件输出作为发包文件入口
const buildFull = async () => {
  // rollup 相关配置 
  const config = {
    input: path.resolve(cpRoot, "index.ts"), // 打包的入口 packages/c-plus/index.ts
    plugins: [nodeResolve(), typescript(), vue(), commonjs()], // 相关插件解析
    external: (id) => /^vue/.test(id), // 外链引入模块，表示打包的时候不打包vue代码 ==> 排除 import vue from ‘vue'
  };

  // 定义需要打包的配置信息 [整个组件库可以使用两种方式import(esm)导入或者在浏览器中使用script(umd)]
  const buildConfig = [
    {
      format: "umd",
      file: path.resolve(outDir, "index.js"),
      name: "CPlus", // 全局的名字, 打包后的包名
      exports: "named", // 使用命名的方式导出
      globals: {
        vue: "Vue", // 全局变量别名定义, 告诉rollup全局变量Vue即是vue
      },
    },
    {
      format:'esm',
      // file: path.resolve(outDir, "index.esm.js")
      file: path.resolve(outDir, "index.mjs")
    }
  ];
  // 使用 rollup 对文件打包输出
  const bundle = await rollup(config);

  return Promise.all(buildConfig.map(
    config => bundle.write(config as OutputOptions)
  ))
};


// 打包组件c-plus入口文件输出分别作为 es / lib 的入口文件
async function buildEntry() {
  // 获取入口文件
  const entryFiles = await fs.readdir(cpRoot, { withFileTypes: true }) // 读取packages/c-plus下的文件包含子目录

  console.log('entryFiles------', entryFiles)
  // [
  //   Dirent { name: 'index.ts', [Symbol(type)]: 1 },
  //   Dirent { name: 'package.json', [Symbol(type)]: 1 }
  // ]

  // 过滤拿到入口点
  const entryPoints = entryFiles.filter((f) => f.isFile())
                        .filter((f) => !["package.json"].includes(f.name)) // 排除 package.json 文件
                        .map((f) => path.resolve(cpRoot, f.name))

  console.log('entryPoints----', entryPoints)
  // [ '/Users/sura.cheng/Desktop/c-plus/packages/c-plus/index.ts' ]
  
  // 定义配置
  const config = {
    input: entryPoints,
    plugins: [nodeResolve(), vue(), typescript()],
    external: (id: string) => /^vue/.test(id) || /@c-plus/.test(id)
  }

  const bundle = await rollup(config)

  return Promise.all(
    Object.values(buildConfig).map((config) => ({
      format: config.format,
      dir: config.output.path,
      paths:  pathRewriter(config.output.name),
    }))
    .map((options) => bundle.write(options as OutputOptions))
  )
}

export const buildFullComponent = parallel(buildFull, buildEntry);

// gulp适合流程控制 和 代码的转义 没有打包的功能
// series parallel 串行 并行 要求传入的 promise  
