const routes = [
  {
    name: '公告管理',
    path: '/announcement/announcement',
    component: () => import('./announcementTable.vue'),
    meta: {requireAuth: false, keepAlive: false}
  }
];
export default routes
