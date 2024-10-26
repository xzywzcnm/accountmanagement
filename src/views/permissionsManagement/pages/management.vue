<template>
  <div
    v-loading="itemLoading"
    class="management-container"
    element-loading-text="数据加载中..."
  >
    <div class="item-tree-list">
      <div class="item-item-head">
        <span>系统</span>
        <span />
      </div>
      <div class="item-tree-head">
        <dyt-input
          v-model="filterSysText"
          placeholder="输入关键字搜索"
          style="margin-bottom: 15px;"
        />
      </div>
      <el-tree
        ref="systemTree"
        class="item-tree-dom"
        :data="systemTreeData"
        :props="defaultProps"
        default-expand-all
        node-key="id"
        :highlight-current="true"
        :expand-on-click-node="false"
        :filter-node-method="filterNode"
        @node-click="getSystemTreeData"
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
      v-loading="menuLoading"
      class="item-tree-list"
      element-loading-text="数据加载中..."
      style="margin-left: 10px;"
    >
      <div class="item-item-head">
        <span>权限</span>
        <span>
          <dyt-button
            v-if="power.save"
            type="primary"
            style="margin-bottom: 15px;"
            @click="createNewItem({})"
          >
            新建权限
          </dyt-button>
        </span>
      </div>
      <div class="item-tree-head">
        <dyt-input
          v-model="filterText"
          placeholder="输入关键字搜索"
          style="margin-bottom: 15px;"
        />
      </div>
      <el-tree
        ref="itemTree"
        class="item-tree-dom"
        :data="(treeData[0] ? treeData[0].childList || [] : [])"
        :props="defaultProps"
        :default-expanded-keys="(expandKeys[formData.systemId] || [])"
        node-key="id"
        :highlight-current="true"
        :expand-on-click-node="false"
        :filter-node-method="filterNode"
        :empty-text="itemEmptyText || '暂无数据'"
        @node-click="nodeClick"
        @node-expand="nodeExpand"
        @node-collapse="nodeCollapse"
      >
        <template v-slot="scope">
          <div >
            <i
              class="lapa"
              :class="{
                'icon-menu': [1, '1'].includes(scope.data.type),
                'icon-power': [2, '2'].includes(scope.data.type),
                'icon-eye': [3, '3'].includes(scope.data.type),
                'icon-interface': [4, '4'].includes(scope.data.type)
              }"
              style="padding-right: 2px;"
            />
            {{ scope.data.name }}
          </div>
        </template>
      </el-tree>
    </div>
    <div class="item-item-info">
      <div class="item-item-head">
        <span>{{ `${addOrEdit === 'add' ? '新建' : '编辑'}权限` }}</span>
        <span>
          <dyt-button
            v-if="power.remove"
            type="danger"
            :disabled="$common.isEmpty(formData.id)"
            @click="delItem"
          >删除</dyt-button>
        </span>
      </div>
      <el-form
        ref="itemForm"
        :disabled="!power.save || (!power.update && addOrEdit === 'edit')"
        :inline="false"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        class="demo-itemForm"
        @submit.prevent
      >
        <el-form-item
          label="权限类型："
          prop="type"
        >
          <dyt-select
            v-model="formData.type"
            :disabled="addOrEdit !== 'add'"
          >
            <el-option
              v-for="(item, index) in permissionTypesList"
              :label="item.label"
              :value="item.value"
              :key="index"
            >
              {{item.label}}
            </el-option>
          </dyt-select>
        </el-form-item>
        <el-form-item
          :label="`权限名称：`"
          prop="name"
        >
          <dyt-input
            v-model="formData.name"
            :placeholder="`请输入权限名称`"
          />
        </el-form-item>
        <el-form-item
          :label="`权限代码：`"
          prop="permission"
        >
          <dyt-input
            v-model="formData.permission"
            :placeholder="`请输入权限代码`"
            :disabled="addOrEdit !== 'add' && ![1, '1'].includes(formData.type)"
          />
        </el-form-item>
        <el-form-item
          label="所属系统："
          prop="systemId"
        >
          <dytTreeSelect
            v-model="formData.systemId"
            :multiple="false"
            :options="systemTreeData"
            :defaultProps="dytDefaultProps"
            placeholder="请选择系统"
            :disabled="!(addOrEdit === 'add') || !power.save"
            @input="getSysTreeData"
          />
        </el-form-item>
        <el-form-item
          :label="`父级权限：`"
          prop="parentId"
        >
          <dytTreeSelect
            v-model="formData.parentId"
            :multiple="false"
            :defaultProps="dytDefaultProps"
            :options="checkTreeData"
            :placeholder="`请选择父级权限`"
            :disabled="!(addOrEdit === 'add') || !power.save"
            :no-options-text="itemEmptyText"
          >
            <template v-slot:option-label="node">
              <div>
                <i
                  class="lapa"
                  :class="{
                    'icon-menu': [1, '1'].includes(node.raw.type),
                    'icon-power': [2, '2'].includes(node.raw.type),
                    'icon-eye': [3, '3'].includes(node.raw.type),
                    'icon-interface': [4, '4'].includes(node.raw.type)
                  }"
                  style="padding-right: 2px;"
                />
                {{ node.raw.name }}
              </div>
            </template>
          </dytTreeSelect>
        </el-form-item>
        <el-form-item
          v-if="[1, '1'].includes(formData.type)"
          :label="`末级菜单：`"
          prop="last"
        >
          <el-radio-group v-model="formData.last">
            <el-radio :label="0">
              否
            </el-radio>
            <el-radio :label="1">
              是
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="[1, '1'].includes(formData.last) || [2, '2', 4, '4'].includes(formData.type)"
          :label="`${[2, '2', 4, '4'].includes(formData.type) ? '接口' : '菜单'}地址：`"
          prop="url"
        >
          <dyt-input
            v-model="formData.url"
            :placeholder="`请输入${[2, '2', 4, '4'].includes(formData.type) ? '接口' : '菜单'}地址`"
          />
        </el-form-item>
        <el-form-item
          v-if="[1, '1'].includes(formData.type)"
          :label="`菜单图标：`"
          prop="icon"
        >
          <dyt-iconfont v-model="formData.icon" />
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
          :label="`权限描述：`"
          prop="description"
        >
          <dyt-input
            v-model="formData.description"
            type="textarea"
            :autosize="{minRows: 3, maxRows: 6}"
            resize="none"
            :placeholder="`请输入权限描述`"
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
import {reactive} from 'vue';

