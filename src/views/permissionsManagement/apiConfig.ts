const upms = '/dyt-cloud-upms-admin'
let api = {
  permissions: {
    // 增加权限
    save: '/sys/permission/save',
    // 删除权限
    remove: '/sys/permission/remove',
    // 更新权限
    update: '/sys/permission/update'
  },
  role: {
    // 增加角色
    save: '/sys/role/save',
    // 删除角色
    remove: '/sys/role/remove',
    // 更新角色
    update: '/sys/role/update',
    // 获取单个角色信息
    get: '/sys/role/get',
    // 查询系统角色权限关系
    treeList: '/sys/rolePermissionRel/treeList',
    // 保存系统角色权限关系
    saveOrUpdate: '/sys/rolePermissionRel/saveOrUpdate'
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