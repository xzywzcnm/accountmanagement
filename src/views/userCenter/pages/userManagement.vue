<template>
  <div class="management-container">
    <dyt-table
      ref="management"
      :filter-fields="filterFields"
      :filter-model="filterModel"
      :table-columns="tableColumns"
      :request-handler="requestHandler"
      :request-before="transformRequestData"
      :is-inited="isInited"
      :table-config="tableConfig"
      @filterReset="filterReset"
    >
      <template v-slot:filterBottom>
        <div class="filter-bottom-box">
        <div class="filter-bottom-left">
          <dyt-button
            v-if="power.save"
            id="addUser"
            type="primary"
            icon="plus"
            @click="handleCommand('rowAddEdit', {}, $event)"
          >
            添加新用户
          </dyt-button>
        </div>
        <div class="filter-bottom-right">
          <dytSortSelect
            class="sortButton-global"
            :sort-button-list="sortButtonList"
            :need-default-sort="true"
            @sortInfo="getSortInfo"
          />
        </div>
      </div>
      </template>
    </dyt-table>
    <!-- 新增(编辑) -->
    <addEditUser
      ref="addEditUser"
      v-model:visible="drawerVisible"
      :module-data="rowAddEditInfo"
      :tree-options="treeOptions"
      v-model:refresh="refresh"
    />
    <!-- 设置用户角色 -->
    <setUserRole
      ref="addEditUser"
      v-model:visible="roleVisible"
      :module-data="rowAddEditInfo"
      :tree-options="treeOptions"
      v-model:refresh="refresh"
    />
    <!-- 用户详情 -->
    <viewUserInfo
      :depart-data="departJson"
      v-model:visible="userInfoVisible"
      :module-data="rowAddEditInfo"
    />
    <!-- 日志详情 -->
    <operationLog
      v-model:visible="operationLogVisible"
      :module-data="rowAddEditInfo"
    />
  </div>
</template>
<script lang="tsx">
import { defineComponent } from 'vue';
import addEditUser from '../component/addEditUser.vue';
import setUserRole from '../component/setUserRole.vue';
import viewUserInfo from '../component/viewUserInfo.vue';
import operationLog from '../component/operationLog.vue';
// import Icon from '@/components/Icon';
interface dataType{
  isInited: boolean;
  refresh: boolean;
  roleVisible: boolean;
  userInfoVisible: boolean;
  operationLogVisible: boolean;
  rowAddEditInfo: any;
  drawerVisible: boolean;
  treeOptions: any;
  businessDeptList: any;
  businessDeptJson: any;
  departJson: any;
  filterModel: any;
  filterFields: any;
  tableColumns: any;
  sortButtonList: any;
  defaultProps: any;
  tableConfig: any
}

