<template>
  <div class="role-management-container">
    <dyt-table
      ref="management"
      :filter-fields="filterFields"
      :filter-model="filterModel"
      :table-columns="tableColumns"
      :request-handler="requestHandler"
      :request-before="transformRequestData"
      :pagination-config="paginationConfig"
      @requested="requested"
      @filterReset="filterReset"
    >
      <!-- 由于原来这样使用了。。。这里不做修改，就给了表格插槽 -->
      <template v-slot:customTable>
        <el-table
          ref="managementTable"
          :data="tableList"
          border
          stripe
          style="width: 100%"
          :height="452"
          @row-click="tableRowClick"
          @select="tableSelect"
          @select-all="tableSelectAll"
        >
          <el-table-column
            type="selection"
            width="50"
            align="center"
          />
          <el-table-column
            v-for="(col, index) in tableColumns"
            v-bind="col"
            :key="`${col.prop}-${index}`"
          >
            <template v-slot="{ row }">
              <template v-if="col.prop === 'systemId'">
                {{ systemJsons[row.systemId] ? systemJsons[row.systemId].name || '' : '' }}
              </template>
              <template v-else>
                {{ row[col.prop] }}
              </template>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </dyt-table>
  </div>
</template>
<script>

export default {
  name: 'UserRoleList',
  components: {},
  props: {
    roleFilter: {
      type: Object,
      default: () => {
        return {};
      }
    },
    checkRoleList: {
      type: Array,
      default: () => {
        return [];
      }
    },
    editing: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      refresh: false,
      roleList: [],
      tableRowInfo: {},
      systemOptions: [{id: 'web-null', name: '全部'}],
      systemJsons: {},
      // 表格数组是否自动加载
      autoload: false,
      // 是否开启多选(checkbox), Boolean | String(single 单选, more 多选) | Object
      tableSelectionColumn: true,
      // 搜索栏按钮
      filterButtons: [],
      // 搜索栏其他值或默认值
      filterModel: {
        systemId: ''
      },
      // 搜索栏表单部分
      filterFields: [
        { type: 'text', model: 'name', label: '角色名称' }
      ],
      // 表格列
      tableColumns: [
        {label: '角色名称', prop: 'name', align: 'center', 'width': '200'},
        // {label: '角色代码', prop: 'code', align: 'center', 'width': '200'},
        {label: '角色描述', prop: 'description', align: 'center', 'min-width': '200'}
      ],
      roleRows: [],
      tableList: [],
      // 翻页设置
      paginationConfig: {
        // 条数
        'page-size': 10
      }
    }
  },
  watch: {
    'filterModel.systemId': {
      deep: true,
      handler (val) {
        this.$nextTick(() => {
          !this.$common.isEmpty(val) && this.$refs.management.search();
        })
      }
    },
    roleFilter: {
      immediate: true,
      deep: true,
      handler (val) {
        this.$nextTick(() => {
          if (!this.$common.isEmpty(val['systemId']) && !this.$common.isEmpty(val['systemId'].value)) {
            if (this.filterModel.systemId !== val['systemId'].value) {
              this.filterModel.systemId = val['systemId'].value;
            }
          }
        })
      }
    },
    checkRoleList: {
      immediate: true,
      deep: true,
      handler (val) {
        if (JSON.stringify(val) === JSON.stringify(this.roleRows)) return;
        this.roleRows = this.$common.copy(val);
        if (this.tableList.length > 0 && this.$refs.managementTable) {
          const roleIds = val.map(row => {return row.id});
          this.tableList.forEach(row => {
            this.$refs.managementTable.toggleRowSelection(row, roleIds.includes(row.id));
          });
        }
      }
    },
    roleRows: {
      deep: true,
      handler (val) {
        this.$emit('update:checkRoleList', val)
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
      request.systemId = this.filterModel.systemId;
      return request
    },
    // 获取列表数据
    requestHandler (requestData) {
      this.$refs.managementTable.clearSelection();
      return new Promise((reslove, reject) => {
        this.$http.get(this.api.globalApi.role.list, { params: requestData }).then(res => {
          if (res.data && res.data.list) {
            this.tableList = res.data.list;
          }
          reslove(res);
        }).catch((e) => {
          reject(e);
        })
      })
    },
    // 请求完成
    requested () {
      const roleIds = this.roleRows.map(row => {return row.id});
      const checkRows = this.tableList.filter(item => {
        return roleIds.includes(item.id);
      })
      checkRows.forEach(row => {
        this.$refs.managementTable.toggleRowSelection(row, true);
      });
    },
    // 点击行时
    tableRowClick (row, column, event) {
      const roleIds = this.roleRows.map(row => {return row.id});
      this.$refs.managementTable.toggleRowSelection(row, !roleIds.includes(row.id));
      this.$emit('update:editing', true);
      if (roleIds.includes(row.id)) {
        this.roleRows.splice(roleIds.indexOf(row.id), 1);
      } else {
        this.roleRows.push(row);
      }
    },
    // 当用户手动勾选数据行的 Checkbox 时触发的事件
    tableSelect (selection, row) {
      const roleIds = this.roleRows.map(row => {return row.id});
      this.$emit('update:editing', true);
      if (roleIds.includes(row.id)) {
        this.roleRows.splice(roleIds.indexOf(row.id), 1);
      } else {
        this.roleRows.push(row);
      }
    },
    // 当用户手动勾选全选 Checkbox 时触发的事件
    tableSelectAll (selection) {
      let roleIds = this.roleRows.map(row => {return row.id});
      this.$emit('update:editing', true);
      if (selection.length > 0) {
        selection.forEach(row => {
          if (!roleIds.includes(row.id)) {
            this.roleRows.push(row);
            roleIds.push(row.id);
          }
        })
      } else {
        // 取消当前类别选中
        this.tableList.forEach(row => {
          if (roleIds.includes(row.id)) {
            this.roleRows.splice(roleIds.indexOf(row.id), 1);
            roleIds.splice(roleIds.indexOf(row.id), 1);
          }
        })
      }
    },
    // 重置搜索栏
    filterReset () {}
  }
};
</script>
<style lang="scss" scoped>
.role-management-container{
  padding: 0 5px 0 25px;
  background: #fff;
  .lv__wrapper{
    height: auto !important;
  }
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