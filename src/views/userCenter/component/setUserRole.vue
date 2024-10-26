<template>
  <dyt-dialog
    v-model="dialogVisible"
    :title="modalTitle"
    :before-close="closeDialog"
  >
    <div
      v-loading="pageLoading"
      class="user-role-content"
    >
      <el-form
        ref="userRoleForm"
        :inline="false"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        class="demo-userRoleForm"
        style="padding-right: 15px;"
        @submit.prevent
      >
        <el-form-item
          label="请选择系统: "
          prop="systemId"
        >
          <dytTreeSelect
            v-model="formData.systemId"
            style="width:50%; display: inline-block;vertical-align: middle;"
            :multiple="false"
            :defaultProps="defaultProps"
            :options="systemOptions"
            placeholder="请选择系统"
            @input="getSystemVal"
          />
        </el-form-item>
        <el-form-item
          v-if="roleFilter.systemId.value"
          label="包含角色: "
          prop="roleIds"
          class="roleIds-calss"
        >
          <dyt-input-tag
            v-model="formData.roleRows"
            :add-tag="false"
            :default-prop="tagProp"
            style="min-height: 100px; max-height: 400px;"
          />
        </el-form-item>
      </el-form>
      <div v-if="roleFilter.systemId.value">
        <roleList
          :role-filter="roleFilter"
          v-model:check-role-list="formData.roleRows"
          v-model:editing="isEdit"
        />
      </div>
    </div>
    <template v-slot:footer>
      <div class="foolter-button">
        <dyt-button
          type="primary"
          :disabled="!formData.systemId"
          @click="confirm"
        >
          保存
        </dyt-button>
        <dyt-button @click="closeDialog('')">
          取消
        </dyt-button>
      </div>
    </template>
  </dyt-dialog>
</template>
<script>
import { defineComponent } from 'vue';
import roleList from './roleList.vue';

export default defineComponent({
  name: 'SetUserRole',
  components: { roleList },
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
  data() {
    return {
      pageLoading: false,
      dialogVisible: false,
      isEdit: false,
      // 规则搜索设置
      roleFilter: {
        systemId: {
          disabled: true,
          value: null
        }
      },
      defaultProps: {
        value: 'id',
        label: 'name',
        children: 'childList'
      },
      systemOptions: [],
      systemJsons: {},
      positionList: [],
      tagProp: { label: 'name', value: 'id'},
      formData: {},
      defaultData: {
        roleRows: [],
        userId: '',
        systemId: null
      },
      changeKeys: {},
      oldFormData: {},
      toString: [],
      formRules: {
        systemId: [
          { required: true, message: '请选择系统', trigger: 'change' }
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
          this.initData(this.moduleData);
        })
      }
    }
  },
  computed: {
    modalTitle () {
      if (this.$common.isEmpty(this.moduleData)) return '设置角色';
      return `设置角色-${this.moduleData.name}(${this.moduleData.username})`;
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
      const allRequer = [this.getAllSystem()];
      Object.keys(this.formData).forEach(item => {
        if (typeof val[item] !== 'undefined') {
          this.formData[item] = val[item];
        }
      })
      this.pageLoading = true;
      Promise.all(allRequer).then(resList => {
        this.systemOptions = resList[0];
        this.$nextTick(() => {
          this.pageLoading = false;
          this.$refs.userRoleForm && this.$refs.userRoleForm.clearValidate();
        })
      }).catch(e => {
        this.pageLoading = false;
        this.$nextTick(() => {
          this.$refs.userRoleForm && this.$refs.userRoleForm.clearValidate();
        })
      })
    },
    // 获取角色
    getRoleList (systemId) {
      return new Promise(resolve => {
        this.$http.get(this.api.setRole.list, {
          params: {
            userId: this.formData.userId,
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
    // 关闭
    closeDialog (done) {
      this.isEdit = false;
      this.formData = this.$common.copy(this.defaultData);
      this.roleFilter = {
        systemId: {
          disabled: true,
          value: null
        }
      }
      this.$nextTick(() => {
        typeof done === 'function' ? done() : (this.dialogVisible = false);
      })
    },
    // 保存
    confirm () {
      return new Promise(resolve => {
        this.pageLoading = true;
        let requer = this.$common.copy(this.formData);
        requer.roleIds = requer.roleRows.map(row => {
          return row.id;
        }).join(',')
        this.$http.post(this.api.setRole.saveOrUpdate, {
          ...requer,
          systemId: this.roleFilter.systemId.value
        }, {removeEmpty: false}).then(res => {
          this.$emit('update:refresh', true);
          this.isEdit = false;
          this.$message.success('操作成功!');
          this.pageLoading = false;
          resolve();
        }).catch(() => {
          this.pageLoading = false;
          resolve();
        })
      })
      
    },
    // 树选值改变时候回调
    getSystemVal (treeId) {
      if (this.$common.isEmpty(treeId)) return;
      const hand = () => {
        this.getRoleList(treeId).then(res => {
          this.roleFilter.systemId.value = treeId;
          this.formData.roleRows = res || [];
        });
      }
      if (this.isEdit) {
        this.isEdit = false;
        this.$confirm('您有修改还未保存，是否先保存数据再切换系统？', "提示", {
          closeOnClickModal: false,
          showClose: false,
          closeOnPressEscape: false,
          confirmButtonText: '保存',
          cancelButtonText: '不保存',
          type: 'warning'
        }).then(() => {
          this.confirm().then(() => {
            hand();
          })
        }).catch(() => {
          hand();
        })
        return
      }
      hand();
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
                  hand(item.childList)
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
    }
  }
});
</script>
<style lang="scss">
.user-role-content{
  .tips-error{
    font-size: 12px;
    color: var(--el-color-danger);
    line-height: 1.2em;
  }
  .roleIds-calss{
    .el-form-item__content{
      line-height: 0;
    }
  }
}
</style>