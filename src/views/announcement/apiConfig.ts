const upms = '/dyt-cloud-upms-admin'
let api = {
  // 公告
  announcement: {
    // 保存公告
    save: '/sys/notice/save',
    // 作废公告
    remove: '/sys/notice/remove',
    // 查询公告列表
    list: '/sys/notice/list',
    // 更新公告
    update: '/sys/notice/update',
    // 获取公告详情
    getDetails: '/sys/notice/get',
    // 重置所有用户忽略公告状态(通知所有用户查看第一条公告)
    resetNotice: '/sys/user/resetNotice'
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