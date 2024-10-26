<template>
  <dyt-dialog
    v-model="dialogVisible"
    :title="modalTitle"
    :before-close="closeDialog"
    custom-class="custom-user-info-class"
    :close-on-press-escape="true"
    :close-on-click-modal="true"
  >
    <div
      v-loading="pageLoading"
      class="user-info-content"
    >
      <!-- {{ moduleData }} -->
      <el-form
        ref="userInfo"
        :inline="true"
        :model="formData"
        label-width="200px"
        class="demo-user-info-form"
        style="font-size: 0;"
        @submit.prevent
      >
        <el-form-item label="姓名：">
          {{ formData.name }}
        </el-form-item>
        <el-form-item label="账号：">
          {{ formData.username }}
        </el-form-item>
        <el-form-item label="电话：">
          {{ formData.phone }}
        </el-form-item>
        <el-form-item label="邮箱：">
          {{ formData.email }}
        </el-form-item>
        <el-form-item label="部门：">
          {{ departData[formData.deptId] ? departData[formData.deptId].name : '' }}
        </el-form-item>
        <el-form-item label="所属事业部：">
          <template v-if="formData.businessDeptId">
            {{ businessDeptJson[formData.businessDeptId]?businessDeptJson[formData.businessDeptId].name:'' }}
          </template>
        </el-form-item>
        <el-form-item label="可查看事业部：">
          <!-- {{ formData.businessDeptIds.join(',') }} -->
          <template v-if="formData.businessDeptIds && formData.businessDeptIds.length > 0">
            <el-tag
              v-for="(item, index) in formData.businessDeptIds"
              :key="`business-${index}`"
              size="small"
              type="info"
              style="margin: 3px 5px 3px 0;"
            >
              {{ businessDeptJson[item]?businessDeptJson[item].name:'' }}
            </el-tag>
          </template>
        </el-form-item>
        <el-form-item label="工号：">
          {{ formData.employeeNo }}
        </el-form-item>
        <el-form-item label="钉钉ID：">
          {{ formData.dtUserId }}
        </el-form-item>
        <el-form-item label="UPMS 管理员：">
          {{ [1, '1'].includes(formData.superAdmin) ? '是' : '否' }}
        </el-form-item>
        <el-form-item
          label="岗位："
          class="other-form-item"
        >
          <template v-if="formData.positionIds && formData.positionIds.length > 0">
            <el-tag
              v-for="(item, index) in formData.positionIds"
              :key="`position-${index}`"
              size="small"
              type="info"
              style="margin: 3px 5px 3px 0;"
            >
              {{ positionJsons[item]?positionJsons[item].name:'' }}
            </el-tag>
          </template>
        </el-form-item>
        <template v-for="(sysId, sIndex) in allSystemIds">
          <el-form-item
            v-if="allSystemRole[sysId] && allSystemRole[sysId].length > 0"
            :key="`sys-${sIndex}`"
            :label="`${systemJsons[sysId].name}角色：`"
            class="other-form-item"
          >
            <el-tag
              v-for="(role, rIndex) in allSystemRole[sysId]"
              :key="`role-${rIndex}`"
              size="small"
              type="info"
              style="margin: 3px 5px 3px 0;"
            >
              {{ role.name }}
            </el-tag>
          </el-form-item>
        </template>
      </el-form>
    </div>
  </dyt-dialog>
