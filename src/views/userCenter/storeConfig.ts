export default {
  moduleName: 'userCenter',
  state: {
    exitWebOauth: false,
  },
  // 对数据同步更新
  mutations: {
    exitWebOauth (state:any, data:any) {
      state.exitWebOauth = data;
    }
  },
  // 对数据异步更新
  actions: {},
  // 可以理解为computed ，对 state 进行计算处理, 直接对 参数修改会更改到 state
  getters: {
    exitWebOauth: (state:any) => {
      return state.exitWebOauth
    }
  }
}