<template>
  <dyt-dialog
    v-model="dialogVisible"
    :title="modalTitle"
    :before-close="closeDialog"
    custom-class="operation-log-dialog"
    :close-on-press-escape="true"
    :close-on-click-modal="true"
  >
    <div class="operation-log-container">
      <dyt-table
        ref="operationLogTable"
        :filter-fields="filterFields"
        :filter-model="filterModel"
        :filter-config="filterConfig"
        :table-columns="tableColumns"
        :table-confog="tableConfog"
        :request-handler="requestHandler"
        :request-before="transformRequestData"
        @filterReset="filterReset"
      >
        <template v-slot:filterBottom>
          <div style="text-align: right;">
            <el-button
              type="primary"
              @click="tableSearch(false)"
            >
              刷新
            </el-button>
          </div>
        </template>
      </dyt-table>
    </div>
  </dyt-dialog>
</template>
<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Management',
  components: {},
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    moduleData: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      dialogVisible: false,
      // 搜索栏其他值或默认值
      filterModel: {
        sortField: 'gmt_create',
        sortType: 'DESC'
      },
      // 搜索栏表单部分
      filterFields: [
        // { type: 'text', model: 'name', label: '角色名称' }
      ],
      filterConfig: {
        showFilter: false,
      },
      // 表格列
      tableColumns: [
        {label: '用户名', prop: 'userName', align: 'center', 'width': '200'},
        {label: 'IP地址', prop: 'realIp', align: 'center', 'width': '200'},
        {label: '操作时间', prop: 'gmtCreate', align: 'center', 'width': '200'},
        {
          label: '所属地', prop: 'description', align: 'center', 'min-width': '200',
          render({row}) {
            return `${row.nation||''}${row.province||''}${row.city||''}${row.district||''}`
          }
        }
      ],
      // 表格其他设置
      tableConfog: {
        // 打开页面立即加载数据
        autoload: false
      },
    }
  },
  computed: {},
  watch: {
    visible: {
      immediate: true,
      deep: true,
      handler (val) {
        this.dialogVisible = val;
        val && this.$nextTick(() => {
          this.tableSearch(true);
        })
      }
    },
    dialogVisible: {
      deep: true,
      handler (val) {
        this.$emit('update:visible', val);
      }
    }
  },
  computed: {
    modalTitle () {
      if (this.$common.isEmpty(this.moduleData)) return '设置角色';
      return `查看日志-${this.moduleData.name}(${this.moduleData.username})`;
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
      request.userId = this.moduleData.userId;
      return this.$common.isEmpty(request.userId) ? false : request;
    },
    // 获取列表数据
    requestHandler (requestData) {
      return this.$http.get(this.api.operationLog.listByUserId, { params: requestData });
    },
    // 重置搜索栏
    filterReset () {},
    // 关闭
    closeDialog (done) {
      this.$nextTick(() => {
        typeof done === 'function' ? done() : (this.dialogVisible = false);
      })
    },
    tableSearch(type) {
      this.$refs.operationLogTable && this.$refs.operationLogTable.search(type);
    }
  }
});
</script>
<style lang="scss" scoped>
.operation-log-container{
  height: calc(90vh - 90px);
  padding: 0 10px;
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
<style lang="scss">
.dialog-custom-class.el-dialog{
  &.operation-log-dialog{
    width: 90%;
    max-width: 1200px;
    margin-top: 7vh;
    .el-dialog__body{
      padding: 2px 15px 0 15px;
      max-height: calc(90vh - 60px);
    }
  }
}

</style>