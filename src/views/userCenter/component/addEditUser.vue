<template>
  <dyt-dialog
    v-model="dialogVisible"
    :title="modalTitle"
    @close="closeDrawer"
    class="add-edit-user-dialog"
  >
    <div
      v-loading="pageLoading"
      class="user-content"
    >
      <el-form
        ref="userForm"
        :inline="false"
        :model="formData"
        :rules="formRules"
        label-width="130px"
        class="demo-userForm"
        style="padding-right: 30px;"
        @submit.prevent
      >
        <el-form-item
          label="账号："
          prop="username"
        >
          <dyt-input
            v-model="formData.username"
            :clearable="true"
            :suffix="nameSuffix"
            placeholder="请以邮箱格式输入账号，例：xxxx@lapa.com"
            :disabled="!!formData.userId"
          />
        </el-form-item>
        <el-form-item
          label="姓名："
          prop="name"
        >
          <dyt-input
            v-model="formData.name"
            :clearable="true"
            placeholder="请输入姓名"
          />
        </el-form-item>
        <el-form-item
          label="电话："
          prop="phone"
        >
          <dyt-input
            v-model="formData.phone"
            :clearable="true"
            placeholder="请输入电话号码"
          />
        </el-form-item>
        <el-form-item
          label="邮箱："
          prop="email"
        >
          <dyt-input
            v-model="formData.email"
            :clearable="true"
            placeholder="请输入邮箱, 例：xxxx@lapa.com"
          />
        </el-form-item>
        <el-form-item
          label="部门："
          prop="deptId"
        >
          <dytTreeSelect
            v-model="formData.deptId"
            :multiple="false"
            :options="(treeListData[0] ? treeListData[0].childList || [] : [])"
            :defaultProps="defaultProps"
            placeholder="请选择部门"
          />
        </el-form-item>
        <el-form-item
          label="可查看事业部："
          prop="businessDeptIds"
        >
          <dyt-select
            v-model="formData.businessDeptIds"
            :multiple="true"
            placeholder="请选择事业部"
            @change="businessDeptChange"
          >
            <el-option
              v-for="(item, index) in businessDeptList"
              :key="`position-${index}`"
              :label="item.label"
              :value="item.value"
              :class="{
                'disabled-option': [0, '0'].includes(item.enable)
              }"
            >
              {{ item.label }}
            </el-option>
          </dyt-select>
        </el-form-item>
        <el-form-item
          label="工号："
          prop="employeeNo"
        >
          <dyt-input
            v-model="formData.employeeNo"
            :clearable="true"
            placeholder="请输入工号"
          />
        </el-form-item>
        <el-form-item
          label="钉钉ID："
          prop="dtUserId"
        >
          <dyt-input
            v-model="formData.dtUserId"
            :clearable="true"
            placeholder="请输入钉钉ID"
          />
        </el-form-item>
        <el-form-item
          label="岗位："
          prop="positionIds"
        >
          <dyt-select
            v-model="formData.positionIds"
            :multiple="true"
            placeholder="请选择岗位"
          >
            <el-option
              v-for="(item, index) in positionList"
              :key="`position-${index}`"
              :label="item.label"
              :value="item.value"
            >
              {{ item.label }}
            </el-option>
          </dyt-select>
        </el-form-item>
        <el-form-item
          label="UPMS 管理员："
          prop="superAdmin"
        >
          <el-radio-group v-model="formData.superAdmin">
            <el-radio label="1">
              是
            </el-radio>
            <el-radio label="0">
              否
            </el-radio>
          </el-radio-group>
          <div class="tips-error">
            请慎重选择，如果选择是，该用户将可以使用 UPMS 管理功能
          </div>
        </el-form-item>
      </el-form>
    </div>
    <template v-slot:footer>
      <div class="foolter-button">
        <dyt-button
          type="primary"
          @click="confirm"
        >
          保存
        </dyt-button>
        <dyt-button
          @click="closeDrawer"
        >
          取消
        </dyt-button>
      </div>
    </template>
  </dyt-dialog>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
interface dataType{
  pageLoading: boolean;
  dialogVisible: boolean;
  nameSuffix: any;
  businessDeptList: any;
  disabledBusinessDept: any;
  title: string;
  formData: any;
  positionList: any;
  defaultData: any;
  changeKeys: any;
  oldFormData: any;
  toString: Array<any>;
  toNumber: Array<any>;
  stringToArray: any;
  formRules: any;
  defaultProps: any;
}

