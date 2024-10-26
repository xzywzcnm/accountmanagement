<template>
  <div class="announcementTable">
    <dyt-table
      ref="management"
      :filter-fields="filterFields"
      :filter-model="filterModel"
      :table-columns="tableColumns"
      :request-handler="requestHandler"
      :request-before="transformRequestData"
      @filterReset="filterReset"
    >
      <template v-slot:filterBottom>
        <div class="filter-bottom-box">
          <div class="filter-bottom-left">
            <dyt-button
              id="addUser"
              type="primary"
              icon="plus"
              @click="rowAddEdit({})"
            >
              添加公告
            </dyt-button>
            <dyt-button
              id="addUser"
              type="primary"
              @click="resetUserNotice"
            >
              通知所有用户
            </dyt-button>
          </div>
        </div>
      </template>
    </dyt-table>
    <addEdit
      :module-data="rowAddEditInfo"
      v-model:visible="rowAddEditVisible"
      v-model:refresh="refresh"
    />
    <noticeDetails
      :module-data="rowAddEditInfo"
      v-model:visible="rowViewInfoVisible"
    />
  </div>
</template>
<script lang="jsx">
import { defineComponent } from 'vue';
import addEdit from './addEdit.vue';
import noticeDetails from './noticeDetails.vue';

export default defineComponent({
  name: 'Announcement',
  components: {addEdit, noticeDetails},
  data() {
    return {
      refresh: false,
      rowAddEditVisible: false,
      rowViewInfoVisible: false,
      rowAddEditInfo: {},
      // 搜索栏其他值或默认值
      filterModel: {
        sortField: 'n.gmt_create',
        sortType: 'DESC',
        status: 'web-null'
      },
      // 搜索栏表单部分
      filterFields: [
        {
          type: 'select',
          model: 'status',
          label: '状态',
          placeholder: '请选择状态',
          options: [
            {label: '全部', value: 'web-null'},
            {label: '草稿', value: '0'},
            {label: '已发布', value: '1'},
            {label: '已作废', value: '-1'}
          ],
          componentProps: {}
        },
        { type: 'text', model: 'title', label: '请输入标题关键字' }
      ],
      // 表格列
      tableColumns: [
        {
          label: '标题', prop: 'title', align: 'center', 'min-width': '300',
          render: ({row}) => {
            return (<div
              onClick={
                (e) => {
                  this.rowViewInfo(row)
                }
              }
              style="width: 100%; cursor: pointer; color: #4363D0; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;"
            >
              {row.title}
            </div>);
          }
        },
        {label: '创建人', prop: 'createBy', align: 'center', 'width': '200'},
        {label: '创建时间', prop: 'gmtCreate', align: 'center', 'width': '170'},
        {
          label: '状态', prop: 'status', align: 'center', width: 120,
          render: ({row}) => {
            const status = {
              '-1': {text: '已作废', style: 'color: #f20;'},
              '0': {text: '草稿', style: ''},
              '1': {text: '已发布', style: 'color: #67c23a;'}
            }
            if (!status[row.status]) return '';
            return (<span style={status[row.status].style}>{status[row.status].text}</span>);
          }
        },
        {
          label: '操作',
          width: 140,
          fixed: 'right',
          align: 'center',
          render: ({row}) => {
            const edit = (<dyt-button
              onClick={
                (e) => {
                  this.rowAddEdit(row)
                }
              }
              size="small"
              type="primary"
            >
              编辑
            </dyt-button>);
            const Invalid = (<dyt-button
              // disabled={[-1, '-1'].includes(row.status)}
              onClick={
                (e) => {
                  this.rowInvalid(row)
                }
              }
              size="small"
              type="danger"
            >
              作废
            </dyt-button>);
            return [-1, '-1'].includes(row.status) ? '' : (<div> {edit} {Invalid}</div>);
          }
        }
      ]
    }
  },
  computed: {
    power () {
      return this.$common.getPower({
        save: 'userManagement_save'
      })
    }
  },
  watch: {
    refresh: {
      deep: true,
      handler (val) {
        this.refreshList(val);
      }
    }
  },
  created() {},
  // 页面渲染完
  mounted() {},
  // 组件销毁前
  beforeUnmount () {},
  methods: {
    refreshList (val) {
      if (!val) return;
      this.refresh = false;
      this.$refs.management.search();
    },
    // 发送请求前处理，可用于验证以及参数修改, 如果返回 false， 则不会执行 requestHandler 方法发起请求
    transformRequestData (requestData) {
      let request = this.$common.copy(requestData);
      return request
    },
    // 获取列表数据
    requestHandler (requestData) {
      return this.$http.get(this.api.announcement.list, { params: requestData })
    },
    // 重置搜索栏
    filterReset () {
      this.filterModel.status = 'web-null';
    },
    // 新增(编辑)
    rowAddEdit (row) {
      this.rowAddEditInfo = row;
      this.$nextTick(() => {
        this.rowAddEditVisible = true;
      })
    },
    // 查看
    rowViewInfo (row) {
      this.rowAddEditInfo = row;
      this.$nextTick(() => {
        this.rowViewInfoVisible = true;
      })
    },
    // 作废
    rowInvalid (row) {
      this.$confirm(`确认是否作废公告：${row.title}`, '操作提示', {
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        closeOnClickModal: false,
        type: 'warning',
        size: 'default'
      }).then(() => {
        this.$http.post(this.api.announcement.remove, { id: row.id }).then(res => {
          this.$refs.management.search();
          this.$message.success('操作成功!')
        })
      }).catch(() => {})
    },
    resetUserNotice () {
      this.$confirm(`确认将最新公告通知给所有用户，并且在系统中心首页弹窗显示？`, '操作提示', {
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        closeOnClickModal: false,
        type: 'warning',
        size: 'default'
      }).then(() => {
        this.$http.post(this.api.announcement.resetNotice).then(res => {
          this.$message.success('操作成功!')
        })
      }).catch(() => {})
    }
  }
});
</script>
<style lang="scss" scoped>
.announcementTable{
  height: 100%;
  padding: 0px;
  .filter-bottom-box{
    display: flex;
    width: 100%;
    .filter-bottom-left{
      flex: 50;
      text-align: left;
    }
    .filter-bottom-right{
      flex: 50;
      text-align: right;
    }
  }
}
</style>