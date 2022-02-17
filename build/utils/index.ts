import { spawn } from "child_process";
import { projectRoot } from "./paths";

export const withTaskName = <T>(name: string, fn: T) => {
  // 将 name 作为 displayName 名称合并到函数上，作为 taskName 使用
  return Object.assign(fn, { displayName: name });
}
  

// 在node使用子进程来运行脚本
export const run = async (command: string) => {
  // rf -rf
  return new Promise((resolve) => {
    const [cmd, ...args] = command.split(" ");

    // execa这些库 
    const app = spawn(cmd, args, {
      cwd: projectRoot,
      stdio: "inherit", // 直接将这个子进程的输出
      shell: true, // 默认情况下 linux 才支持 rm -rf （我再电脑里安装了git bash）
    });
    app.on("close", resolve);
  });
};

//== 路径重写
export const pathRewriter = (format)=>{
  return (id:string)=>{
    id = id.replaceAll('@c-plus',`c-plus/${format}`);
    return id
  }
}