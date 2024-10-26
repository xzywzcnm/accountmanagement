const upms = '/dyt-cloud-upms-admin'
let api = {
  systemApi: {
    // 增加系统
    save: '/sys/system/save',
    // 删除系统
    remove: '/sys/system/remove',
    // 更新系统
    update: '/sys/system/update'
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