<template>
  <dyt-dialog
    size="medium"
    v-model="dialogVisible"
    :title="(`${formData.id ? '编辑': '新增'}公告`)"
    :fixed-height="false"
    @closed="closeDrawer"
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
        label-width="70px"
        class="add-edit-form"
        @submit.prevent
      >
        <el-form-item
          label="标题："
          prop="title"
        >
          <dyt-input
            v-model="formData.title"
            :clearable="true"
            placeholder="请输入公告标题，限 200 字符"
          />
        </el-form-item>
        <el-form-item
          label=""
          prop="content"
          label-width="0"
        >
          <dytUEditor
            v-model="formData.content"
            :config="editorConfig"
            editor-id="noticeEditor"
            :upload-file="uploadFile"
            @ready="ready"
          />
        </el-form-item>
      </el-form>
    </div>
    <template v-slot:footer>
      <div class="foolter-button">
        <dyt-button
          type="primary"
          @click="confirm(0)"
        >
          保存为草稿
        </dyt-button>
        <dyt-button
          type="primary"
          @click="confirm(1)"
        >
          保存为发布
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
const process = import.meta.env;

const getPath = () => {
  if (['dev'].includes(process.ENV_CONFIG) && [8456].includes(window.location.protocol)) return './UEditor/';
  return './UEditor/';
}

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
    }
  },
  data() {
    return {
      pageLoading: false,
      dialogVisible: false,
      iamgeUrl: '',
      uploadData: {
        pathType: 1
      },
      title: '',
      formData: {},
      defaultData: {
        id: '',
        title: '',
        content: '',
        status: ''
      },
      formRules: {
        title: [
          { required: true, message: '请输入公告标题', trigger: 'change' },
          { max: 200, message: '公告标题限 200 字符', trigger: 'change' },
          { required: true, message: '请输入公告标题', trigger: 'blur' },
          { max: 200, message: '公告标题限 200 字符', trigger: 'blur' }
        ]
      },
      editorConfig: {
        toolbars: [
          [  //定制工具栏图标
            'fullscreen', 'source', 'undo', 'redo', 'template', 'anchor', 'bold', 'indent','italic', 'underline', 'touppercase', 'tolowercase',
            'fontborder', 'strikethrough', 'superscript', 'subscript', 'removeformat', 'formatmatch', 'autotypeset', 'blockquote', 'pasteplain',
            'forecolor', 'backcolor', 'insertorderedlist', 'insertunorderedlist', 'selectall',  'rowspacingtop', 'rowspacingbottom', 'lineheight', 
            'customstyle', 'paragraph', 'fontfamily', 'fontsize', 'insertcode',  'directionalityltr', 'directionalityrtl',  
            'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', 'imagenone', 'imageleft', 'imageright', 'imagecenter',
            'link', 'unlink', 'simpleupload', 'insertframe', 'emotion', 'map', 'background',  'horizontal', 'date', 'time', 'spechars', 'edittable',
            'inserttable', 'deletetable', 'insertparagraphbeforetable', 'insertrow', 'cleardoc','deleterow', 'insertcol', 'deletecol',
            'mergecells', 'mergeright', 'mergedown',  'searchreplace', 'drafts', 'print', 'preview', 'help',
          ]
        ],
        // 访问 UEditor 静态资源的根路径
        UEDITOR_HOME_URL: getPath(),
        // 文件上传功服务端接口（http://35.201.165.105:8000/controller.php）
        serverUrl: '',
        // 初始容器高度
        initialFrameHeight: 500,
        // 编辑器不自动被内容撑高
        // autoHeightEnabled: false,
        // 初始容器宽度
        initialFrameWidth: '100%',
        // 工具栏是否浮动
        autoFloatEnabled: false
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
        this.$nextTick(() => {
          if (val) {
            this.initData(this.moduleData);
          } else {
            this.formData = this.$common.copy(this.defaultData);
          }
        })
      }
    }
  },
  created() {},
  // 页面渲染完
  mounted() {
    
  },
  // 组件销毁前
  beforeUnmount () {},
  methods: {
    initData (val) {
      this.$nextTick(() => {
        if(!this.$common.isEmpty(val)) {
          this.$http.get(this.api.announcement.getDetails, {params: {id: val.id}}).then(res => {
            if (res.data) {
              Object.keys(this.defaultData).forEach(key => {
                if(typeof res.data[key] !== 'undefined') {
                  this.formData[key] = res.data[key];
                }
              })
            }
            this.$nextTick(() => {
              this.$refs.addEditForm && this.$refs.addEditForm.clearValidate();
            })
          }).catch(() => {
            this.$nextTick(() => {
              this.$refs.addEditForm && this.$refs.addEditForm.clearValidate();
            })
          });
          return;
        }
        this.$nextTick(() => {
          this.$refs.addEditForm && this.$refs.addEditForm.clearValidate();
        })
      })
    },
    // 关闭
    closeDrawer () {
      this.dialogVisible = false;
      this.pageUeditor = {};
    },
    // 保存
    confirm (status) {
      this.$refs.addEditForm.validate(valid => {
        if (!valid) return;
        let formData = this.$common.copy(this.formData);
        this.pageLoading = true;
        this.$http.post(this.api.announcement[formData.id ? 'update' : 'save'], {
          ...formData,
          status: status
        }, {removeEmpty: false}).then(res => {
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
    // 这里可以拿到 ue 的实例，比如 ue.getContent() 就可以拿到编辑器的html内容
    ready(ue) {},
    // 编辑器文件上传
    uploadFile (file) {
      return new Promise((resolve, reject) => {
        let uploadFormData = new FormData();
        uploadFormData.append('file', file);
        Object.keys(this.uploadData).forEach(key => {
          uploadFormData.append(key, this.uploadData[key]);
        });
        this.$http.post(this.api.globalApi.common.upload, uploadFormData, {
          headers: {
            'content-type': 'application/x-www-form-urlencoded'
          }
        }).then(res => {
          res.data ? resolve(res.data) : reject(res && res.msg ? res.msg : '插入图片失败，请尝试重新插入！');
        }).catch(err => {
          reject(err.msg || '插入图片失败，请尝试重新插入！');
        })
      });
    }
  }
};
</script>
<style lang="scss">
// .add-edit-content{}
#edui_fixedlayer{
  z-index: 99999999 !important;
}
.edui-default .edui-toolbar .edui-button,
.edui-default .edui-toolbar .edui-splitbutton,
.edui-default .edui-toolbar .edui-menubutton,
.edui-default .edui-toolbar .edui-combox{
  line-height: 1em;
}
.notice-upload{
  display: none;
}
</style>