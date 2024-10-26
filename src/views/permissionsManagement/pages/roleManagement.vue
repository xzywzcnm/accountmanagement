<template>
  <div class="role-management-container">
    <dyt-table
      ref="roleManagement"
      :filter-fields="filterFields"
      :filter-model="filterModel"
      :table-columns="tableColumns"
      :request-handler="requestHandler"
      :request-before="transformRequestData"
      :is-inited="isInited"
      @filterReset="filterReset"
    >
      <template v-slot:filterBottom>
        <div class="filter-bottom-box">
          <div class="filter-bottom-left">
            <dyt-button
              v-if="power.save"
              type="primary"
              icon="plus"
              @click="rowAddEdit({})"
            >
              添加角色
            </dyt-button>
          </div>
        </div>
      </template>
    </dyt-table>
    <!-- 新增(编辑) -->
    <addEditRole 
      v-model:visible="addRowVisible"
      :tree-options="(systemOptions[0] ? systemOptions[0].childList || [] : [])"
      :module-data="tableRowInfo"
      v-model:refresh="refresh"
    />
    <setRolePermission
      v-model:visible="setRoleVisible"
      :module-data="tableRowInfo"
      :system-info="systemJsons"
      v-model:refresh="refresh"
    />
  </div>
</template>
<script lang="jsx">
import addEditRole from '../component/addEditRole.vue'
import setRolePermission from '../component/setRolePermission.vue'

export default {
  name: 'Management',
  components: { addEditRole, setRolePermission },
  data() {
    return {
      isInited: false,
      refresh: false,
      addRowVisible: false,
      setRoleVisible: false,
      tableRowInfo: {},
      systemOptions: [{id: 'web-null', name: '全部'}],
      systemJsons: {},
      defaultProps: {
        value: 'id',
        label: 'name',
        children: 'childList'
      },
      // 搜索栏其他值或默认值
      filterModel: {
        systemId: 'web-null'
      },
      // 搜索栏表单部分
      filterFields: [
        // 系统树
        {
          model: 'systemId',
          label: '系统',
          render: () => {
            return (<dytTreeSelect
              style="width:300px"
              modelValue={this.filterModel.systemId}
              multiple={false}
              normalizer={this.treeNormalizer}
              defaultProps={this.defaultProps}
              options={this.systemOptions}
              placeholder="请选择系统"
              onInput={this.getSystemVal}
            />)
          }
        },
        { type: 'text', model: 'name', label: '角色名称' },
        // { type: 'text', model: 'code', label: '角色代码' }
      ],
      // 表格列
      tableColumns: [
        {label: '角色名称', prop: 'name', align: 'center', 'width': '200'},
        // {label: '角色代码', prop: 'code', align: 'center', 'width': '200'},
        {
          label: '所属系统', prop: 'systemId', align: 'center', 'width': '200',
          render: ({row}) => {
            const systemInfo = this.systemJsons[row.systemId];
            return (<div>
              {systemInfo?systemInfo.name||'':''}
            </div>)
          }
        },
        {label: '角色描述', prop: 'description', align: 'center', 'min-width': '200'},
        {
          label: '操作',
          width: 170,
          fixed: 'right',
          align: 'center',
          render: ({row}) => {
            return (<div>
              <dyt-button
                disabled={!this.power.update}
                onClick={(e) => this.rowAddEdit(row)}
                size="small"
                type="primary"
              >
                编辑
              </dyt-button>
              {
                (this.power.view || this.power.saveOrUpdate) ? (
                  <dyt-button
                    onClick={(e) => this.setRoleHnad(row)}
                    size="small"
                    type="primary"
                  >
                    {this.power.saveOrUpdate ? '权限设置' : '查看权限'}
                  </dyt-button>
                ) : ''
              }
              <dyt-button
                onClick={(e) => this.deleRow(row)}
                size="small"
                type="danger"
                disabled={!this.power.del}
              >
                删除
              </dyt-button>
            </div>)
          },
        }
      ]
    }
  },
  computed: {
    power () {
      return this.$common.getPower({
        save: 'roleManagement_save',
        del: 'roleManagement_remove',
        update: 'roleManagement_update',
        saveOrUpdate: 'roleManagement_saveOrUpdate',
        view: 'roleManagement_info',
        search: 'roleManagement_list'
      })
    }
  },
  watch: {
    addRowVisible: {
      deep: true,
      handler (val) {
        if (!val && this.refresh) {
          this.$refs.roleManagement.search(true);
          this.refresh = false;
        }
      }
    },
    setRoleVisible: {
      deep: true,
      handler (val) {
        if (!val && this.refresh) {
          this.$refs.roleManagement.search();
          this.refresh = false;
        }
      }
    }
  },
  created() {
    const allPromise = [
      () => {
        return this.getAllSystem()
      }
    ]
    this.$common.allSettled(allPromise).then(() => {
      this.isInited = true;
    }).catch(() => {
      this.isInited = true;
    })
  },
  // 页面渲染完
  mounted() {},
  // 组件销毁前
  beforeUnmount () {},
  methods: {
    // 发送请求前处理，可用于验证以及参数修改, 如果返回 false， 则不会执行 requestHandler 方法发起请求
    transformRequestData (requestData) {
      let request = this.$common.copy(requestData);
      return request
    },
    // 获取列表数据
    requestHandler (requestData) {
      return this.$http.get(this.api.globalApi.role.list, { params: requestData });
    },
    // 重置搜索栏
    filterReset () {
      this.filterModel.systemId = 'web-null';
    },
    // 新增(编辑)用户
    rowAddEdit (row) {
      this.tableRowInfo = this.$common.copy(row);
      this.$nextTick(() => {
        this.addRowVisible = true;
      })
    },
    // 设置角色权限
    setRoleHnad (row) {
      this.tableRowInfo = this.$common.copy(row);
      this.$nextTick(() => {
        this.setRoleVisible = true;
      })
    },
    // 删除数据
    deleRow (row) {
      this.$confirm(`确认删除角色：${row.name}`, '操作提示', {
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        closeOnClickModal: false,
        type: 'warning'
      }).then(() => {
        this.$http.post(this.api.role.remove, { id: row.id }).then(res => {
          this.$refs.roleManagement.search();
          this.$message.success('操作成功!')
        })
      }).catch(() => {})
    },
    // 处理树节点
    treeNormalizer (node) {
      return {
        id: node.id,
        label: node.name,
        children: node.childList
      }
    },
    // 树选值改变时候回调
    getSystemVal (treeId) {
      this.filterModel.systemId = treeId;
    },
    // 获取系统
    getAllSystem () {
      return new Promise((resolve) => {
        this.$http.get(this.api.globalApi.systemApi.treeList, {params: {}, hiddenError: true }).then(res => {
          if (res.data) {
            res.data.id = 'web-null';
            res.data.name = '全部';
            const hand = (arr = []) => {
              arr.forEach(item => {
                this.systemJsons[item.id] = item;
                if (!this.$common.isEmpty(item.childList)) {
                  hand(item.childList)
                } else {
                  delete item.childList;
                }
              })
            }
            hand([res.data]);
            this.systemOptions = [res.data] || [];
            resolve([res.data]);
          }
        }).catch(() => {
          resolve([]);
        })
      })
    }
  }
};
</script>
<style lang="scss" scoped>
.role-management-container{
  height: 100%;
  padding: 0;
  background: #fff;
  .filter-bottom-box{
    display: flex;
    width: 100%;
    .filter-bottom-left{
      flex: 50;
      text-align: left;
    }
  }
}
</style>