<template>
  <div
    v-loading="itemLoading"
    class="jobs-container"
    element-loading-text="数据加载中..."
  >
    <div
      v-loading="departLoading"
      class="item-tree-list"
      element-loading-text="数据加载中..."
    >
      <div class="item-tree-head">
        <dyt-button
          v-if="power.save"
          type="primary"
          style="margin-bottom: 15px;"
          @click="createNewItem"
        >
          新建岗位
        </dyt-button>
        <dyt-input
          v-model="filterText"
          placeholder="输入关键字搜索"
          :clearable="true"
          style="margin-bottom: 15px;"
        />
      </div>
      <el-tree
        ref="itemTree"
        class="item-tree-dom"
        :data="(treeData[0] ? treeData[0].childList || [] : [])"
        :props="defaultProps"
        node-key="id"
        :default-expanded-keys="expandKeys"
        :highlight-current="true"
        :expand-on-click-node="false"
        :filter-node-method="filterNode"
        @node-click="nodeClick"
        @node-expand="nodeExpand"
        @node-collapse="nodeCollapse"
      >
        <template v-slot="scope">
          <div>
            {{ scope.data.name }}
          </div>
        </template>
      </el-tree>
    </div>
    <div class="item-item-info">
      <div class="item-item-head">
        <span>{{ `${addOrEdit === 'add' ? '新建' : '编辑'}岗位` }}</span>
        <span>
          <dyt-button
            v-if="power.remove && !$common.isEmpty(formData.id)"
            type="danger"
            @click="delItem"
          >删除</dyt-button>
        </span>
      </div>
      <el-form
        ref="itemForm"
        :inline="false"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        class="demo-itemForm"
        :disabled="!power.save || (!power.update && addOrEdit === 'edit')"
        @submit.prevent
      >
        <el-form-item
          label="岗位名称："
          prop="name"
        >
          <dyt-input
            v-model="formData.name"
            :clearable="true"
            placeholder="请输入岗位名称"
          />
        </el-form-item>
        <!-- <el-form-item
          label="岗位代码："
          prop="code"
        >
          <dyt-input
            v-model="formData.code"
            :clearable="true"
            placeholder="请输入岗位代码"
            :disabled="addOrEdit !== 'add'"
          />
        </el-form-item> -->
        <el-form-item
          label="上级岗位："
          prop="parentId"
        >
          <!-- :default-expand-level="1" -->
          <dytTreeSelect
            v-model="formData.parentId"
            :multiple="false"
            :defaultProps="dytDefaultProps"
            :options="checkTreeData"
            placeholder="请选择岗位"
            :disabled="!(addOrEdit === 'add') || !power.save"
          />
        </el-form-item>
        <el-form-item
          label="排序："
          prop="sort"
        >
          <dyt-input
            v-model="formData.sort"
            type="number"
            :clearable="true"
            placeholder="请输入数字"
          />
        </el-form-item>
        <el-form-item
          label="岗位描述："
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
        <el-form-item
          label="是否启用："
          prop="enable"
        >
          <el-radio-group v-model="formData.enable">
            <el-radio :label="0">
              关闭
            </el-radio>
            <el-radio :label="1">
              启用
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="">
          <div class="item-item-flooter">
            <dyt-button
              v-if="!(!power.save || (!power.update && addOrEdit === 'edit'))"
              type="primary"
              @click="saveItem"
            >
              保存
            </dyt-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
interface dataType{
  addOrEdit:string;
  itemLoading: boolean;
  departLoading: boolean;
  treeItemJson: any;
  filterText: string;
  formData: any;
  expandKeys: any;
  oldExpandKeys: any;
  firstInitTree: boolean;
  initFormData: any;
  formRules: any;
  treeData: any;
  checkTreeData: any;
  defaultProps: any;
  dytDefaultProps: any;
}

