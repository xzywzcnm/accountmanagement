<template>
  <div
    v-loading="itemLoading"
    class="management-container"
    element-loading-text="数据加载中..."
  >
    <div class="item-tree-list">
      <div class="item-tree-head">
        <dyt-button
          v-if="power.save"
          type="primary"
          style="margin-bottom: 15px;"
          @click="createNewItem"
        >
          新建系统
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
        :default-expanded-keys="expandKeys"
        node-key="id"
        :highlight-current="true"
        :expand-on-click-node="false"
        :filter-node-method="filterNode"
        @node-click="nodeClick"
        @node-expand="nodeExpand"
        @node-collapse="nodeCollapse"
      >
        <template v-slot="scope">
          <div>
            <i
              :class="`lapa icon-${scope.data.icon}`"
              style="padding-right: 2px;"
            /> {{ scope.data.name }}
          </div>
        </template>
      </el-tree>
    </div>
    <div
      v-loading="infoLoading"
      class="item-item-info"
      element-loading-text="数据加载中..."
    >
      <div class="item-item-head">
        <span>{{ `${addOrEdit === 'add' ? '新建' : '编辑'}系统` }}</span>
        <span>
          <!-- <dyt-button
            v-if="power.remove && !$common.isEmpty(formData.id)"
            type="danger"
            @click="delItem"
          >删除</dyt-button> -->
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
          label="系统名称："
          prop="name"
        >
          <dyt-input
            v-model="formData.name"
            :clearable="true"
            placeholder="请输入系统名称"
          />
        </el-form-item>
        <el-form-item
          label="系统地址："
          prop="url"
        >
          <dyt-input
            v-model="formData.url"
            :clearable="true"
            placeholder="请输入系统地址"
          />
        </el-form-item>
        <el-form-item
          label="系统代码："
          prop="code"
        >
          <dyt-input
            v-model="formData.code"
            :clearable="true"
            placeholder="请输入系统代码"
            :disabled="!(addOrEdit === 'add') || !power.save"
          />
        </el-form-item>
        <el-form-item
          label="上级系统："
          prop="parentId"
        >
          <dytTreeSelect
            v-model="formData.parentId"
            :multiple="false"
            :defaultProps="dytDefaultProps"
            :options="checkTreeData"
            placeholder="请选择系统"
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
          label="系统图标："
          prop="icon"
        >
          <dyt-iconfont v-model="formData.icon" />
        </el-form-item>
        <!-- <el-form-item
          label="系统描述："
          prop="description"
        >
          <dyt-input
            v-model="formData.description"
            type="textarea"
            :clearable="true"
            :autosize="{minRows: 3, maxRows: 6}"
            resize="none"
            placeholder="请输入系统描述"
          />
        </el-form-item> -->
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
          <dyt-button
            v-if="!(!power.save || (!power.update && addOrEdit === 'edit'))"
            type="primary"
            style="margin-bottom: 15px;"
            @click="saveItem"
          >
            保存
          </dyt-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SystemManagement',
  components: {},
  data() {
    return {
      addOrEdit: 'add',
      infoLoading: false,
      itemLoading: false,
      iconfontJson: {},
      tagsJson: {},
      filterText: '',
      expandKeys: [],
      oldExpandKeys: [],
      firstInitTree: true,
      dytDefaultProps: {
        value: 'id',
        label: 'name',
        disabled: 'isDisabled',
        children: 'childList'
      },
      // 表单数据
      formData: {},
      initFormData: {
        id: '',
        name: '',
        code: '',
        url: '',
        parentId: null,
        icon: '',
        sort: 0,
        enable: 1,
        parentIds: '',
        // description: '',
        depth: ''
      },
      // 表单规则
      formRules: {
        name: [
          { required: true, message: '请输入系统名称', trigger: 'change' },
          { required: true, message: '请输入系统名称', trigger: 'blur' }
        ],
        url: [
          { required: true, message: '请输入系统地址', trigger: 'change' },
          { required: true, message: '请输入系统地址', trigger: 'blur' }
        ],
        code: [
          { required: true, validator: this.codeValidate, trigger: 'change' },
          { required: true, validator: this.codeValidate, trigger: 'blur' }
        ],
        parentId: [
          { required: true, message: '请选择系统', trigger: 'change' }
        ],
        enable: [
          { required: true, message: '请选择是否启用', trigger: 'change' }
        ]
      },
      treeData: [{id: -1, name: '全部'}],
      checkTreeData: [{id: -1, name: '全部'}],
      defaultProps: {
        children: 'childList',
        label: 'name'
      }
    }
  },
  computed: {
    power () {
      return this.$common.getPower({
        save: 'systemManagement_save',
        remove: 'systemManagement_remove',
        update: 'systemManagement_update'
      })
    }
  },
  watch: {
    filterText(val) {
      this.$refs.itemTree && this.$refs.itemTree.filter(val);
    }
  },
  created() {
    this.formData = this.$common.copy(this.initFormData);
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
        this.$refs.itemTree && this.$refs.itemTree.setCurrentKey(null);
        this.$refs.itemForm && this.$refs.itemForm.clearValidate();
      })
    },
    createNewItem () {
      this.addOrEdit = 'add';
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
        this.nodeClick({}, {}, {}, {}, true)
        this.$refs.itemForm && this.$refs.itemForm.clearValidate();
      })
    },
    // 保存系统
    saveItem () {
      this.$refs.itemForm.validate(valid => {
        if (!valid) return;
        this.itemLoading = true;
        let newParams = this.$common.copy(this.formData);
        const parentItem = this.tagsJson[this.formData.parentId];
        newParams.depth = parentItem.depth + 1;
        newParams.parentIds = `${[-1, '-1'].includes(parentItem.id) ? '' : parentItem.parentIds ? `${parentItem.parentIds}.${parentItem.id}` : parentItem.id }`;
        // newParams.code = parentItem.code;
        this.$common.isEmpty(this.formData.id) && delete newParams.id;
        this.$common.isEmpty(newParams.sort) && (newParams.sort = 0);
        this.$http.post(this.api.systemApi[this.$common.isEmpty(newParams.id) ? 'save' : 'update'], newParams, {removeEmpty: false}).then(res => {
          this.getItemTree();
          this.$nextTick(() => {
            this.addOrEdit === 'add' && this.createNewItem();
          })
          this.itemLoading = false;
          this.$emit('update:refresh', true);
          this.$message.success('操作成功！');
        }).catch(() => {
          this.itemLoading = false;
        })
      })
    },
    // 删除系统
    delItem () {
      this.$confirm(`确认删除系统：${this.formData.name}？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.itemLoading = true;
        this.$http.post(this.api.systemApi.remove, {id: this.formData.id}).then(res => {
          this.getItemTree();
          this.initPage();
          this.itemLoading = false;
          this.$message.success('操作成功！');
        }).catch(() => {
          this.itemLoading = false;
        })
      }).catch(() => {})
    },
    // 获取系统信息
    getItemInfo () {
      this.$http.get(this.api.globalApi.systemApi.get, {}).then(res => {})
    },
    // 获取所有系统树
    getItemTree () {
      this.itemLoading = true;
      this.$http.get(this.api.globalApi.systemApi.treeList, {params: {}}).then(res => {
        if (res.data) {
          res.data.name = '全部';
          res.data.parentIds = -1;
          !this.firstInitTree && (this.expandKeys = this.oldExpandKeys);
          const hand = (arr = []) => {
            arr.forEach(item => {
              this.tagsJson[item.id] = item;
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
            this.firstInitTree && (this.expandKeys = Object.keys(this.tagsJson).map(id => Number(id)));
            this.oldExpandKeys = this.$common.copy(this.expandKeys);
            this.firstInitTree = false;
            if (!this.$common.isEmpty(this.formData.id) && this.$refs.itemTree) {
              this.$refs.itemTree.setCurrentKey(this.formData.id);
            }
          })
        }
        this.itemLoading = false;
      }).catch(() => {
        this.itemLoading = false;
      })
    },
    // 树节点被点击
    nodeClick (data, attar, event, PointerEvent, type) {
      this.infoLoading = true;
      if (!type) {
        this.addOrEdit = 'edit';
        this.formData = this.$common.copy(data);
      }
      delete this.formData.childList;
      let newData = this.$common.copy(this.treeData);
      const hand = (arr) => {
        arr.forEach(item => {
          if (data.id === item.id && !type) {
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
        this.infoLoading = false;
      })
    },
    // 搜索
    filterNode (value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
    // 校验权限代码
    codeValidate (rule, value, callback) {
      if (this.$common.isEmpty(value)) return callback(new Error('请输入系统代码'));
      if (!/^[^\u4e00-\u9fa5]*$/.test(value) || value.includes(' ')) return callback(new Error(`不可输入${value.includes(' ') ? '空格' : '中文'}`));
      if (value.length < 6) return callback(new Error('长度最少6位'));
      callback();
    },
    // 展开时
    nodeExpand (data, node, el) {
      !this.oldExpandKeys.includes(data.id) && this.oldExpandKeys.push(data.id);
    },
    // 收起时
    nodeCollapse (data, node, el) {
      const hand = (nodeData) => {
        if (this.oldExpandKeys.includes(nodeData.id)) {
          this.oldExpandKeys.splice(this.oldExpandKeys.indexOf(nodeData.id), 1);
          if (!this.$common.isEmpty(nodeData.childList)) {
            nodeData.childList.forEach(item => {
              hand(item);
            })
          }
        }
      }
      hand(data);
    }
  }
});
</script>
<style lang="scss" scoped>
.management-container{
  height: 100%;
  padding: 0;
  display: flex;
  .item-tree-list{
    min-width: 240px;
    max-width: 400px;
    width: 30%;
    padding: 10px 0;
    background: #fff;
    box-shadow: 1px 0 5px 1px var(--layout-shadow-color);
  }
  .item-tree-head{
    padding: 0 10px;
  }
  .item-item-info{
    flex: 100;
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
    height: calc(100% - 60px);
    min-width: 300px;
    max-width: 600px;
    overflow-y: auto;
    overflow-x: hidden;
  }
}
</style>
<style lang="scss">
.item-tree-list{
  .el-tree-node__content>.el-tree-node__expand-icon{
    padding: 0 6px;
    font-size: 18px;
  }
  .el-tree__empty-text{
    top: 10px;
    transform: translate(-50%,0);
  }
}
</style>