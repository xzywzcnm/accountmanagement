<template>
  <div class="division-management-container">
    <dyt-table
      ref="divisionManagement"
      :filter-fields="filterFields"
      :filter-model="filterModel"
      :table-columns="tableColumns"
      :request-handler="requestHandler"
      :request-before="transformRequestData"
      :pagination-config="paginationConfig"
      :content-data-map="contentDataMap"
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
              新建事业部
            </dyt-button>
          </div>
        </div>
      </template>
    </dyt-table>
    <!-- 新增(编辑) -->
    <addEdit 
      v-model:visible="addRowVisible"
      :module-data="tableRowInfo"
      v-model:refresh="refresh"
    />
    <!-- <setRolePermission
      :visible.sync="setRoleVisible"
      :refresh.sync="refresh"
    /> -->
  </div>
</template>
<script lang="jsx">
import addEdit from '../component/addEdit.vue'
// import setRolePermission from '../component/setRolePermission'

export default {
  name: 'Management',
  components: { addEdit },
  data() {
    return {
      refresh: false,
      addRowVisible: false,
      tableRowInfo: {},
      // 搜索栏其他值或默认值
      filterModel: {
        enable: 1
      },
      // 搜索栏表单部分
      filterFields: [
        {
          type: 'select',
          model: 'enable',
          label: '状态',
          placeholder: '请选择状态',
          options: [
            // {label: '全部', value: 'web-null'},
            {label: '是', value: 1},
            {label: '否', value: 0}
          ],
          componentProps: {}
        },
        // { type: 'text', model: 'code', label: '角色代码' }
      ],
      // 表格列
      tableColumns: [
        {label: '事业部名称', prop: 'name', align: 'center', 'width': '200'},
        {label: '事业部描述', prop: 'description', align: 'center', 'min-width': '200'},
        {
          label: '状态', prop: 'enable', align: 'center', 'min-width': '60',
          render: ({row}) => {
            return [1, '1'].includes(row.enable) ? '启用' : '停用';
          }
        },
        {label: '更新人', prop: 'updateBy', align: 'center', 'min-width': '150'},
        {label: '更新时间', prop: 'gmtUpdated', align: 'center', 'min-width': '160'},
        {
          label: '操作',
          width: 120,
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
              <dyt-button
                onClick={(e) => this.rowEnable(row)}
                size="small"
                type={[1, '1'].includes(row.enable) ? 'danger' : 'primary'}
                disabled={!this.power.enable}
              >
                {[1, '1'].includes(row.enable) ? '停用' : '启用'}
              </dyt-button>
            </div>)
          },
        }
      ],
      // 翻页设置
      paginationConfig: {
        // 是否显示翻页功能
        showPagination: false
      },
      contentDataMap: { rows: 'data', total: 'total', errorInfos: 'msg' }
    }
  },
  computed: {
    power () {
      return this.$common.getPower({
        save: 'divisionManagement_save',
        update: 'divisionManagement_update',
        enable: 'divisionManagement_updateEnable'
      })
    }
  },
  watch: {
    addRowVisible: {
      deep: true,
      handler (val) {
        if (!val && this.refresh) {
          this.$refs.divisionManagement.search(true);
          this.refresh = false;
        }
      }
    }
  },
  created() {},
  // 页面渲染完
  mounted() {},
  // 组件销毁前
  beforeUnmount () {},
  methods: {
    // 发送请求前处理，可用于验证以及参数修改, 如果返回 false， 则不会执行 requestHandler 方法发起请求
    transformRequestData (requestData) {
      let request = this.$common.copy(requestData);
      delete request.pageSize;
      delete request.pageNum
      return request
    },
    // 获取列表数据
    requestHandler (requestData) {
      return new Promise((resolve, reject) => {
        this.$http.get(this.api.globalApi.division.list, { params: requestData }).then(res => {
          const newRes = {...res, total: (res.data ? res.data.length : 0)};
          resolve(newRes)
        }).catch(err => {
          console.error(err);
          resolve({...err, data: [], total: 0});
        })
      })
    },
    // 重置搜索栏
    filterReset () {},
    // 新增(编辑)用户
    rowAddEdit (row) {
      this.tableRowInfo = this.$common.copy(row);
      this.$nextTick(() => {
        this.addRowVisible = true;
      })
    },
    // 删除数据
    rowEnable (row) {
      this.$confirm(`确认是否${[1, '1'].includes(row.enable) ? '停用' : '启用' }事业部：${row.name}`, '操作提示', {
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        closeOnClickModal: false,
        type: 'warning'
      }).then(() => {
        this.$http.post(this.api.division.updateEnable, { id: row.id, enable: [1, '1'].includes(row.enable) ? 0 : 1 }).then(res => {
          this.$refs.divisionManagement.search();
          this.$message.success('操作成功!')
        })
      }).catch(() => {})
    },
  }
};
</script>
<style lang="scss" scoped>
.division-management-container{
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