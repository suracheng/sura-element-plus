## 项目结构
├── README.md
├── build           编译相关代码
├── docs            文档
├── package.json
├── packages        主要内容
│   ├── __mocks__
│   ├── components   组件
│   ├── directives   指令
│   ├── element-plus
│   ├── hooks
│   ├── locale
│   ├── test-utils
│   ├── theme-chalk  样式
│   ├── tokens
│   └── utils        工具包
├── play             测试demo
├── pnpm-workspace.yaml
├── scripts          脚本
├── tsconfig.json 
└── typings .d.ts    全局声明

## 搭建 `monorepo` 环境
1. `monorepo` 简介
    1. monorepo 全称 monolithic repository （巨型仓库） 是一种管理项目代码的方式，指在一个项目中管理多个模块/包（package）
    ├── packages 其他模块放置在该目录下
    |   ├── pkg1
    |   |   ├── package.json
    |   ├── pkg2
    |   |   ├── package.json
    ├── package.json 第一层内容

    2. 使用 monorepo 好处：多模块在一个项目下，方便开发调试（依赖的模块不需要单独下载repo，依赖多模块时可以统一调试，发版， 方便管理）
    3. 弊端：repo 体积可能会很大， 因为每个 package 理论上是独立的，因此都有自己的 dependencies， 这时，不同的模块可能安装了相同的依赖， install 时会出现重复安装，导致 node_module 膨胀
    3. 管理工具 lerna （处理发版问题 统一的工作流），yarn 的 workspaces （处理依赖问题， 以 semver 的约定来分析 dependencies，， 相同的提到 repo 根目录下）

    - 参考文章
    1. https://www.jianshu.com/p/dafc2052eedc
    2. https://segmentfault.com/a/1190000019309820?utm_source=tag-newest

2. 使用 `pnpm` 作为包管理工具
    1. 全称`performant npm`高性能的npm
    2. pnpm 会在全局生成一个 store 目录用来存放 node_modules 下文件的 hard link, 查找项目中 node_modules 下的包时，会通过软链找到 .pnpm 下的文件目录， 然后在通过hard link在全局 store 中查找
    3. 解决了npm 的两个痛点： 
        1. 幽灵依赖 (npm v3 版本之后，yarn 中也存在) - 即在 package.json 中不存在的依赖，项目中也能引用到 (foo 中依赖了bar, 安装时node_modules会被打平处理，即foo与bar的依赖会出现在同一层级， 那能引入foo，也能引入bar)
        2. npm 包重复安装

```bash
node_modules 软链到 node_modules 下的 .pnpm 目录下的真实依赖， 真实依赖通过 hard link 存储到全局 store 中
└── bar // symlink to .pnpm/bar@1.0.0/node_modules/bar
└── foo // symlink to .pnpm/foo@1.0.0/node_modules/foo
└── .pnpm
    ├── bar@1.0.0
    │   └── node_modules
    │       └── bar -> <store>/bar
    │           ├── index.js
    │           └── package.json
    └── foo@1.0.0
        └── node_modules
            └── foo -> <store>/foo
                ├── index.js
                └── package.json
```

3. 在项目根目录下建立`pnpm-workspace.yaml`配置文件

### 项目生成
```bash
npm install pnpm -g
pnpm init -y
pnpm install vue@next typescript -D # 安装 vue ts
npx tsc --init # 初始化ts配置文件
# tsconfig.json 文件配置 ts 编译格式，可以根据配置文件编译成相对应的 js 文件
```

## 二.创建组件测试环境

```bash
mkdir play && cd play
pnpm init
pnpm install vite @vitejs/plugin-vue # 安装vite及插件
```

