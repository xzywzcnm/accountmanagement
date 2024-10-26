const routes = [
  {
    name: '事业部管理',
    path: '/division/management',
    component: () => import('./pages/divisionList.vue'),
    meta: {requireAuth: true, keepAlive: true}
  }
];
export default routes
