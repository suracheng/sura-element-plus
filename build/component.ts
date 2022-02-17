import path from "path";
import glob from "fast-glob";
import fs from "fs/promises";
import * as VueCompiler from "@vue/compiler-sfc";

import commonjs from "@rollup/plugin-commonjs";
import vue from "rollup-plugin-vue";
import typescript from "rollup-plugin-typescript2";

import { parallel, series } from "gulp";
import { rollup, OutputOptions } from "rollup";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { Project, SourceFile } from "ts-morph";

import { pathRewriter, run } from "./utils";
import { buildConfig } from "./utils/config";
import { compRoot, outDir, projectRoot } from "./utils/paths";

// 打包每个组件
const buildEachComponent = async () => {
  // 快速查找packages/components下文件
  const files = glob.sync("*", {
    cwd: compRoot,
    onlyDirectories: true, // 只返回目录
  });

  function returnConfig (file: string) {
    // 每个组件的入口
    const input = path.resolve(compRoot, file, "index.ts")
    // console.log('entry---->>>>', entry) // xxxxx/C-plus-components/packages/components/Icon/index.ts
  
    const config = {
      input, // 打包入口
      plugins: [nodeResolve(), vue(), typescript(), commonjs()],
      external: (id: string) => /^vue/.test(id) || /^@c-plus/.test(id), // 外链引入模块
    }
  
    return config
  }

  function returnOptions (file: string) {
    const options = Object.values(buildConfig).map((config) => ({
      format: config.format,
      file: path.resolve(config.output.path, `components/${file}/index.js`),
      paths: pathRewriter(config.output.name),
    }))
  
    return options
  }

  // 分别把components文件夹下的组件放到dist/es/components下和dist/lib/compmonents
  const builds = files.map(async (file: string) => {

    const config = returnConfig(file)
    const options = returnOptions(file)
    const bundle = await rollup(config);

    await Promise.all(
      options.map((option) => bundle.write(option as OutputOptions))
    );
  });

  return Promise.all(builds);
};

// 为每个组件生成一个 .d.ts 声明文件
async function genTypes () {
  const project = new Project({
    // 导入ts配置文件
    compilerOptions: {
      allowJs: true, // 允许编译 js 文件
      declaration: true, // 生成相应的 .d.ts 文件
      emitDeclarationOnly: true, // 只生成声明文件
      noEmitOnError: true, // 发生错误时不输出文件
      outDir: path.resolve(outDir, "types"), // 指定输出目录
      baseUrl: projectRoot, // 用于解析非相对模块名称的基目录
      paths: { // 用于设置模块名称到基于baseUrl的路径映射
        "@c-plus/*": ["packages/*"],
      },
      skipLibCheck: true,
      strict: false,
    },
    tsConfigFilePath: path.resolve(projectRoot, "tsconfig.json"),
    skipAddingFilesFromTsConfig: true,
  });

  // 查找 packages/components 下的所有文件
  const filePaths = await glob("**/*", { // ** 任意目录  * 任意文件
    cwd: compRoot,
    onlyFiles: true,
    absolute: true,
  });

  console.log('filePaths--->>>>>>', filePaths)
  // filePaths--->>>>>> [
  //   '/Users/shinho/Desktop/c-plus2/packages/components/index.ts',
  //   '/Users/shinho/Desktop/c-plus2/packages/components/package.json',
  //   '/Users/shinho/Desktop/c-plus2/packages/components/icon/index.ts',
  //   '/Users/shinho/Desktop/c-plus2/packages/components/icon/src/icon.ts',
  //   '/Users/shinho/Desktop/c-plus2/packages/components/icon/src/icon.vue'
  // ]

  const sourceFiles: SourceFile[] = [];

  await Promise.all(
    filePaths.map(async function (file) {
      // 处理以.vue结尾的， 为每个文件中的 script 模块生成.d.ts 文件
      if (file.endsWith(".vue")) {
        const content = await fs.readFile(file, "utf8");
        // 解析文件内容
        const sfc = VueCompiler.parse(content);
        const { script } = sfc.descriptor;

        // 拿到 script 脚本生成 .d.ts 文件 [icon.vue.ts  => icon.vue.d.ts]
        if (script) {
          const content = script.content; 
          // 创建一个源文件
          const sourceFile = project.createSourceFile(file + ".ts", content);
          sourceFiles.push(sourceFile);
        }
      } else {
        // 其他ts文生成.d.ts文件  按文件路径添加源文件
        const sourceFile = project.addSourceFileAtPath(file);
        sourceFiles.push(sourceFile);
      }
    })
  );
  // 获取原始的 ts 文件将它们输出为 .d.ts 文件， 默认放在缓存中
  await project.emit({
    // 仅发出声明文件
    emitOnlyDtsFiles: true,
  });

  console.log('sourceFiles---->>>>>', sourceFiles)

  const tasks = sourceFiles.map(async (sourceFile: any) => {
    const emitOutput = sourceFile.getEmitOutput(); // 获取发射输出
    // console.log('emitOutput------>>>', emitOutput)
    // 获取输出的文件内容遍历取出每个文件的路径，写入文件中
    const lists = emitOutput.getOutputFiles().map(async (outputFile: any) => {
      const filepath = outputFile.getFilePath(); // 获取输出文件的路径地址
      console.log('filepath----->>', filepath)
      // /Users/shinho/Desktop/c-plus2/dist/types/components/index.d.ts
      // /Users/shinho/Desktop/c-plus2/dist/types/components/icon/index.d.ts
      // /Users/shinho/Desktop/c-plus2/dist/types/components/icon/src/icon.d.ts
      // /Users/shinho/Desktop/c-plus2/dist/types/components/icon/src/icon.vue.d.ts

      // 创建文件目录 【recursive: 创建父文件夹】
      await fs.mkdir(path.dirname(filepath), { recursive: true });
      // 将文件内容写入， 路径替换将 @c-plus 替换为 c-plus/es
      await fs.writeFile(filepath, pathRewriter("es")(outputFile.getText()));
    });

    console.log('lists----->>', lists)
    await Promise.all(lists);
  });

  await Promise.all(tasks)
}

// 将生成的.d.ts文件拷贝到对应的组件下
function copyTypes () {
  // 获取 dist 目录下的 types/components
  const src = path.resolve(outDir, 'types/components/')
  const copy = (module) => {
    // 输出到 dist 下的 es / lib 下的 components 下
    const output = path.resolve(outDir, module, 'components')

    return () => run(`cp -r ${src}/* ${output}`)
  }

  return parallel(copy('es'), copy('lib'))
}

// 打包组件components入口
async function buildComponentEntry () {
  const config = {
    input: path.resolve(compRoot, 'index.ts'),  // packages/components/index.ts
    plugins: [typescript()],
    external: () => true
  }
  const bundle = await rollup(config)
  return Promise.all(
    Object.values(buildConfig)
      .map((config) => ({
        format: config.format,
        file: path.resolve(config.output.path, 'components/index.js')
      }))
      .map((config) => bundle.write(config as OutputOptions))
  )
}

export const buildComponent = series(buildEachComponent, genTypes, copyTypes(), buildComponentEntry);