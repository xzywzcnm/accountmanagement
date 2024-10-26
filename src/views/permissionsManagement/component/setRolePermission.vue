<template>
  <dyt-dialog
    v-model="dialogVisible"
    :title="modalTitle"
    top="8vh"
    custom-class="custom-class-setrole"
  >
    <div
      v-loading="pageLoading"
      style="height:100%;"
      class="module-custom"
    >
      <div class="module-item">
        <dyt-input
          v-model="navTreeFilter"
          style="margin-top: 10px;"
          placeholder="请输入关键字查询"
        />
        <el-tree
          ref="setNavRoleTree"
          class="item-tree"
          :data="navTreeData"
          show-checkbox
          node-key="id"
          :check-strictly="true"
          :highlight-current="true"
          :expand-on-click-node="true"
          :default-checked-keys="checkedNavKeys"
          :default-expanded-keys="defaultExpandedKeys"
          :filter-node-method="filterNode"
          :empty-text="(navTreeData.length > 0 ? itemEmptyText || '未匹配到对应数据' : '暂无数据，请到 “权限设置” 配置')"
          :props="defaultProps"
          @check="treeDataCheck"
          @node-expand="nodeExpand"
          @node-collapse="nodeCollapse"
        >
          <template v-slot="scope">
            <div>
              <i
                class="lapa"
                :class="{
                  'icon-menu': [1, '1'].includes(scope.data.type),
                  'icon-power': [2, '2'].includes(scope.data.type),
                  'icon-eye': ['view'].includes(scope.data.viewType),
                  'icon-interface': [4, '4'].includes(scope.data.type)
                }"
                style="padding-right: 2px;"
              />
              {{ scope.data.name }}
            </div>
          </template>
        </el-tree>
      </div>
    </div>
    <template v-slot:footer>
      <div v-if="power.saveOrUpdate">
        <dyt-button @click="addRowHand('close')">
          取 消
        </dyt-button>
        <dyt-button
          type="primary"
          @click="addRowHand('save')"
        >
          确定
        </dyt-button>
      </div>
    </template>
  </dyt-dialog>
</template>
<script>
const constant = {
  menuView: '显示菜单'
}