</template>
<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ViewUserInfo',
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
    },
    departData: {
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
      systemJsons: {},
      userId: '',
      formData: {},
      defaultData: {
        username: '',
        employeeNo: '',
        dtUserId: '',
        password: '',
        superAdmin: '',
        name: '',
        phone: '',
        email: '',
        userId: '',
        positionIds: [],
        businessDeptIds: [],
        businessDeptId: '',
        deptId: null
      },
      allSystemIds: [],
      businessDeptJson: {},
      stringToArray: {
        businessDeptIds: ','
      },
      allSystemRole: {},
      positionJsons: {}
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
        val && this.$nextTick(() => {
          this.initData(this.moduleData);
        })
      }
    }
  },
  computed: {
    modalTitle () {
      if (this.$common.isEmpty(this.moduleData)) return '设置角色';
      return `查看信息-${this.moduleData.name}(${this.moduleData.username})`;
    }
  },
  created() {
    this.formData = this.$common.copy(this.defaultData);
  },
  // 页面渲染完
  mounted() {},
  // 组件销毁前
  beforeUnmount () {},
  methods: {
    // 初始化数据
    initData (val) {
      this.userId = val.userId;
      Object.keys(this.formData).forEach(key => {
        if(typeof val[key] !== 'undefined') {
          if (key === 'positionIds' && !this.$common.isEmpty(val[key])) {
            this.formData[key] = val[key].split(',').map(item => {
              return Number(item)
            });
          } else if (typeof this.stringToArray[key] !== 'undefined' && !this.$common.isEmpty(val[key])) {
            this.formData[key] = val[key].split(this.stringToArray[key]);
          } else {
            this.formData[key] = val[key];
          }
        }
      })
      // 获取系统
      this.getAllSystem().then(() => {
        this.allSystemIds = Object.keys(this.systemJsons);
        let systemRole = {};
        this.allSystemIds.forEach(sysId => {
          systemRole[sysId] = this.getRoleList(sysId);
        });
        const sysKeys = Object.keys(systemRole);
        // 所有系统角色
        Promise.all([...Object.values(systemRole), this.getPositionData(), this.getBusinessDept()]).then(arr => {
          // 系统角色
          sysKeys.forEach((id, index) => {
            this.allSystemRole[id] = arr[index];
          })
        })
      })
    },
    // 关闭
    closeDialog (done) {
      this.allSystemRole = {};
      this.formData = this.$common.copy(this.defaultData);
      this.$nextTick(() => {
        typeof done === 'function' ? done() : (this.dialogVisible = false);
      })
    },
    // 获取角色
    getRoleList (systemId) {
      return new Promise(resolve => {
        this.$http.get(this.api.setRole.list, {
          params: {
            userId: this.userId,
            systemId: systemId
          }
        }).then(res => {
          if (res.data) {
            resolve(res.data);
          } else {
            resolve([]);
          }
        }).catch(e => {
          resolve([]);
        })
      })
    },
    // 获取系统
    getAllSystem () {
      return new Promise(resolve => {
        this.$http.get(this.api.globalApi.systemApi.treeList, {params: {}, hiddenError: true }).then(res => {
          if (res.data) {
            const hand = (arr = []) => {
              arr.forEach(item => {
                this.systemJsons[item.id] = item;
                if (!this.$common.isEmpty(item.childList)) {
                  hand(item.childList);
                } else {
                  delete item.childList;
                }
              })
            }
            hand(res.data.childList || []);
            resolve(res.data.childList || []);
          } else {
            resolve([]);
          }
        }).catch(e => {
          resolve([]);
        })
      })
    },
    // 获取岗位
    getPositionData () {
      return new Promise(resolve => {
        this.$http.get(this.api.jobs.treeList, {params: {}, hiddenError: true }).then(res => {
          if (res.data) {
            const hand = (arr = [], resArr = []) => {
              arr.forEach(item => {
                this.positionJsons[item.id] = item;
                ![-1, '-1'].includes(item.id) && resArr.push({
                  value: item.id,
                  label: item.name
                });
                if (!this.$common.isEmpty(item.childList)) {
                  hand(item.childList, resArr)
                }
              })
              return resArr;
            }
            resolve(hand([res.data], []));
          } else {
            resolve([]);
          }
        }).catch(() => {
          resolve([]);
        })
      })
    },
    // 获取事业部
    getBusinessDept () {
      return new Promise(resolve => {
        this.$http.get(this.api.globalApi.division.list, { params: {}, hiddenError: true }).then(res => {
          if (res.data) {
            res.data.forEach(item => {
              this.businessDeptJson[item.id] = item;
            })
          }
          resolve();
        }).catch(() => {
          resolve();
        })
      })
    }
  }
});
</script>
<style lang="scss">
.user-info-content{
  .demo-user-info-form{
    .el-form-item{
      min-width: 400px;
      width: 50%;
      margin: 0 0 10px 0;
      &.other-form-item{
        width: 100%;
      }
      .el-form-item__content{
        max-width: calc(100% - 200px);
      }
    }
  }
}
.custom-user-info-class{
  max-width: 1000px;
}
</style>