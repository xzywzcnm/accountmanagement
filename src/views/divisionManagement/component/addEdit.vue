<template>
  <dyt-dialog
    v-model="dialogVisible"
    :title="(`${formData.id ? '编辑': '新建'}事业部`)"
  >
    <div
      v-loading="pageLoading"
      class="add-edit-content"
    >
      <el-form
        ref="addEditForm"
        :inline="false"
        :model="formData"
        :rules="formRules"
        label-width="130px"
        class="demo-add-edit-form"
        style="padding-right: 30px;"
        @submit.prevent
      >
        <el-form-item
          label="事业部名称："
          prop="name"
        >
          <dyt-input
            v-model="formData.name"
            :clearable="true"
            placeholder="请输事业部名称"
          />
        </el-form-item>
        
        <el-form-item
          label="事业部描述："
          prop="description"
        >
          <dyt-input
            v-model="formData.description"
            type="textarea"
            :autosize="{minRows: 3, maxRows: 6}"
            resize="none"
            placeholder="请输入岗位描述"
          />
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
<script>

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
      title: '',
      formData: {},
      defaultData: {
        name: '',
        id: '',
        description: '',
        sort: 0,
        enable: 1,
      },
      formRules: {
        name: [
          { required: true, message: '请输入事业部名称', trigger: 'change' },
          // { max: 20, message: '姓名长度在 20 个字符以内', trigger: 'change' },
          { required: true, message: '请输入事业部名称', trigger: 'blur' },
          // { max: 20, message: '姓名长度在 20 个字符以内', trigger: 'blur' }
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
  created() {},
  // 页面渲染完
  mounted() {},
  // 组件销毁前
  beforeUnmount () {},
  methods: {
    initData (val) {
      this.formData = this.$common.copy(this.defaultData);
      if(!this.$common.isEmpty(val)) {
        Object.keys(this.formData).forEach(key => {
          if(typeof val[key] !== 'undefined') {
            this.formData[key] = val[key];
          }
        })
      }
      this.$nextTick(() => {
        this.$refs.addEditForm && this.$refs.addEditForm.clearValidate();
      })
    },
    // 关闭
    closeDrawer () {
      this.dialogVisible = false;
    },
    // 保存
    confirm () {
      this.$refs.addEditForm.validate(valid => {
        if (!valid) return;
        this.pageLoading = true;
        const newRequer = this.$common.copy(this.formData);
        this.$http.post(this.api.division[this.formData.id ? 'update' : 'save'], newRequer, {removeEmpty: false}).then(res => {
          this.$emit('update:refresh', true);
          this.pageLoading = false;
          this.$message.success('操作成功!');
          this.$nextTick(() => {
            this.closeDrawer();
          })
        }).catch(() => {
          this.pageLoading = false;
        })
      })
    }
  }
};
</script>
<style lang="scss">
.add-edit-content{
  .tips-error{
    font-size: 12px;
    color: var(--el-color-danger);
    line-height: 1.2em;
  }
}
</style>