import type { App, Plugin } from "vue";

// 类型必须导出否则生成不了.d.ts文件
export type SFCWithInstall<T> = T & Plugin & { name: string };

// 泛型 T 定义在函数前面， 表示在函数执行的时候确定类型
export const withInstall = <T>(comp: T) => {
  const compNew = comp as SFCWithInstall<T>
  compNew.install = function (app: App):void {
    app.component(compNew.name, comp)
  }
  return compNew
};
