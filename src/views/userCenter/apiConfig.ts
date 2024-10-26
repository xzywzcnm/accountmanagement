const upms = '/dyt-cloud-upms-admin'
let api = {
  // 用户
  management: {
    // 查询所有用户信息
    selectUserInfo: '/sys/user/userInfoList',
    // 新增用户
    addUser: '/sys/user/save',
    // 修改用户
    update: '/sys/user/update',
    // 修改账号停用启用状态
    updateEnable: '/sys/account/updateEnable'
  },
  // 岗位
  jobs: {
    // 增加个人岗位
    save: '/sys/position/save',
    // 删除个人岗位
    remove: '/sys/position/remove',
    // 更新个人岗位
    update: '/sys/position/update',
    // 查找个人岗位
    get: '/sys/position/get',
    // 获取岗位树
    treeList: '/sys/position/treeList'
  },
  setRole: {
    // 查询系统用户角色关系
    list: '/sys/userRoleRel/list',
    // 保存用户角色关系
    saveOrUpdate: '/sys/userRoleRel/saveOrUpdate'
  },
  // 日志
  operationLog: {
    // 获取用户登录日志
    listByUserId: '/sys/loginLog/listByUserId'
  }
}

const apiHand = (obj:any, str:string) => {
  for (let key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = `${str}${obj[key]}`;
    } else {
      apiHand(obj[key], str);
    }
  }
}
apiHand(api, upms);
export default api