export default defineComponent({
  name: 'JobsManagement',
  components: {},
  props: {},
  data():dataType {
    return {
      addOrEdit: 'add',
      itemLoading: false,
      departLoading: false,
      treeItemJson: {
        '-1': {id: -1, depth: -1, name: '全部'}
      },
      dytDefaultProps: {
        value: 'id',
        label: 'name',
        disabled: 'isDisabled',
        children: 'childList'
      },
      filterText: '',
      // 表单数据
      formData: {},
      expandKeys: [],
      oldExpandKeys: [],
      firstInitTree: true,
      initFormData: {
        id: '',
        name: '',
        parentId: null,
        sort: 0,
        parentIds: '',
        depth: null,
        enable: 1,
        description: '',
        // code: ''
      },
      // 表单规则
      formRules: {
        name: [
          { required: true, message: '请输入岗位名称', trigger: 'change' },
          { required: true, message: '请输入岗位名称', trigger: 'blur' }
        ],
        // code: [
        //   { required: true, validator: this.codeValidate, trigger: 'change' },
        //   { required: true, validator: this.codeValidate, trigger: 'blur' }
        // ],
        parentId: [
          { required: true, message: '请选择上级岗位', trigger: 'change' }
        ],
        enable: [
          { required: true, message: '请选择是否启用', trigger: 'change' }
        ]
      },
      treeData: [{id: -1, depth: -1, name: '全部'}],
      checkTreeData: [{id: -1, depth: -1, name: '全部'}],
      defaultProps: {
        children: 'childList',
        label: 'name'
      }
    }
  },
  computed: {
    power ():any {
      return this.$common.getPower({
        save: 'positionManagement_save',
        remove: 'positionManagement_remove',
        update: 'positionManagement_update'
      })
    }
  },
  watch: {
    filterText(val:any) {
      this.$refs.itemTree && this.$refs.itemTree.filter(val);
    }
  },
  created() {
    this.getItemTree();
    this.initPage();
  },
  // 页面渲染完
  mounted() {},
  // 组件销毁前
  beforeUnmount () {},
  methods: {
    initPage () {
      this.addOrEdit = 'add';
      this.formData = this.$common.copy(this.initFormData);
      this.$nextTick(() => {
        // this.$refs.itemForm && this.$refs.itemForm.resetFields();
        this.$refs.itemTree && this.$refs.itemTree.setCurrentKey(null);
        this.$refs.itemForm && this.$refs.itemForm.clearValidate();
      })
    },
    createNewItem () {
      this.addOrEdit = 'add';
      this.checkTreeData = this.treeData;
      this.$refs.itemTree && this.$refs.itemTree.setCurrentKey(null);
      if (this.$common.isEmpty(this.formData.parentId)) {
        this.formData = this.$common.copy(this.initFormData);
      } else {
        const handFrom = this.$common.copy(this.formData);
        Object.keys(handFrom).forEach(key => {
          if (key === 'parentId') {
            handFrom[key] = this.formData.id || this.formData.parentId || null;
          } else {
            handFrom[key] = this.initFormData[key];
          }
        })
        this.formData = handFrom;
      }
      this.$nextTick(() => {
        this.$refs.itemForm && this.$refs.itemForm.clearValidate();
      })
    },
    // 获取单个岗位信息
    getItemInfo () {
      this.$http.get(this.api.globalApi.jobs.get, {}).then((res:any) => {})
    },
    // 获取所有岗位树
    getItemTree () {
      this.itemLoading = true;
      this.departLoading = true;
      this.$http.get(this.api.jobs.treeList, {params: {}, hiddenError: true }).then((res:any) => {
        if (res.data) {
          res.data.name = '全部';
          res.data.parentIds = -1;
          !this.firstInitTree && (this.expandKeys = this.oldExpandKeys);
          const hand = (arr:Array<[]> = []) => {
            arr.forEach((item:any) => {
              this.treeItemJson[item.id] = item;
              if (!this.$common.isEmpty(item.childList)) {
                hand(item.childList)
              } else {
                delete item.childList;
              }
            })
          }
          hand([res.data]);
          this.treeData = [res.data];
          this.checkTreeData = this.treeData;
          // 标记选中
          this.$nextTick(() => {
            this.firstInitTree && (this.expandKeys = Object.keys(this.treeItemJson).map(id => Number(id)));
            this.oldExpandKeys = this.$common.copy(this.expandKeys);
            this.firstInitTree = false;
            if (!this.$common.isEmpty(this.formData.id) && this.$refs.itemTree) {
              this.$refs.itemTree.setCurrentKey(this.formData.id);
            }
          })
        }
        this.itemLoading = false;
        this.departLoading = false;
      }).catch(() => {
        this.itemLoading = false;
        this.departLoading = false;
      })
    },
    // 树节点被点击
    nodeClick (data:any) {
      this.addOrEdit = 'edit';
      this.formData = this.$common.copy(data);
      delete this.formData.childList;
      let newData = this.$common.copy(this.treeData);
      const hand = (arr:any) => {
        arr.forEach((item:any) => {
          if (data.id === item.id) {
            item.isDisabled = true;
          } else {
            delete item.isDisabled;
            if (item.childList && this.$common.isArray(item.childList)) {
              hand(item.childList);
            }
          }
        })
      }
      hand(newData);
      this.checkTreeData = newData;
      this.$nextTick(() => {
        this.$refs.itemForm && this.$refs.itemForm.clearValidate();
      })
      // this.formData = this.$common.copy(this.initFormData);
    },
    // 搜索
    filterNode (value:string, data:any) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
    // 保存
    saveItem () {
      this.$refs.itemForm.validate((valid:boolean) => {
        if (!valid) return;
        this.itemLoading = true;
        let newParams = this.$common.copy(this.formData);
        const parentItem = this.treeItemJson[this.formData.parentId];
        newParams.depth = parentItem.depth + 1;
        newParams.parentIds = `${[-1, '-1'].includes(parentItem.id) ? '' : parentItem.parentIds ? `${parentItem.parentIds}.${parentItem.id}` : parentItem.id }`;
        this.$common.isEmpty(this.formData.id) && delete newParams.id;
        // console.log(newParams, parentItem)
        this.$common.isEmpty(newParams.sort) && (newParams.sort = 0);
        this.$http.post(this.api.jobs[this.$common.isEmpty(newParams.id) ? 'save' : 'update'], newParams, {removeEmpty: false}).then((res:any) => {
          this.getItemTree();
          this.$nextTick(() => {
            this.addOrEdit === 'add' && this.createNewItem();
          })
          this.itemLoading = false;
          this.$message.success('操作成功！');
        }).catch(() => {
          this.itemLoading = false;
        })
      })
    },
    // 删除岗位
    delItem () {
      this.$confirm(`确认删除岗位：${this.formData.name}？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.itemLoading = true;
        this.$http.post(this.api.jobs.remove, {id: this.formData.id}).then((res:any) => {
          this.getItemTree();
          this.initPage();
          this.itemLoading = false;
          this.$message.success('操作成功！');
        }).catch(() => {
          this.itemLoading = false;
        })
      }).catch(() => {})
    },
    // 展开时
    nodeExpand (data:any, node:any, el:any) {
      !this.oldExpandKeys.includes(data.id) && this.oldExpandKeys.push(data.id);
    },
    // 收起时
    nodeCollapse (data:any, node:any, el:any) {
      const hand = (nodeData:any) => {
        if (this.oldExpandKeys.includes(nodeData.id)) {
          this.oldExpandKeys.splice(this.oldExpandKeys.indexOf(nodeData.id), 1);
          if (!this.$common.isEmpty(nodeData.childList)) {
            nodeData.childList.forEach((item:any) => {
              hand(item);
            })
          }
        }
      }
      hand(data);
    },
    // 校验权限代码
    // codeValidate (rule, value, callback) {
    //   if (this.$common.isEmpty(value)) return callback(new Error('请输入岗位代码'));
    //   if (!/^[^\u4e00-\u9fa5]*$/.test(value) || value.includes(' ')) return callback(new Error(`不可输入${value.includes(' ') ? '空格' : '中文'}`));
    //   if (value.length < 6) return callback(new Error('长度最少6位'));
    //   callback();
    // }
  }
});
</script>
<style lang="scss" scoped>
.jobs-container{
  height: 100%;
  padding: 0;
  display: flex;
  .item-tree-list{
    width: 400px;
    min-width: 400px;
    padding: 10px 0;
    background: #fff;
    box-shadow: 1px 0 5px 1px var(--layout-shadow-color);
  }
  .item-tree-head{
    padding: 0 10px;
  }
  .item-item-info{
    position: relative;
    width: calc(100% - 400px);
    min-width: 400px;
    margin: 0 10px;
    padding: 10px;
    background: #fff;
    box-shadow: 0 0 5px 1px var(--layout-shadow-color);
  }
  .item-tree-dom{
    padding: 0 10px;
    height: calc(100% - 95px);
    overflow: auto;
  }
  .item-item-head{
    display: flex;
    height: 50px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--layout-border-color);
    // box-shadow: 0 1px 5px 1px var(--layout-shadow-color);
    span {
      flex: 50;
      &:first-of-type{
        padding-left: 10px;
        font-size: 16px;
        line-height: 40px;
      }
      &:last-of-type{
        margin-top: 4px;
        padding-right: 10px;
        text-align: right;
      }
    }
  }
  .demo-itemForm{
    display: block;
    margin-top: 10px;
    height: calc(100% - 100px);
    max-width: 700px;
    overflow-y: auto;
    overflow-x: hidden;
  }
}
</style>