- play 下 创建 **vite.config.js** 配置 vite [文档](https://vitejs.cn/config/#config-intellisense)
- root 下对 vue 模块进行 declare 声明

## packages 目录
```bash
packages
    ├─components  # 存放所有的组件
    ├─utils       # 存放工具方法
    └─theme-chalk # 存放对应的样式
```
1. 模块初始化
```bash
cd components && pnpm init  # @c-plus/components
cd utils && pnpm init       # @c-plus/utils
cd theme-chalk && pnpm init # @c-plus/theme-chalk
```

2. 根目录下添加依赖项
```bash
pnpm install @c-plus/components -w
pnpm install @c-plus/theme-chalk -w
pnpm install @c-plus/utils -w
```

## Icon 组件
1. 组件编写
2. 组件导出
    - 导出的时候需要包裹 install 方法 `app.use(CIcon)`

## 主题样式 
```bash
theme-chalk
│  └─src
│      ├─fonts  # 存放字体
│      └─mixins 
│		    └─config.scss # BEM规范命名
```
- scss 相关语法
- 组件样式导出

## **打包**
> 1. glup 流程控制，做代码转化处理 [文档](https://www.gulpjs.com.cn/docs/api/concepts/)

1. 安装

```bash
# pnpm install gulp @types/gulp sucrase -w -D  (sucrase ->  babel平替，速度比babel快)

"scripts": {
    "build": "gulp -f build/gulpfile.ts" # gulp --gulpfile 手动设置 gulpfile 路径
}
```

2. `gulpfile.ts` 配置文件

3. 执行 `pnpm build` 执行打包流程
```bash
# 依赖包安装
pnpm install sass gulp-sass gulp-clean-css gulp-autoprefixer @types/gulp-sass @types/sass @types/gulp-autoprefixer @types/gulp-clean-css 
```

4. 执行 `buildPackages` 任务， 会对应执行 packages 下每个子模块的打包流程

### 样式转换处理
> **`theme-chalk/gulpfile.ts`**

- 用 gulp-sass 相关插件处理 sass 文件， 将处理的文件拷贝到 root 的dist目录下

### utils 工具模块处理
> **`utils/gulpfile.ts`**

```bash
pnpm install gulp-typescript -w -D  # 处理 ts 编译工作流的插件
```

### 组件库整体打包

1. 创建组件库入口 `index.ts`

2. 创建打包组件库的入口
```bash
mkdir c-plus && cd c-plus
pnpm init
# 入口文件 index.ts 代码编写
```

3. 新增组件库打包命令
    - 新增 `buildFullComponent` 命令
```bash
pnpm install rollup @rollup/plugin-node-resolve @rollup/plugin-commonjs rollup-plugin-typescript2 rollup-plugin-vue -D -w
```

4. 打包`umd`和`es`模块


### 对组件依次进行打包
1. 找到 `components` 文件下所有组件依次进行打包
```bash
pnpm install fast-glob -w -D  # nodejs glob库，能快速遍历文件系统
```

2. 给每个组件添加类型声明
```bash
pnpm i ts-morph -w -D # 为每个组件添加 ts 声明文件， 根据tsconfig.json 生成ts文件
```
3. components 组件打包
4. c-plus 打包

### 打包入口文件
1. 打包package/c-plus入口文件输出作为dist文件下 es / lib 的入口
2. 打包package/components/index 输出到dist文件下 es / lib下作为入口文件
3. 生成 .d.ts 声明文件入口（找到packages/c-plus/index 生成.d.ts文件拷贝到es/lib下）

## package.json
```js
"main": "lib/index.js", // npm包的入口文件, 浏览器与node环境均可使用
"module": "es/index.js", // 定义 npm 包的 ESM 规范的入口文件，browser 环境和 node 环境均可使用
```

> umd 通用的模块化系统（是amd与commonjs的结合体）， 与 amd CommonJS 兼容

#### CommonJS 与 ES6 模块的差异
1. CommonJS 模块输出的是值的拷贝，ES6 模块输出的是值的引用
2. CommonJS 模块是运行时加载，ES6 模块是编译时输出接口
3. CommonJS 模块导出的是一个对象（module.exports 属性），该对象只在脚本运行完才会生成。
4. ES6 的模块机制是 JS 引擎对脚本进行静态分析的时候，遇到模块加载命令 import，就会生成一个只读引用，等到脚本真正执行时，再根据这个只读引用到被加载的模块中取值

#### UMD 实现原理
1. 先判断是否支持 Node.js 模块格式（exports 是否存在），存在则使用 Node.js 模块格式
2. 再判断是否支持 AMD 模块格式（define 是否存在），存在则使用 AMD 模块格式
3. 前2个都不存在则将模块公开到全局（window 或 global）


## 参考文档
- [ts](https://www.tslang.cn/docs/home.html)
- [gulp](https://www.gulpjs.com.cn/docs/api/concepts/)
- [rollup](https://www.rollupjs.com/guide/big-list-of-options)
- [ts-morph](https://ts-morph.com/)
- [模块化规范](https://www.cnblogs.com/qianxiaox/p/14017226.html)
- [pnpm文档](https://pnpm.io/zh/motivation) 
- [pnpm介绍](https://zhuanlan.zhihu.com/p/404784010)


组件库介绍
1. 项目目录结构
2. monorepo
3. pnpm
3. 环境搭建
4. 打包执行流程
5. 细节