export default defineComponent({
  name: 'Management',
  components: { addEditUser, setUserRole, viewUserInfo, operationLog },
  data():dataType {
    return {
      tableConfig: {
        // autoload: true
      },
      isInited: false,
      refresh: false,
      roleVisible: false,
      userInfoVisible: false,
      operationLogVisible: false,
      rowAddEditInfo: {},
      drawerVisible: false,
      treeOptions: [ {id: 'web-null', name: '全部'} ],
      businessDeptList: [],
      businessDeptJson: [],
      departJson: {},
      defaultProps: {
        value: 'id',
        label: 'name',
        children: 'childList'
      },
      // 搜索栏其他值或默认值
      filterModel: {
        enable: '1',
        deptId: 'web-null',
        positionIds: [],
        superAdmin: 'web-null',
        sortField: 'a.gmt_create',
        sortType: 'DESC',
        businessDeptId: 'web-null'
      },
      // 搜索栏表单部分
      filterFields: [
        { type: 'text', model: 'commonStr', label: '员工账号、姓名、工号', style: {width: 240} },
        // 部门树
        {
          model: 'deptId',
          label: '部门',
          render: () => {
            return (<dytTreeSelect
              style="width:300px"
              // @ts-ignore
              modelValue={this.filterModel.deptId}
              multiple={false}
              defaultProps={this.defaultProps}
              options={this.treeOptions}
              placeholder="请选择部门"
              check-strictly={false}
              onInput={this.getTreeData}
            />)
          }
        },
        {
          type: 'select',
          model: 'enable',
          label: '状态',
          placeholder: '请选择状态',
          options: [
            {label: '全部', value: 'web-null'},
            {label: '启用', value: '1'},
            {label: '停用', value: '0'}
          ],
          componentProps: {
            // multiple: true,
            // 'multiple-limit': 1
          }
        },
        {
          type: 'select',
          model: 'superAdmin',
          label: 'UPMS 管理员',
          placeholder: '请选择UPMS 管理员',
          options: [
            {label: '全部', value: 'web-null'},
            {label: '是', value: '1'},
            {label: '否', value: '0'}
          ],
          componentProps: {}
        },
        {
          type: 'select',
          model: 'businessDeptId',
          label: '所属事业部',
          placeholder: '请选择事业部',
          options: () => {
            return this.businessDeptList
          },
          // componentProps: { 'collapse-tags': true, multiple: true }
        }
      ],
      // 表格列
      tableColumns: [
        {label: '账号', prop: 'username', align: 'center', 'width': '200'},
        {label: '姓名', prop: 'name', align: 'center', 'width': '200'},
        {label: '电话', prop: 'phone', align: 'center', 'min-width': '120'},
        {label: '邮箱', prop: 'email', align: 'center', 'width': '200'},
        {label: '部门', prop: 'deptName', align: 'center', 'min-width': '200'},
        {
          label: '所属事业部', prop: 'businessDeptId', align: 'center', 'min-width': '200',
          render: ({row}:any) => {
            if (this.$common.isEmpty(row.businessDeptId) || this.$common.isEmpty(this.businessDeptJson[row.businessDeptId])) return '';
            return this.businessDeptJson[row.businessDeptId].label;
          }
        },
        {
          label: '可查看事业部', prop: 'businessDeptIds', align: 'center', 'min-width': '200',
          render: ({row}:any) => {
            if (this.$common.isEmpty(row.businessDeptIds)) return '';
            let textList:any = [];
            row.businessDeptIds.split(',').forEach((item:any) => {
              !this.$common.isEmpty(this.businessDeptJson[item]) && textList.push(this.businessDeptJson[item].label);
            })
            return textList.join(',')
          }
        },
        {label: '工号', prop: 'employeeNo', align: 'center', 'width': '150'},
        {
          label: 'UPMS 管理员', prop: 'superAdmin', align: 'center', width: '105',
          render: (prop:any) => {
            return [1, '1'].includes(prop.row.superAdmin) ? '是' : '否'
          }
        },
        {label: '最后登录时间', prop: 'lastLoginTime', align: 'center', width: '150'},
        {
          label: '状态', prop: 'enable', align: 'center',
          render: (prop:any) => {
            if ([1,'1'].includes(prop.row.enable)) {
              return (<span style="color: #02ad02;">启用</span>)
            }
            return (<span style="color: #f20;">停用</span>)
          }
        },
        {
          label: '操作',
          width: 180,
          fixed: 'right',
          align: 'center',
          render: ({row}:any) => {
            const slots = {
              default: () => {
                // @ts-ignore
                return (<dyt-button size="small" type="primary">更多操作 <Icon style="margin-left: 5px;" name="arrow-down" /></dyt-button>);
              },
              dropdown: () => {
                let btns = [];
                // @ts-ignore
                this.power.update && btns.push(<el-dropdown-item command="rowAddEdit">编辑信息</el-dropdown-item>);
                // @ts-ignore
                this.power.updateEnable && btns.push(<el-dropdown-item command="rowEnable">{[1,'1'].includes(row.enable)?'停用':'启用'}账户</el-dropdown-item>);
                // @ts-ignore
                this.power.update && btns.push(<el-dropdown-item command="resetPassword">重置密码</el-dropdown-item>);
                // @ts-ignore
                this.power.infoView && btns.push(<el-dropdown-item command="infoView">查看资料</el-dropdown-item>);
                // @ts-ignore
                this.power.seeLog && btns.push(<el-dropdown-item command="seeLog">查看日志</el-dropdown-item>);
                return <el-dropdown-menu>{btns}</el-dropdown-menu>;
                // return btns;
              }
            };
            return (<div>
              <dyt-button
                // @ts-ignore
                disabled={!this.power.saveOrUpdate}
                onClick={
                  (e:any) => {
                    this.rowAddEditInfo = row;
                    this.$nextTick(() => {
                      // @ts-ignore
                      this.roleVisible = true;
                    })
                  }
                }
                size="small"
                type="primary"
              >
                设置角色
              </dyt-button>
              <el-dropdown
                placement="bottom-start"
                size="small"
                style="margin-left: 5px;vertical-align: middle;"
                onCommand={(key:any, event:any) => this.handleCommand(key, row, event)}
                v-slots={ slots }
              />
            </div>)
          },
        }
      ],
      // 排序设置
      sortButtonList: [
        {
          sortHeader: "创建时间",
          sortField: "a.gmt_create",
        },
        {
          sortHeader: "姓名",
          sortField: "u.name",
        }
      ],
    }
  },
  computed: {
    power ():any {
      return this.$common.getPower({
        save: 'userManagement_save',
        updateEnable: 'userManagement_updateEnable',
        update: 'userManagement_update',
        saveOrUpdate: 'userManagement_role_saveOrUpdate',
        search: 'userManagement_list',
        infoView: 'userManagement_info',
        seeLog: 'userManagement_userLog'
      })
    }
  },
  watch: {
    drawerVisible: {
      deep: true,
      handler (val) {
        this.refreshList(val)
      }
    },
    roleVisible: {
      deep: true,
      handler (val) {
        this.refreshList(val)
      }
    },
    'filterModel.sortField': {
      deep: true,
      handler () {
        this.$refs.management.search(true);
      }
    },
    'filterModel.sortType': {
      deep: true,
      handler () {
        this.$refs.management.search(true);
      }
    }
  },
  created() {
    const allPromise = [
      () => this.getAlldept(),
      () => this.getAllPositionId(),
      () => this.getAllBusinessDept()
    ]
    this.$common.allSettled(allPromise).then(() => {
      this.isInited = true;
    }).catch(() => {
      this.isInited = true;
    })
  },
  // 页面渲染完
  mounted() {
    // 获取当前用户是否提示过
    this.localforage.getItem(`stepsGuide${this.$store.getters['userAccount']}`).then((res:any) => {
      !res && this.driver();
    });
  },
  // 组件销毁前
  beforeUnmount () {},
  methods: {
    // 操作引导
    driver() {
      const driver = new this.$driver({
        allowClose: false,
        closeBtnText: '我知道了',
        nextBtnText: '下一步',
        prevBtnText: '上一步',
        doneBtnText: '结束'
      });
      const popover = {
        title: '提示',
        className: 'step-popover-class',
      }
      
      driver.defineSteps([
        {
          element: '.nav-item-container.el-menu',
          popover: {
            ...popover,
            description: '导航菜单树，整个功能菜单预览',
            position: 'right'
          }
        },
        {
          element: '.el-menu-item.is-active',
          popover: {
            ...popover,
            description: '点菜单处可以打开对应功能页面',
            position: 'right'
          }
        },
        
        {
          element: '.lv__filterbar-main',
          popover: {
            ...popover,
            description: '列表条件搜索栏，可在此次按照自己需要输入查询条件，然后点击搜索按钮，点击重置按钮即可恢复默认搜索条件',
            position: 'bottom'
          }
        },
        {
          element: '#addUser',
          popover: {
            ...popover,
            description: '点击此处新增用户信息',
            position: 'bottom'
          }
        },
        {
          element: '.sortButton-global',
          popover: {
            ...popover,
            description: '按照个人喜好，选择排序',
            position: 'left'
          }
        },
        {
          element: '.lv__content-wrapper',
          popover: {
            ...popover,
            description: `展示数据列表，操作列中的编辑按钮可对用户信息进行编辑，设置角色可将角色绑定到用户，查看按钮可查看用户信息
            停用(启用) 按钮可将用户停用(启用), 停用的用户无法登陆系统`,
            position: 'top'
          }
        },
        {
          element: '.el-pagination',
          popover: {
            ...popover,
            description: '此次可进行列表数据翻页，查看更多数据',
            position: 'top'
          }
        }
      ]);
      // 记录当前用户
      this.localforage.setItem(`stepsGuide${this.$store.getters['userAccount']}`, true);
      driver.start();
    },
    refreshList (val:any) {
      if (!val && this.refresh) {
        this.refresh = false;
        this.$refs.management.search();
      }
    },
    // 发送请求前处理，可用于验证以及参数修改, 如果返回 false， 则不会执行 requestHandler 方法发起请求
    transformRequestData (requestData:any) {
      let request = this.$common.copy(requestData);
      request.positionIds = request.positionIds ? request.positionIds.join(',') : '';
      return request
    },
    // 获取列表数据
    requestHandler (requestData:any) {
      return this.$http.get(this.api.management.selectUserInfo, { params: requestData })
    },
    // 重置搜索栏
    filterReset () {
      this.filterModel.enable = '1';
      this.filterModel.deptId = 'web-null';
      this.filterModel.superAdmin = 'web-null';
      this.filterModel.businessDeptId = 'web-null';
      this.filterModel.positionIds = [];
    },
    // 停(启)用
    rowEnable (row:any) {
      this.$confirm(`确认${[1, '1'].includes(row.enable) ? '停' : '启'}用用户账号：${row.username}`, '操作提示', {
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        closeOnClickModal: false,
        type: 'warning'
      }).then(() => {
        this.$http.post(this.api.management.updateEnable, {
          userId: row.userId,
          enable: [1, '1'].includes(row.enable) ? 0 : 1
        }).then(res => {
          this.$refs.management.search();
          this.$message.success('操作成功!')
        })
      }).catch(() => {})
    },
    resetPassword (row:any) {
      this.$confirm(`确认将 ${row.username} 的密码重置为 a123456 吗？`, '操作提示', {
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        closeOnClickModal: false,
        type: 'warning'
      }).then(() => {
        const requer = this.$common.encryption({
          data: {
            password: 'a123456'
          },
          key: 'auths.dyt.com.hk',
          param: ['password']
        });
        this.$http.post(this.api.management.update, {...row, ...requer}, {removeEmpty: false}).then(res => {
          this.$refs.management.search();
          this.$message.success('操作成功!')
        })
      }).catch(() => {})
    },
    // 下拉操作
    handleCommand (key:any, row:any, event:any) {
      this.rowAddEditInfo = row;
      this.$nextTick(() => {
        switch(key) {
          // 新增(编辑)用户
          case 'rowAddEdit': this.drawerVisible = true;
            break;
          case 'rowEnable': this.rowEnable(row);
            break;
          case 'infoView': this.userInfoVisible = true;
            break;
          case 'resetPassword':this.resetPassword(row);
            break;
          case 'seeLog':
            if (this.$common.isEmpty(row.userId)) {
              this.$message({
                type: 'error',
                message: '无用户信息，暂不能查询对应信息'
              });
              return;
            }
            this.operationLogVisible = true;
            break; 
        }
      })
    },
    // 树选值改变时候回调
    getTreeData (treeId:any) {
      this.filterModel.deptId = treeId;
    },
    getPositionId (treeId:any) {
      this.filterModel.positionIds = treeId;
    },
    // 获取部门
    getAlldept () {
      return new Promise((resolve:any) => {
        this.$http.get(this.api.globalApi.department.deptSelect, {params: {}, hiddenError: true }).then(res => {
          if (res.data) {
            res.data.id = 'web-null';
            res.data.name = '全部';
            const hand = (arr:any = []) => {
              arr.forEach((item:any) => {
                this.departJson[item.id] = item;
                if (!this.$common.isEmpty(item.childList)) {
                  hand(item.childList)
                } else {
                  delete item.childList;
                }
              })
            }
            hand([res.data]);
            this.treeOptions = [res.data];
          }
          resolve()
        }).catch(() => {
          resolve()
        })
      })
    },
    // 获取岗位
    getAllPositionId () {
      return new Promise((resolve:any) => {
        resolve()
      })
    },
    // 获取事业部
    getAllBusinessDept () {
      return new Promise((resolve:any) => {
        let division = [{ value: 'web-null', label: '全部' }];
        this.$http.get(this.api.globalApi.division.list, { params: {}, hiddenError: true}).then(res => {
          if (res.data) {
            res.data.forEach((item:any) => {
              division.push({ value: item.id, label: item.name })
              this.businessDeptJson[item.id] = { value: item.id, label: item.name };
            })
          }
          this.businessDeptList = division;
          resolve();
        }).catch(() => {
          this.businessDeptList = division;
          resolve();
        })
      })
    },
    // 排序处理
    getSortInfo (info:any) {
      this.filterModel.sortField = info.sortStr;
      this.filterModel.sortType = info.sortType;
    }
  }
});
</script>
<style lang="scss" scoped>
.management-container{
  height: 100%;
  padding: 0;
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