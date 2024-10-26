const routes = [
  {
    name: '天气管理',
    path: '/weather/weatherManage',
    component: () => import('./pages/weatherManageList.vue'),
    meta: {requireAuth: true, keepAlive: false}
  }
];
export default routes
