const upms = '/dyt-cloud-upms-admin';
const oss = '/dyt-cloud-oss-admin';

let globalApi = {
  department: {
    // 获取单个部门
    get: '/sys/dept/get',
    // 获取部门树
    deptSelect: '/sys/dept/treeList'
  },
  systemApi: {
    // 查找单个系统信息
    get: '/sys/system/get',
    // 查找所有系统树
    treeList: '/sys/system/treeList'
  },
  menuApi: {
    // 查找单个菜单信息
    get: '/sys/menu/get',
    // 查找所有菜单树
    treeList: '/sys/menu/treeList'
  },
  permissions: {
    // 查找单个权限
    get: '/sys/permission/get',
    // 查询权限列表
    treeList: '/sys/permission/treeList'
  },
  role: {
    // 获取单个角色信息
    get: '/sys/role/get',
    // 查询角色列表
    list: '/sys/role/list'
  },
  division: {
    // 查询所有事业部
    list: '/sys/businessDept/list',
  }
}
// 文件上传, 参数 pathType 值必须为 1
let ossAdmin = {
  common: {
    upload: '/common/upload'
  }
}
const apiHand = (obj:any, str:any) => {
  for (let key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = `${str}${obj[key]}`;
    } else {
      apiHand(obj[key], str);
    }
  }
}
apiHand(globalApi, upms);
apiHand(ossAdmin, oss);

export default {
  ...globalApi, ...ossAdmin
};
