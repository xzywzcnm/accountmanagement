import globalApi from "../api/globalApi"; //全局API
//API 入口设置
const apiMaps:object = {};
// 获取所有 views 目录下一级 apiConfig.js 文件
const tsFiles = import.meta.globEager("../views/**/apiConfig.ts");
const jsFiles = import.meta.globEager("../views/**/apiConfig.js");
const files = {...tsFiles, ...jsFiles};
let apiKeySpin:{[key:string]: string} = {};
// console.log(files)
// 相同 API 不做提示
Object.keys(files).forEach((key) => {
  if (files[key].default) {
    Object.keys(files[key].default).forEach(apiKey => {
      if (!!apiKeySpin[apiKey]) {
        console.error(`${apiKeySpin[apiKey]} 和 ${key} 存在相同 API 标识：${apiKey}, 相同标识将被覆盖`);
      }
      apiKeySpin[apiKey] = key;
      apiMaps[apiKey] = files[key].default[apiKey];
      // if (!!globalApi[apiKey]) {
      //   apiMaps[apiKey] = {...apiMaps[apiKey], ...globalApi[apiKey]}
      //   delete globalApi[apiKey];
      // }
    })
  }
});
export default { ...apiMaps, globalApi: globalApi };
