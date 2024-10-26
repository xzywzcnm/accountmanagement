const upms = '/dyt-cloud-upms-admin'
let api = {
  // 部门
  department: {
    // 新增部门
    save: '/sys/dept/save',
    // 移除部门
    remove: '/sys/dept/remove',
    // 更新部门
    update: '/sys/dept/update',
    // 批量更新(存在子级的使用此接口)
    updateList: '/sys/dept/updateList'
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