export default {
  name: 'ItemManagement',
  components: {},
  data() {
    return {
      itemEmptyText: '请选择系统',
      permissionTypesList: [
        {label: '菜单', value: 1},
        {label: '按钮', value: 2},
        {label: '接口', value: 4},
        {label: '其他', value: 5}
      ],
      addOrEdit: 'add',
      itemLoading: false,
      menuLoading: false,
      dytDefaultProps: {
        value: 'id',
        label: 'name',
        disabled: 'isDisabled',
        children: 'childList'
      },
      // expandKeys: {},
      oldExpandKeys: [],
      firstInitTree: {},
      iconfontJson: {},
      tagsJson: {},
      filterText: '',
      filterSysText: '',
      nameTitle: '权限',
      // 表单数据
      formData: {},
      initFormData: {
        permission: '',
        name: '',
        url: '',
        parentId: null,
        icon: '',
        sort: 0,
        enable: 1,
        last: null,
        parentIds: '',
        depth: '',
        type: null,
        description: '',
        systemId: null
      },
      // 表单规则
      formRules: {
        name: [
          { required: true, message: `请输入权限名称`, trigger: 'change' },
          { required: true, message: `请输入权限名称`, trigger: 'blur' }
        ],
        parentId: [
          { required: true, message: `请选择父级权限`, trigger: 'change' }
        ],
        systemId: [
          { required: true, message: '请选择所属系统', trigger: 'change' }
        ],
        enable: [
          { required: true, message: '请选择是否启用', trigger: 'change' }
        ],
        last: [
          { required: true, message: '请选择是否末级', trigger: 'change' }
        ],
        type: [
          { required: true, message: '请选择权限类型', trigger: 'change' }
        ]
      },
      treeData: [{id: -1, name: '全部'}],
      checkTreeData: [],
      systemTreeData: [],
      systemTagsJson: {},
      defaultProps: {
        children: 'childList',
        label: 'name'
      },
      nodekData: {}
    }
  },
  computed: {
    power () {
      return this.$common.getPower({
        save: 'permissionManagement_save',
        remove: 'permissionManagement_remove',
        update: 'permissionManagement_update'
      })
    }
  },
  watch: {
    filterText: {
      deep: true,
      handler (val) {
        this.$refs.itemTree && this.$refs.itemTree.filter(val);
      }
    },
    filterSysText: {
      deep: true,
      handler (val) {
        this.$refs.systemTree && this.$refs.systemTree.filter(val);
      }
    },
    'formData.type': {
      deep: true,
      handler (val, old) {
        if (old === val) return;
        this.formRules['url'] = [];
        this.formRules['permission'] = [];
        if (![1, '1'].includes(val) && this.addOrEdit === 'add') {
          this.formData.last = null;
        }
        if ([1, '1', 4, '4'].includes(val)) {
          this.formRules['url'] = [
            { required: true, message: `请输入${[4, '4'].includes(val) ? '接口' : '菜单'}地址`, trigger: 'change' },
            { required: true, message: `请输入${[4, '4'].includes(val) ? '接口' : '菜单'}地址`, trigger: 'blur' }
          ];
        }
        if (![1, '1'].includes(val)) {
          this.formRules['permission'] = [
            { required: true, validator: this.codeValidate, trigger: 'change' },
            { required: true, validator: this.codeValidate, trigger: 'blur' }
          ];
        }
        this.$nextTick(() => {
          this.handNodekData(this.nodekData, val);
        })
      }
    }
  },
  created() {
    this.initPage();
    this.getSystemTree();
  },
  setup() {
    let expandKeys = reactive({})
    return {
      expandKeys
    }
  },
  // 页面渲染完
  mounted() {},
  // 组件销毁前
  beforeUnmount () {},
  methods: {
    initPage () {
      this.treeData = [{id: -1, name: '全部'}];
      this.checkTreeData = this.treeData;
      this.initData();
    },
    initData () {
      this.addOrEdit = 'add';
      this.formData = this.$common.copy(this.initFormData);
      this.$nextTick(() => {
        this.$refs.itemTree && this.$refs.itemTree.setCurrentKey(null);
        this.$nextTick(() => {
          this.$refs.itemForm && this.$refs.itemForm.clearValidate();
        })
      })
    },
    createNewItem (config = {}) {
      this.addOrEdit = 'add';
      this.$nextTick(() => {
        this.$refs.itemTree && this.$refs.itemTree.setCurrentKey(null);
        if (this.$common.isEmpty(this.formData.parentId)) {
          this.formData = this.$common.copy({...this.initFormData, systemId: this.formData.systemId});
        } else {
          const handFrom = this.$common.copy(this.formData);
          Object.keys(handFrom).forEach(key => {
            if(key === 'systemId') {
              handFrom[key] = this.formData[key] || null;
            } else if (!['parentId', 'id'].includes(key)) {
              handFrom[key] = this.initFormData[key];
            }
          })
          this.formData = handFrom;
        }
      })
    },
    // 保存
    saveItem () {
      this.$refs.itemForm.validate(valid => {
        if (!valid) return;
        this.itemLoading = true;
        let newParams = this.$common.copy(this.formData);
        const parentItem = this.tagsJson[this.formData.parentId];
        newParams.depth = parentItem.depth + 1;
        newParams.parentIds = `${[-1, '-1'].includes(parentItem.id) ? '' : parentItem.parentIds ? `${parentItem.parentIds}.${parentItem.id}` : parentItem.id }`;
        if ([0,'0'].includes(newParams.last) && [1,'1'].includes(newParams.type)) {
          newParams.url = '';
        }
        this.$common.isEmpty(newParams.sort) && (newParams.sort = 0);
        this.$http.post(this.api.permissions[this.$common.isEmpty(newParams.id) ? 'save' : 'update'], newParams, {removeEmpty: false}).then(res => {
          this.itemLoading = false;
          this.getItemTree();
          this.$nextTick(() => {
            this.addOrEdit === 'add' && this.createNewItem({});
          })
          this.$message.success('操作成功！');
        }).catch(() => {
          this.itemLoading = false;
        })
      })
    },
    // 删除
    delItem () {
      this.$confirm(`确认删除权限：${this.formData.name}？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.itemLoading = true;
        this.$http.post(this.api.permissions.remove, {id: this.formData.id}).then(res => {
          this.getItemTree();
          this.$nextTick(() => {
            this.initData();
          })
          this.itemLoading = false;
          this.$message.success('操作成功！');
        }).catch(() => {
          this.itemLoading = false;
        })
      }).catch(() => {})
    },
    // 获取信息
    getItemInfo () {
      this.$http.get(this.api.globalApi.permissions.get, {}).then(res => {})
    },
    // 获取所有树
    getItemTree () {
      if (this.$common.isEmpty(this.formData.systemId)) {
        this.treeData = [{id: -1, name: '全部'}];
        this.checkTreeData = this.treeData;
        this.itemEmptyText = '请选择系统';
        return;
      }
      this.menuLoading = true;
      this.$http.get(this.api.globalApi.permissions.treeList, {
        params: { systemId: this.formData.systemId, type: '' }
      }).then(res => {
        if (res.data) {
          this.filterText = '';
          res.data.name = '全部';
          res.data.parentIds = -1;
          
          !this.firstInitTree[this.formData.systemId] && (this.expandKeys[this.formData.systemId] = this.oldExpandKeys[this.formData.systemId]);
          const hand = (arr = []) => {
            arr.forEach((item, index) => {
              this.tagsJson[item.id] = item;
              if ([3,'3'].includes(item.type)) {
                arr[index] = '';
              }
              if (!this.$common.isEmpty(item.childList)) {
                hand(item.childList)
              }
            })
          }
          hand([res.data]);
          let newData = this.$common.removeEmpty(res.data, true);
          // hand([newData]);
          this.treeData = [newData];
          // 处理禁用
          this.handNodekData({}, this.formData.type);
          // 标记选中
          this.$nextTick(() => {
            const newKeys = Object.keys(this.tagsJson).map(id => Number(id));
            this.firstInitTree[this.formData.systemId] && (this.expandKeys[this.formData.systemId] = newKeys);
            this.oldExpandKeys[this.formData.systemId] = this.$common.copy(newKeys);
            this.firstInitTree[this.formData.systemId] = false;
            if (!this.$common.isEmpty(this.formData.id) && this.$refs.itemTree) {
              this.$refs.itemTree.setCurrentKey(this.formData.id);
            }
          })
        }
        this.itemEmptyText = (!res.data || this.$common.isEmpty(res.data.childList)) ? '暂无数据' : '';
        this.menuLoading = false;
      }).catch((error) => {
        console.error(error);
        this.menuLoading = false;
        this.itemEmptyText = error.msg || '暂无数据'
      })
    },
    // 选中菜单
    nodeClick (data) {
      this.nodekData = data;
      this.addOrEdit = 'edit';
      this.formData = this.$common.copy(data);
      delete this.formData.childList;
      this.$nextTick(() => {
        this.handNodekData(this.nodekData, this.formData.type);
        this.$refs.itemForm && this.$refs.itemForm.clearValidate();
      })
    },
    // 处理禁用数据
    handNodekData (data, val) {
      let newData = this.$common.copy(this.treeData);
      let isClearId = false;
      const hand = (arr) => {
        arr.forEach(item => {
          // 禁用对应选项
          if (data && this.addOrEdit === 'edit' && data.id === item.id) {
            item.isDisabled = true;
          } else if (![-1, '-1'].includes(item.id) && [1, '1'].includes(val) && ([1, '1'].includes(item.last) || ![1, '1'].includes(item.type))) {
            item.isDisabled = true;
            // 判断是否要清空父级数据
            this.addOrEdit === 'add' && this.formData.parentId === item.id && (isClearId = true);
          } else {
            delete item.isDisabled;
          }
          if (item.childList && this.$common.isArray(item.childList)) {
            hand(item.childList);
          }
        })
      }
      hand(newData);
      this.checkTreeData = newData;
      // isClearId && (this.formData.parentId = null);
      if (this.$common.isEmpty(val)) {
        this.formData.parentId = this.formData.id || this.formData.parentId || null;
      } else if (isClearId) {
        this.formData.parentId = null;
      }
      // 当是新增时，移除ID
      this.addOrEdit === 'add' && (this.formData.id = '');
      this.$nextTick(() => {
        this.$refs.itemForm && this.$refs.itemForm.clearValidate();
      })
    },
    // 搜索
    filterNode (value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
    // 选中系统
    getSystemTreeData (data) {
      this.formData.parentId = null;
      typeof this.firstInitTree[data.id] === 'undefined' && (this.firstInitTree[data.id] = true);
      this.formData.systemId = data.id;
      this.createNewItem({});
      this.$nextTick(() => {
        this.$refs.itemForm && this.$refs.itemForm.clearValidate();
      })
      this.getItemTree();
    },
    // 系统改变时
    getSysTreeData (treeId) {
      this.formData.parentId = null;
      this.$refs.systemTree && this.$refs.systemTree.setCurrentKey(treeId);
      if (typeof treeId !== 'undefined') {
        typeof this.firstInitTree[treeId] === 'undefined' && (this.firstInitTree[treeId] = true);
      }
      if (this.addOrEdit === 'add') {
        this.$refs.itemTree && this.$refs.itemTree.setCurrentKey(null);
      }
      this.$nextTick(() => {
        if (typeof treeId !== 'undefined') {
          this.$refs.itemForm && this.$refs.itemForm.clearValidate();
        }
      })
      // 根据系统ID获取对应
      this.getItemTree();
    },
    // 获取所有系统树
    getSystemTree () {
      this.itemLoading = true;
      this.$http.get(this.api.globalApi.systemApi.treeList, {params: {}}).then(res => {
        if (res.data) {
          res.data.name = '全部';
          res.data.parentIds = -1;
          const hand = (arr = []) => {
            arr.forEach(item => {
              this.systemTagsJson[item.id] = item;
              if (!this.$common.isEmpty(item.childList)) {
                hand(item.childList)
              } else {
                delete item.childList;
              }
            })
          }
          hand([res.data]);
          this.systemTreeData = res.data.childList;
        }
        this.itemLoading = false;
      }).catch(() => {
        this.itemLoading = false;
      })
    },
    // 校验权限代码
    codeValidate (rule, value, callback) {
      if (this.$common.isEmpty(value)) return callback(new Error('请输入权限代码'));
      if (!/^[^\u4e00-\u9fa5]*$/.test(value) || value.includes(' ')) return callback(new Error(`不可输入${value.includes(' ') ? '空格' : '中文'}`));
      if (value.length < 6) return callback(new Error('长度最少6位'));
      callback();
    },
    // 展开时
    nodeExpand (data, node, el) {
      !this.oldExpandKeys[this.formData.systemId].includes(data.id) && this.oldExpandKeys[this.formData.systemId].push(data.id);
    },
    // 收起时
    nodeCollapse (data, node, el) {
      const hand = (nodeData) => {
        if (this.oldExpandKeys[this.formData.systemId].includes(nodeData.id)) {
          this.oldExpandKeys[this.formData.systemId].splice(this.oldExpandKeys[this.formData.systemId].indexOf(nodeData.id), 1);
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
};
</script>
<style lang="scss" scoped>
.management-container{
  height: 100%;
  padding: 0;
  display: flex;
  .item-tree-list{
    min-width: 240px;
    max-width: 350px;
    width: 30%;
    padding: 10px 0;
    background: #fff;
    box-shadow: 1px 0 5px 1px var(--layout-shadow-color);
  }
  .item-tree-head{
    margin-top: 10px;
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
    height: calc(100% - 105px);
    overflow: auto;
  }
  .item-item-head{
    display: flex;
    height: 50px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--layout-border-color);
    // box-shadow: 0 1px 5px 1px var(--layout-shadow-color);
    span {
      &:first-of-type{
        padding-left: 10px;
        font-size: 16px;
        line-height: 40px;
      }
      &:last-of-type{
        flex: 100;
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