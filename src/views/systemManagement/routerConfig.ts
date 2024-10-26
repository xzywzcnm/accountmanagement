const routes = [
  {
    name: '系统管理',
    path: '/system/management',
    component: () => import('./pages/systemManagement.vue'),
    meta: {requireAuth: true, keepAlive: true}
  }
];
export default routes
