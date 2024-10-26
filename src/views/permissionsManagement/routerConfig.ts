const routes = [
  {
    name: '权限管理',
    path: '/permissions/management',
    component: () => import('./pages/management.vue'),
    meta: {
      requireAuth: true,
      hidden: false,
      keepAlive: false
    }
  },
  {
    name: '角色管理',
    path: '/permissions/roleManagement',
    component: () => import('./pages/roleManagement.vue'),
    meta: {
      requireAuth: true,
      hidden: false,
      keepAlive: false
    }
  }
];
export default routes
