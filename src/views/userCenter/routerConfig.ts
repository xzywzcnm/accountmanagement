const routes = [
  {
    name: '用户管理',
    path: '/userCenter/management',
    component: () => import('./pages/userManagement.vue'),
    meta: {requireAuth: true, keepAlive: false}
  },
  {
    name: '岗位管理',
    path: '/userCenter/jobsManagement',
    component: () => import("./pages/jobsManagement.vue"),
    meta: {requireAuth: true, keepAlive: false}
  }
];
export default routes
