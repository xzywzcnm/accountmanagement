<template>
  <dyt-dialog
    v-model="dialogVisible"
    :title="modalTitle"
  >
    <div
      v-loading="pageLoading"
      style="height:100%;"
      class="module-custom"
    >
      <el-form
        ref="refFormDome"
        :inline="false"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        class="demo-userForm"
        style="padding-right: 15px;"
        @submit.prevent
      >
        <el-form-item
          label="角色名称："
          prop="name"
        >
          <dyt-input
            v-model="formData.name"
            :clearable="true"
            placeholder="请输入角色名称"
          />
        </el-form-item>
        <!-- <el-form-item
          label="角色代码："
          prop="code"
        >
          <dyt-input
            v-model="formData.code"
            :clearable="true"
            :disabled="!!formData.id"
            placeholder="请输入角色代码"
          />
        </el-form-item> -->
        <el-form-item
          label="所属系统："
          prop="systemId"
        >
          <dytTreeSelect
            v-model="formData.systemId"
            :multiple="false"
            :defaultProps="dytDefaultProps"
            :options="treeOptions"
            placeholder="请选择系统"
          />
        </el-form-item>
        <el-form-item
          label="角色描述："
          prop="description"
        >
          <dyt-input
            v-model="formData.description"
            type="textarea"
            :clearable="true"
            :autosize="{minRows: 3, maxRows: 6}"
            resize="none"
            placeholder="请输入角色描述"
          />
        </el-form-item>
      </el-form>
    </div>
    <template v-slot:footer>
      <div>
        <dyt-button @click="addRowHand('close')">
          取 消
        </dyt-button>
        <dyt-button
          type="primary"
          @click="addRowHand('save')"
        >
          确定
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
    refresh: {
      type: Boolean,
      default: false
    },
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
      formData: {},
      dytDefaultProps: {
        value: 'id',
        label: 'name',
        children: 'childList'
      },
      defaultData: {
        id: '',
        name: '',
        // code: '',
        description: '',
        systemId: null
      },
      changeKeys: {},
      oldFormData: {},
      formRules: {
        name: [
          { required: true,  message: '请输入角色名称', trigger: 'blur' },
          { required: true,  message: '请输入角色名称', trigger: 'change' }
        ],
        // code: [
        //   { required: true,  message: '请输入角色代码', trigger: 'blur' },
        //   { required: true,  message: '请输入角色代码', trigger: 'change' }
        // ],
        systemId: [
          { required: true,  message: '请选择系统', trigger: 'change' }
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
        val && this.initData();
      }
    }
  },
  computed: {
    modalTitle () {
      if (this.$common.isEmpty(this.moduleData)) return '添加角色';
      return '编辑角色';
    }
  },
  created() {
    this.initData();
  },
  // 页面渲染完
  mounted() {},
  // 组件销毁前
  beforeUnmount () {},
  methods: {
    initData () {
      this.formData = this.$common.copy(this.defaultData);
      let moduleData = this.$common.copy(this.moduleData);
      if(!this.$common.isEmpty(moduleData)) {
        Object.keys(this.formData).forEach(key => {
          if (!this.$common.isEmpty(moduleData[key])) {
            this.formData[key] = moduleData[key];
          }
        })
      }
      this.$nextTick(() => {
        this.$refs.refFormDome && this.$refs.refFormDome.clearValidate();
      })
    },
    // 保存数据
    addRowHand (type) {
      if (type === 'close') {
        this.dialogVisible = false;
        return;
      }
      this.$refs.refFormDome.validate(valid => {
        if (!valid) return;
        this.pageLoading = true;
        this.$http.post(this.api.role[`${this.formData.id ? 'update' : 'save'}`], this.formData).then(res => {
          this.pageLoading = false;
          this.dialogVisible = false;
          this.$emit('update:refresh', true);
        }).catch(() => {
          this.pageLoading = false;
        })
      })
    }
  }
};
</script>
<style lang="scss" scoped>
.module-custom{
  position: relative;
}
</style>