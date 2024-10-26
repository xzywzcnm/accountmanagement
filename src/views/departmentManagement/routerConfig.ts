const routes = [
  {
    name: '部门管理',
    path: '/departmentManagement/department',
    component: () => import('./pages/department.vue'),
    meta: {requireAuth: true, keepAlive: true}
  }
];
export default routes
