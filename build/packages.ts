import path from 'path';
import GulpTs from 'gulp-typescript'
import { series, parallel, src, dest } from 'gulp'

import { withTaskName } from './utils';
import { buildConfig } from './utils/config'
import { outDir, projectRoot } from './utils/paths';

export const buildPackages = (dirname:string, name:string) => {
    // 打包的格式需要是什么类型的？ 模块规范cjs，es模块规范，umd是在浏览器中用的
    // 使用 gulp 让ts文件转化为js文件
    const tasks = Object.entries(buildConfig).map(([module, config])=>{
        // 获取文件输出路径
        const output = path.resolve(dirname,config.output.name);

        return series(
            withTaskName(`buld:${dirname}`,()=>{
                // 获取 tsconfig 文件
                const tsConfig = path.resolve(projectRoot,'tsconfig.json');
                // 定义入口文件范围
                const inputs = ['**/*.ts',"!gulpfile.ts",'!node_modules'];
                // 使用 tsconfig 文件,需要使用插件的createProject方法创建
                const gulpTs = GulpTs.createProject(tsConfig, {
                    // 覆盖 tsconfig 文件中的一些配置
                    declaration: true, // 需要生成对应的声明文件
                    strict: false,
                    module: config.module // 指定使用的模块
                })
                return src(inputs)
                    .pipe(gulpTs())
                    // .pipe(dest(output))
                    .pipe(dest(path.resolve(outDir, config.output.name, name)))
            }),
            // withTaskName(`copy:${dirname}`, ()=>{
            //     // 将utils模块拷贝到dist下的es目录和lib目录下
            //     return src(`${output}/**`)
            //         .pipe(dest(path.resolve(outDir, config.output.name, name)))
            // })
        )
    })
    // 并行处理打包
    return parallel(...tasks)
}