export default defineComponent({
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
    treeOptions: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data():dataType {
    return {
      pageLoading: false,
      dialogVisible: false,
      nameSuffix: {
        enable: true,
        options: ['@lapa.com', '@dingtalk.com', '@163.com', '@qq.com'],
        value: ''
      },
      defaultProps: {
        value: 'id',
        label: 'name',
        children: 'childList'
      },
      businessDeptList: [],
      disabledBusinessDept: [],
      title: '',
      formData: {},
      positionList: [],
      defaultData: {
        username: '',
        businessDeptIds: [],
        employeeNo: '',
        dtUserId: '',
        password: 'a123456',
        superAdmin: '0',
        name: '',
        phone: '',
        email: '',
        userId: '',
        positionIds: [],
        deptId: null
      },
      changeKeys: {},
      oldFormData: {},
      toString: ['superAdmin'],
      toNumber: [],
      stringToArray: {
        businessDeptIds: ','
      },
      formRules: {
        email: [
          { validator: this.validatorEmail, trigger: 'blur', tips: '邮箱' }
        ],
        phone: [
          { required: false, validator: this.validatorMobile, trigger: 'blur' },
          { required: false, validator: this.validatorMobile, trigger: 'change' }
        ],
        employeeNo: [
          { validator: this.validatorNumber, trigger: 'blur' },
          { validator: this.validatorNumber, trigger: 'change' }
        ],
        positionIds: [
          { required: true, message: '请选择岗位', trigger: 'change' }
        ],
        deptId: [
          { required: true, message: '请选择部门', trigger: 'change' }
        ],
        name: [
          { required: true, message: '请输入姓名', trigger: 'change' },
          { max: 20, message: '姓名长度在 20 个字符以内', trigger: 'change' },
          { required: true, message: '请输入姓名', trigger: 'blur' },
          { max: 20, message: '姓名长度在 20 个字符以内', trigger: 'blur' }
        ]
      }
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
          this.getPositionData();
          this.getBusinessDept();
          this.initData(this.moduleData);
        })
      }
    }
  },
  computed: {
    treeListData():any {
      return this.treeOptions
    },
    modalTitle (): string {
      if (this.$common.isEmpty(this.moduleData)) return '新增用户';
      return `编辑用户-${this.moduleData.name}(${this.moduleData.username})`;
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
    initData (val:any) {
      if(!this.$common.isEmpty(val)) {
        this.formRules['username'] = [];
        const changeKeys = Object.keys(this.changeKeys);
        Object.keys(this.formData).forEach(key => {
          if(typeof val[key] !== 'undefined') {
            if (key === 'positionIds') {
              this.formData[key] = this.$common.isEmpty(val[key]) ? '' : val[key].split(',').map((item:any) => {
                return Number(item)
              });
            } else if (this.toString.includes(key) && !this.$common.isEmpty(val[key])) {
              this.formData[key] = val[key].toString();
            } else if (typeof this.stringToArray[key] !== 'undefined' && !this.$common.isEmpty(val[key])) {
              this.formData[key] = val[key].split(this.stringToArray[key]);
            } else {
              this.formData[key] = val[key];
            }
          } else if (changeKeys.includes(key) && typeof val[this.changeKeys[key]] !== 'undefined') {
            if (key === 'positionIds') {
              this.formData[key] = this.$common.isEmpty(val[this.changeKeys[key]]) ? '' : val[this.changeKeys[key]].split(',').map((item:any) => {
                return Number(item)
              });
            } else {
              this.formData[key] = val[this.changeKeys[key]]
            }
          }
        })
        this.$nextTick(() => {
          this.$refs.userForm && this.$refs.userForm.clearValidate();
        });
      } else {
        // 改变规则时 使用 nextTick 不会等待
        this.formRules['username'] = [
          { required: true, validator: this.validatorEmail, trigger: 'blur', msg: '请输入账号', tips: '账号' },
          { required: true, validator: this.validatorEmail, trigger: 'change', msg: '请输入账号', tips: '账号' }
        ];
        setTimeout(() => {
          this.$refs.userForm && this.$refs.userForm.clearValidate();
        }, 30);
      }
    },
    // 关闭
    closeDrawer () {
      this.dialogVisible = false;
      this.pageLoading = false;
      this.formData = this.$common.copy(this.defaultData);
      this.$nextTick(() => {
        this.$refs.userForm && this.$refs.userForm.clearValidate();
      })
    },
    // 保存
    confirm () {
      this.$refs.userForm.validate((valid:boolean) => {
        this.pageLoading = false;
        if (!valid) return;
        this.pageLoading = true;
        const newRequer = this.$common.copy(this.formData);
        const requer = this.$common.encryption({
          data: {
            password: newRequer.password
          },
          key: 'auths.dyt.com.hk',
          param: ['password']
        });
        newRequer.password = requer.password;
        newRequer.positionIds = (newRequer.positionIds || []).join(',');
        newRequer.businessDeptIds = (newRequer.businessDeptIds || []).join(',');
        this.formData.userId && delete newRequer.password;
        this.$http.post(this.api.management[this.formData.userId ? 'update' : 'addUser'], newRequer, {removeEmpty: false}).then(res => {
          this.$emit('update:refresh', true);
          this.closeDrawer();
          this.$message.success('操作成功!');
          this.pageLoading = false;
          this.$nextTick(() => {
            this.dialogVisible = false;
          })
        }).catch(() => {
          this.pageLoading = false;
        })
      })
    },
    // 获取岗位
    getPositionData () {
      this.positionList = [];
      this.$http.get(this.api.jobs.treeList, {params: {}, hiddenError: true }).then(res => {
        if (res.data) {
          let newList:Array<any> = [];
          const hand = (arr:any = []) => {
            arr.forEach((item:any) => {
              ![-1, '-1'].includes(item.id) && newList.push({
                value: item.id,
                label: item.name
              });
              if (!this.$common.isEmpty(item.childList)) {
                hand(item.childList)
              }
            })
          }
          hand([res.data]);
          this.positionList = newList;
        }
      })
    },
    // 获取事业部
    getBusinessDept () {
      this.businessDeptList = [];
      // this.$http.get(this.api.globalApi.division.list, { params: {enable: 1}, hiddenError: true }).then(res => {
      this.$http.get(this.api.globalApi.division.list, { params: {}, hiddenError: true }).then(res => {
        if (res.data) {
          this.businessDeptList = (res.data ? res.data.map((item:any) => {
            [0, '0'].includes(item.enable) && this.disabledBusinessDept.push(item.id.toString());
            return { ...item, value: item.id.toString(), label: item.name }
          }) :[]);
        }
      })
    },
    // 验证邮箱
    validatorEmail (rule:any, value:any, callback:any) {
      if (rule.required && this.$common.isEmpty(value)) return callback(new Error(rule.msg));
      if (this.$common.isEmpty(value)) return callback();
      const reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
      let suffix = value.split('@')[1];
      if (!reg.test(value) || !suffix.includes('.')) {
        callback(new Error(`${rule.tips}格式不符合规范，请检查后再输入！`));
        return;
      }
      suffix = suffix.split('.');
      suffix.length === 2 && suffix[1].length > 0 ? callback() : callback(new Error(`${rule.tips}格式不符合规范，请检查后再输入！`));
    },
    // 验证手机号码
    validatorMobile (rule:any, value:any, callback:any) {
      // if (this.$common.isEmpty(value)) return callback(new Error('请输入电话号码'));
      if (!this.$common.isEmpty(value)) {
        const reg = /^\+?[1-9][0-9]*$/;
        if (!reg.test(value)) return callback(new Error('电话号码格式不符合规范，请检查后再输入'));
        if (value.length > 20 || value.length < 7) {
          return callback(new Error(`最${value.length < 7 ? '少7' : '多20'}位号码`));
        }
      }
      callback();
    },
    // 验证是否为数
    validatorNumber (rule:any, value:any, callback:any) {
      // const reg = /^\+?[1-9][0-9]*$/;
      // if (!reg.test(value) && !this.$common.isEmpty(value)) return callback(new Error('格式不符合规范，请输入数字'));
      callback();
    },
    // 密码验证
    validatorPassword (rule:any, value:any, callback:any) {
      if (this.$common.isEmpty(value) && !this.formData.userId) return callback(new Error('请输入密码'));
      if (this.formData.userId && value.length > 0 || !this.formData.userId) {
        if (value.length < 6 || value.length > 20) return callback(new Error('长度最少6位最多20位'));
        // 包含数字、字母
        if (!/\d/.test(value) || !/[a-z]/i.test(value)) return callback(new Error('密码必须包含数字、字母'));
      }
      callback();
    },
    businessDeptChange (val:any) {
      let newVal:Array<[]> = [];
      val.forEach((item:any) => {
        !this.disabledBusinessDept.includes(item) && newVal.push(item);
      });
      this.formData['businessDeptIds'] = newVal;
    }
  }
});
</script>
<style lang="scss">
.user-content{
  .tips-error{
    margin-left: 10px;
    font-size: 12px;
    color: var(--el-color-danger);
    line-height: 1.2em;
  }
}
.el-select-dropdown{
  .disabled-option{
    &:not(.selected) {
      color: var(--dyt-placeholder-color);
      cursor: no-drop;
    }
  }
}
.add-edit-user-dialog{
  max-width: 700px;
}
</style>