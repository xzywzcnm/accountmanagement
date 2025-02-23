import { createApp } from 'vue'
import App from './App.vue'
import "@/assets/style/index.less";
import "@/utils/loadIconFont";
import dayjs from 'dayjs';
import $common from "$common";
import bus from '@/utils/bus';
import $http from "$request";
import $api from '$api';
import localforage from 'localforage';
// 页面引导组件样式
import 'driver.js/dist/driver.min.css';
import Driver from 'driver.js';
import * as lodash from 'lodash';
import store from "@/store/index";
import router from "@/router/index";
import customComponents from './components/index';
import 'element-plus/theme-chalk/index.css';
import ElementPlus from 'element-plus';
// import elFormValidate from "@/utils/elFormValidate";
import zhCn from 'element-plus/es/locale/lang/zh-cn'; // 引入中文包，否则默认文本为英文
import { ClickOutside as vClickOutside } from 'element-plus';
// console.log(import.meta.env);

const app = createApp(App);
// 注册 Element
app.use(ElementPlus, {
  // 默认尺寸
  size: 'default',
  // 弹窗初始值
  zIndex: 1000,
  // 国际化
  locale: zhCn
});
app.config.globalProperties.$dayjs = dayjs;
// 注册全局对象
app.config.globalProperties.$common = $common;
app.config.globalProperties.$bus = bus;
app.config.globalProperties.api = $api;
app.config.globalProperties.$http = $http;
app.config.globalProperties.lodash = lodash;
app.config.globalProperties.localforage = localforage;
app.config.globalProperties.$driver = Driver;

// 注册 store
app.use(store);
// 注册 router
app.use(router);
// 注册自定义全局组件
app.use(customComponents);
// 注册点击元素之外的指令
app.directive('clickOutside', vClickOutside);
app.mount('#app');
// console.log(import.meta.env);

// 使用 setup 时, 获取全局挂载方式, 获取当前组件的实例、上下文来操作router和vuex等
// 注意的点：千万不要在 getCurrentInstance() 中获取 ctx; 在生产环境下， 获取到的 ctx 为空
// import getGlobal from "@/utils/global";
// const global =  getGlobal();