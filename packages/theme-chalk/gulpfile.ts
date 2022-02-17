// 打包样式
import path from "path";
import { series, src, dest } from "gulp";

import dartSass from "sass";
import gulpSass from "gulp-sass"; // 编译处理 sass
import autoprefixer from "gulp-autoprefixer"; // 添加前缀
import cleanCss from "gulp-clean-css"; // 压缩css, 添加版本号避免缓存

// 编译处理 scss 文件
function compile() {
  const sass = gulpSass(dartSass);

  // src 创建一个读取的文件流
  return src(path.resolve(__dirname, "./src/*.scss"))
    .pipe(sass.sync()) // 将 sass 文件同步处理成css文件 【gulp-sass Github】
    .pipe(autoprefixer())
    .pipe(cleanCss())
    .pipe(dest(path.resolve(__dirname, "../../dist/theme-chalk/css")));
}

// 拷贝font文件
function copyfont() {

  return src(path.resolve(__dirname, "./src/fonts/**"))
    .pipe(cleanCss())
    .pipe(dest(path.resolve(__dirname, "../../dist/theme-chalk/fonts")));
}

export default series(compile, copyfont);
