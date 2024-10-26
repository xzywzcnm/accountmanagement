const upms = '/dyt-cloud-upms-admin'
let api = {
  // 事业部
  division: {
    // 新增
    save: '/sys/businessDept/save',
    // 更新
    update: '/sys/businessDept/update',
    // 查询单个事业部
    getInfo: '/sys/businessDept/get',
    // 更新事业部是否启用状态
    updateEnable: '/sys/businessDept/updateEnable',
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