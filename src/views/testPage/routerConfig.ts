const routes = [
  {
    name: '测试1',
    path: '/test3',
    component: () => import('./myPage1.vue'),
    meta: {requireAuth: false, keepAlive: false}
  },
  {
    name: '测试2',
    path: '/test4',
    component: () => import('./myPage2.vue'),
    meta: {requireAuth: false, keepAlive: false}
  },
];
export default routes
