// 打包 ts 入口文件
import path from 'path'
import fs from 'fs/promises'
import glob from 'fast-glob';
import { parallel, series } from "gulp";
import {Project,ModuleKind,ScriptTarget,SourceFile} from 'ts-morph'

import { run, withTaskName } from "./utils";
import { buildConfig } from "./utils/config";
import { outDir, projectRoot, cpRoot } from "./utils/paths";

async function genEntryTypes () {
  // 查找c-plus下的入口ts文件
  const files = await glob('*.ts', { 
    cwd: cpRoot, // packages/c-plus
    absolute: true, // 返回目录的绝对路径
    onlyFiles: true // 仅返回文件名
  })


  // console.log('files----', files)
  // [ '/Users/shinho/Desktop/c-plus2/packages/c-plus/index.ts' ]

  const project = new Project({
    compilerOptions: {
      declaration: true,
      module: ModuleKind.ESNext,
      allowJs: true,
      emitDeclarationOnly: true,
      noEmitOnError: false,
      outDir: path.resolve(outDir, "entry/types"),
      target: ScriptTarget.ESNext,
      rootDir: cpRoot, // packages/c-plus
      strict: false,
    },
    skipFileDependencyResolution: true,
    tsConfigFilePath: path.resolve(projectRoot, "tsconfig.json"),
    skipAddingFilesFromTsConfig: true,
  })

  const sourceFiles: SourceFile[] = []

  files.map((f) => {
    const sourceFile = project.addSourceFileAtPath(f)

    sourceFiles.push(sourceFile)
  })

  await project.emit({
    emitOnlyDtsFiles: true
  })

  const tasks = sourceFiles.map(async (sourceFile) => {
    const emitOutput = sourceFile.getEmitOutput()

    for (const outputFile of emitOutput.getOutputFiles()) {
      const filePath = outputFile.getFilePath()

      // console.log('xxxxxxxxxx', filePath)
      // /Users/shinho/Desktop/c-plus2/dist/entry/types/index.d.ts

      await fs.mkdir(path.dirname(filePath), { recursive: true })
      await fs.writeFile(filePath, outputFile.getText().replaceAll('@c-plus', '.'))
    }
  })

  await Promise.all(tasks)
}

// 将 entry/types/index.d.ts 文件拷贝到 es / lib 下
export function copyEntryTypes () {
  const src = path.resolve(outDir, 'entry/types')

  const copy = (module) => {
    return parallel(
      withTaskName(`copyEntryTypes:${module}`, () => run(
        `cp -r ${src}/* ${path.resolve(outDir, buildConfig[module].output.name)}/`
      ))
    )
  }

  return parallel(copy('esm'), copy('cjs'))
}

export const genTypes = series(genEntryTypes, copyEntryTypes())
