import { CIcon } from "@c-plus/components";
import type { App } from "vue"; // ts中的优化只获取类型
// ....


// == 批量导出
const components = [CIcon];
const install = (app: App) => {
  // 每个组件在编写的时候都提供了install方法

  // 有的是组建 有的可能是指令 xxx.install = ()=>{app.directive()}
  components.forEach((component) => app.use(component));
};
export default {
  install,
};

// == 按需加载 （解构 引用
export * from "@c-plus/components";

//app.use(ZPlus)