export default {
  name: 'AddEditUser',
  components: {},
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    refresh: {
      type: Boolean,
      default: false
    },
    moduleData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    systemInfo: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      pageLoading: false,
      dialogVisible: false,
      navTreeFilter: '',
      navTreeData: [],
      checkedNavKeys: [],
      defaultExpandedKeys: [],
      navTreeObject: {},
      itemEmptyText: '',
      defaultProps: {
        children: 'childList',
        label: 'name'
      },
      system: null,
      roleId: ''
    }
  },
  watch: {
    visible: {
      immediate: true,
      deep: true,
      handler (val) {
        this.dialogVisible = val;
      }
    },
    dialogVisible: {
      deep: true,
      handler (val) {
        this.$emit('update:visible', val);
        val && this.initData();
      }
    },
    navTreeFilter: {
      deep: true,
      handler (val) {
        this.$refs.setNavRoleTree && this.$refs.setNavRoleTree.filter(val);
      }
    }
  },
  computed: {
    modalTitle () {
      if (this.$common.isEmpty(this.moduleData)) return '设置权限';
      const system = this.systemInfo[this.moduleData.systemId] || {};
      return `设置权限-${system.name}(${this.moduleData.name})`;
    },
    power () {
      return this.$common.getPower({
        saveOrUpdate: 'roleManagement_saveOrUpdate'
      })
    }
  },
  created() {
    // this.initData();
  },
  // 页面渲染完
  mounted() {},
  // 组件销毁前
  beforeUnmount () {},
  methods: {
    initData () {
      this.navTreeData = [];
      if (this.$common.isEmpty(this.moduleData)) return;
      if (this.$common.isEmpty(this.moduleData.systemId) || this.$common.isEmpty(this.moduleData.id)) return;
      // 打开弹窗时清空选中
      this.$refs.setNavRoleTree && this.$refs.setNavRoleTree.setCheckedKeys([]);
      this.roleId = this.moduleData.id;
      this.system = this.systemInfo[this.moduleData.systemId] || {};
      if (this.$common.isEmpty(this.system)) return;
      this.pageLoading = true;
      Promise.all([this.getPermissionTree(), this.getRolePermission()]).then(arr => {
        this.navTreeData = this.treeDataHand(arr[0]);
        this.navTreeObject = this.getTreeObject(this.navTreeData);
        // 默认展开节点
        // this.defaultExpandedKeys = this.navTreeData.map(item => item.id);
        this.defaultExpandedKeys = Object.keys(this.navTreeObject);
        const checkedKeys = this.getChildIds(arr[1]);
        const emptyKeys = this.getEmptyKeys(this.navTreeData, this.$common.copy(checkedKeys));
        this.checkedNavKeys = [...checkedKeys, ...emptyKeys];
        this.pageLoading = false;
      }).catch(error => {
        console.error(error);
        this.pageLoading = false;
      })
    },
    // 获取当前系统菜单权限树
    getPermissionTree (type = '') {
      return new Promise((reslove, reject) => {
        this.$http.get(this.api.globalApi.permissions.treeList, {
          params: {
            systemId: this.system.id,
            type: type
          }
        }).then(res => {
          reslove((res.data && res.data.childList) ? res.data.childList : []);
        }).catch((error) => {
          this.itemEmptyText = error.msg || '未知错误';
          reslove([]);
        })
      })
    },
    // 树数据处理
    treeDataHand (data) {
      const tool = {
        pushChild: (item) => {
          return {
            name: constant.menuView,
            viewType: 'view',
            id: `${item.id}-view`,
            parentIds: this.$common.isEmpty(item.parentIds) ? item.id.toString() : `${item.parentIds}.${item.id}`,
            parentId: `${item.id}`,
            permission: item.permission,
            disabled: this.$common.isEmpty(item.permission)
          }
        },
        hand: (arr = [], newArr = []) => {
          let index = 0;
          arr.forEach(item => {
            if ([0, '0'].includes(item.enable)) return;
            item.id = item.id.toString();
            item.parentId = item.parentId.toString();
            if (![3, '3'].includes(item.type)) {
              const children = item.childList || [];
              delete item.childList;
              newArr.push(item);
              if ([1, '1'].includes(item.type)) {
                item['disabled'] = this.$common.isEmpty(item.permission);
                if (!this.$common.isEmpty(children)) {
                  children.splice(0, 0, tool.pushChild(item));
                  newArr[index]['childList'] = [];
                } else if (this.$common.isEmpty(newArr[index].childList)) {
                  newArr[index]['childList'] = [tool.pushChild(item)];
                }
                tool.hand(children, newArr[index].childList);
              } else if (!this.$common.isEmpty(children)) {
                this.$common.isEmpty(newArr[index].childList) && (newArr[index]['childList'] = []);
                tool.hand(children, newArr[index].childList);
              }
              index++;
            }
          })
          return newArr;
        }
      }
      const newTreeData = tool.hand(this.$common.copy(data));
      return newTreeData;
    },
    // 获取当前角色权限关系树
    getRolePermission () {
      return new Promise((reslove, reject) => {
        this.$http.get(this.api.role.treeList, {
          params: {
            roleId: this.roleId,
            parentId: -1
          }
        }).then(res => {
          reslove((res.data && res.data.childList) ? res.data.childList : []);
        }).catch(() => {
          reslove([]);
        })
      })
    },
    getTreeObject (arr = [], obj = {}) {
      arr.forEach(item => {
        obj[item.id] = item;
        this.getTreeObject(item.childList, obj);
      })
      return obj
    },
    // 保存数据
    addRowHand (type) {
      if (type === 'close') {
        this.dialogVisible = false;
        return;
      }
      this.getCheckedData().then(checkRes => {
        this.pageLoading = true;
        this.$http.post(this.api.role.saveOrUpdate, {...checkRes, roleId: this.roleId}).then(res => {
          this.pageLoading = false;
          this.dialogVisible = false;
          this.$emit('update:refresh', true);
          this.$message.success('操作成功！');
        }).catch(() => {
          this.pageLoading = false;
        })
      });
    },
    // 搜索
    filterNode (value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
    // 节点被展开时触发的事件
    nodeExpand (data, node) {
      // !this.defaultExpandedKeys.includes(data.id) && !this.addExpandeKeys.includes(data.id) && this.addExpandeKeys.push(data.id);
    },
    // 节点被关闭时触发的事件
    nodeCollapse (data, node, ref) {
      // this.addExpandeKeys.includes(data.id) && this.addExpandeKeys.splice(this.addExpandeKeys.indexOf(data.id),1);
    },
    // 点击树复选框时
    treeDataCheck (data, checked) {
      // 当无父级时不做处理
      const { checkedKeys } = checked || {};
      // 获取已勾选的值
      const oldCheckNone = this.$refs.setNavRoleTree.getCheckedNodes();
      let checkIds = (oldCheckNone || []).map(item => item.id);
      this.$nextTick(() => {
        if (checkedKeys.includes(data.id)) {
          // 勾选权限
          let parentList = [];
          if (!this.$common.isEmpty(data.parentIds)) {
            data.parentIds.split('.').forEach(id => {
              this.navTreeObject[id].childList.forEach(item => {
                // 勾选父级查看权限
                parentList.push(item.parentId);
                if (['view'].includes(item.viewType)) {
                  parentList.push(item.id)
                }
              })
            });
            const childId = data.parentIds.split('.')[0];
            const emptyKeys = this.getEmptyKeys(this.navTreeObject[childId].childList, [childId]);
            checkIds = [...checkIds, ...emptyKeys];
          }
          if (!this.$common.isEmpty(data.childList)) {
            checkIds = [...checkIds, ...this.getChildIds(data.childList, [])];
          }
          this.$refs.setNavRoleTree.setCheckedKeys(Array.from(new Set([...checkIds, ...parentList])));
        } else {
          // 取消勾选
          let cancelCheck = [];
          if (['view'].includes(data.viewType) && this.navTreeObject[data.parentId]) {
            cancelCheck = this.getChildIds(this.navTreeObject[data.parentId].childList, []);
            cancelCheck.push(this.navTreeObject[data.parentId].id);
          } else if (!this.$common.isEmpty(data.childList)) {
            cancelCheck = this.getChildIds(data.childList, []);
          }
          const newCheck = checkIds.filter(item => {
            return !cancelCheck.includes(item);
          })
          this.$refs.setNavRoleTree.setCheckedKeys(Array.from(new Set(newCheck)));
          // console.log(cancelCheck);
        }
      })
    },
    // 获取所有选中的节点数据
    getCheckedData () {
      return new Promise(reslove => {
        const checkNodes = this.$refs.setNavRoleTree.getCheckedNodes();
        const checkNodeIds = checkNodes.filter(item => !item.viewType).map(item => item.id);
        const idArry = Array.from(new Set(checkNodes.map(item => item.parentIds)));
        let parentId = idArry.map(item => {
          const arr = this.$common.isEmpty(item) ? [] : item.split('.');
          return { arrLen: arr.length, arr: arr}
        })
        parentId = parentId.sort((a, b) => {
          return a.arrLen - b.arrLen
        })[0];
        if (parentId) {
          parentId = parentId.arr[0] ? parentId.arr[0] : '-1';
        } else {
          parentId = '-1';
        }
        reslove({
          permissionIds: checkNodeIds ? checkNodeIds.join(',') : '',
          parentId: Number(parentId)
        });
      })
    },
    // 获取所有子级ID
    getChildIds (arr = [], check = []) {
      arr.forEach(item => {
        item.id = item.id.toString();
        !check.includes(item.id) && check.push(item.id);
        if ([1, '1'].includes(item.type) && !check.includes(`${item.id}-view`)) {
          check.push(`${item.id}-view`);
        }
        if (!this.$common.isEmpty(item.childList)) {
          this.getChildIds(item.childList, check);
        }
      })
      return check;
    },
    // 获取所有空权限ID
    getEmptyKeys (arr = [], parentIds = [], check = []) {
      arr.forEach(item => {
        if (this.$common.isEmpty(item.permission)) {
          !parentIds.includes(item.id) && parentIds.push(item.id);
          !check.includes(item.id) && check.push(item.id);
          if ([1, '1'].includes(item.type) && !check.includes(`${item.id}-view`)) {
            check.push(`${item.id}-view`);
          }
        }
        if (!this.$common.isEmpty(item.childList) && parentIds.includes(item.id)) {
          this.getEmptyKeys(item.childList, parentIds, check);
        }
      })
      return check;
    }
  }
};
</script>
<style lang="scss" scoped>
.module-custom{
  position: relative;
  display: flex;
  .module-item{
    flex: 50;
    padding: 0 10px;
    margin-left: 15px;
    border-radius: 5px;
    border: 1px solid var(--layout-border-color);
    .item-head{
      line-height: 40px;
    }
  }
  .item-tree{
    margin: 15px 0;
    height: calc(80vh - 230px);
    overflow: auto;
  }
}
</style>
<style lang="scss">
  .dialog-custom-class.el-dialog.custom-class-setrole{
    .el-dialog__body{
      max-height: calc(84vh - 90px);
    }
  }
</style>