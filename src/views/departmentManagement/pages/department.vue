<template>
  <div
    v-loading="itemLoading"
    class="department-container"
    element-loading-text="数据加载中..."
  >
    <div
      v-loading="departLoading"
      class="item-tree-list"
      element-loading-text="数据加载中..."
    >
      <div class="item-tree-head">
        <div style="display: flex; justify-content: space-between;">
          <dyt-button
            v-if="power.save"
            type="primary"
            style="margin-bottom: 15px;"
            @click="createNewItem"
          >
            新建部门
          </dyt-button>
          <dyt-button
            type="primary"
            style="margin-bottom: 15px;"
            @click="initAndRefreshData"
          >
            刷新部门树
          </dyt-button>
        </div>
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
        <span>{{ `${addOrEdit === 'add' ? '新建' : '编辑'}部门` }}</span>
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
        label-width="110px"
        class="demo-itemForm"
        :disabled="!power.save || (!power.update && addOrEdit === 'edit')"
        @submit.prevent
      >
        <el-form-item
          label="部门名称："
          prop="name"
        >
          <dyt-input
            v-model="formData.name"
            :clearable="true"
            placeholder="请输入部门名称"
          />
        </el-form-item>
        <el-form-item
          label="上级部门："
          prop="parentId"
        >
          <!-- :default-expand-level="1" -->
          <!-- :disabled="!(addOrEdit === 'add') || !power.save" -->
          <dytTreeSelect
            v-model="formData.parentId"
            :multiple="false"
            :defaultProps="dytDefaultProps"
            :options="checkTreeData"
            placeholder="请选择部门"
          />
        </el-form-item>
        <el-form-item
          label="是否事业部："
          prop="isBusinessDept"
        >
          <el-radio-group v-model="formData.isBusinessDept">
            <el-radio :label="1">
              是
            </el-radio>
            <el-radio :label="0">
              否
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label="事业部："
          prop="businessDeptId"
          v-if="[1, '1'].includes(formData.isBusinessDept)"
        >
          <dyt-select
            v-model="formData.businessDeptId"
            :multiple="false"
            placeholder="请选择事业部"
          >
            <!-- :disabled="[0, '0'].includes(item.enable)" -->
            <el-option
              v-for="(item, index) in businessDeptList"
              :key="`business-${index}`"
              :label="item.label"
              :value="item.value"
            >
              {{ item.label }}
              <span style="color:#f20;">{{`${[0, '0'].includes(item.enable) ? '(已停用)' : ''}`}}</span>
            </el-option>
          </dyt-select>
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
              @click="saveDepart"
            >
              保存
            </dyt-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DepartManagement',
  components: {},
  props: {},
  data() {
    return {
      addOrEdit: 'add',
      itemLoading: false,
      departLoading: false,
      iconfontJson: {},
      departmentJson: {},
      filterText: '',
      expandKeys: [],
      oldExpandKeys: [],
      dytDefaultProps: {
        value: 'id',
        label: 'name',
        disabled: 'isDisabled',
        children: 'childList'
      },
      firstInitTree: true,
      // 表单数据
      formData: {},
      initFormData: {
        id: '',
        name: '',
        businessDeptId: '',
        parentId: null,
        sort: 0,
        parentIds: '',
        depth: null,
        enable: 1,
        isBusinessDept: 0
      },
      // 表单规则
      formRules: {
        name: [
          { required: true, message: '请输入部门名称', trigger: 'change' },
          { required: true, message: '请输入部门名称', trigger: 'blur' }
        ],
        parentId: [
          { required: true, message: '请选择上级部门', trigger: 'change' }
        ],
        enable: [
          { required: true, message: '请选择是否启用', trigger: 'change' }
        ],
        isBusinessDept: [
          { required: true, message: '请选择是否事业部', trigger: 'change' }
        ],
        businessDeptId: [
          { required: true, message: '请选择事业部', trigger: 'change' }
        ]
      },
      businessDeptList: [],
      treeData: [],
      checkTreeData: [{id: -1, parentIds: -1, name: '全部'}],
      defaultProps: {
        children: 'childList',
        label: 'name'
      }
    }
  },
  computed: {
    power () {
      return this.$common.getPower({
        save: 'departmentManagement_save',
        remove: 'departmentManagement_remove',
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
    this.initAndRefreshData(true);
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
        this.$nextTick(() => {
          this.$refs.itemForm && this.$refs.itemForm.clearValidate();
        })
      })
    },
    initAndRefreshData(isInitPage) {
      const allPromise = [
        { getVal: () => this.getItemTree(), key: '' },
        { getVal: () => this.getBusinessDept(), key: 'businessDeptList', default: []}
      ];
      allPromise.forEach(item => {
        if (!this.$common.isEmpty(item['key']) && typeof item['default'] !== 'undefined') {
          this[item['key']] = () => {
            return item['default']
          }
        }
      });
      this.$common.allSettled(allPromise.map(m => m.getVal)).then(resArr => {
        resArr.forEach((item, index) => {
          if (item.status === 'fulfilled' && !this.$common.isEmpty(allPromise[index]['key'])) {
            this[allPromise[index]['key']] = item.value;
          }
        });
        typeof isInitPage === 'boolean' && isInitPage && this.initPage();
      });
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
        this.$nextTick(() => {
          this.$refs.itemForm && this.$refs.itemForm.clearValidate();
        })
      })
    },
    // 获取单个部门信息
    getItemInfo () {
      this.$http.get(this.api.globalApi.department.get, {}).then(res => {})
    },
    // 获取所有部门树
    getItemTree () {
      return new Promise((resolve) => {
        this.itemLoading = true;
        this.departLoading = true;
        this.$http.get(this.api.globalApi.department.deptSelect, {params: {}, hiddenError: true }).then(res => {
          if (res.data) {
            // res.data.id = '';
            res.data.name = '全部';
            res.data.parentIds = -1;
            !this.firstInitTree && (this.expandKeys = this.oldExpandKeys);
            const hand = (arr = []) => {
              arr.forEach(item => {
                this.departmentJson[item.id] = item;
                if (!this.$common.isEmpty(item.childList)) {
                  hand(item.childList);
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
              this.firstInitTree && (this.expandKeys = Object.keys(this.departmentJson).map(id => Number(id)));
              this.oldExpandKeys = this.$common.copy(this.expandKeys);
              this.firstInitTree = false;
              if (!this.$common.isEmpty(this.formData.id) && this.$refs.itemTree) {
                this.$refs.itemTree.setCurrentKey(this.formData.id);
              }
            })
          }
          this.itemLoading = false;
          this.departLoading = false;
          resolve([res.data]);
        }).catch(() => {
          this.itemLoading = false;
          this.departLoading = false;
          resolve([]);
        })
      })
    },
    // 获取事业部
    getBusinessDept () {
      return new Promise((resolve) => {
        this.$http.get(this.api.globalApi.division.list, { params: {}, hiddenError: true }).then(res => {
          if (res.data) {
            const businessList = (res.data ? res.data.map((item) => {
              // return { ...item, value: item.id.toString(), label: item.name }
              return { ...item, value: item.id, label: item.name }
            }) :[]);
            resolve(businessList);
          } else {
            resolve([]);
          }
        }).catch(() => {
          resolve([]);
        })
      })
    },
    // 树节点被点击
    nodeClick (data) {
      this.addOrEdit = 'edit';
      this.formData = this.$common.copy(data);
      delete this.formData.childList;
      let newData = this.$common.copy(this.treeData);
      const hand = (arr) => {
        arr.forEach(item => {
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
        this.$nextTick(() => {
          this.$refs.itemForm && this.$refs.itemForm.clearValidate();
        })
      })
      // this.formData = this.$common.copy(this.initFormData);
    },
    // 搜索
    filterNode (value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
    // 保存
    saveDepart () {
      this.$refs.itemForm.validate(valid => {
        if (!valid) return;
        const newParams = ['edit'].includes(this.addOrEdit) ? this.handDepartData() : this.handDepartData()[0] || {};
        // console.log(newParams);
        this.$http.post(this.api.department[['edit'].includes(this.addOrEdit) ? 'updateList' : 'save'], newParams, {removeEmpty: false}).then(res => {
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
    // 处理参数
    handDepartData () {
      let newParams = this.$common.copy(this.formData);
      let updateDepart = [];
      const parentItem = this.departmentJson[this.formData.parentId];
      const currentItem = this.departmentJson[this.formData.id];
      newParams.depth = parentItem.depth + 1;
      if ([0, '0'].includes(newParams.isBusinessDept)) {
        newParams.businessDeptId = null;
      }
      newParams.parentIds = `${[-1, '-1'].includes(parentItem.id) ? '' : parentItem.parentIds ? `${parentItem.parentIds}.${parentItem.id}` : parentItem.id }`;
      this.$common.isEmpty(this.formData.id) && delete newParams.id;
      this.$common.isEmpty(newParams.sort) && (newParams.sort = 0);
      updateDepart.push(newParams);
      const parentIds = this.$common.isEmpty(parentItem.parentIds) ? parentItem.id.toString() : `${parentItem.parentIds}.${parentItem.id}`;
      if (this.$common.isEmpty(this.formData.id) || parentIds === currentItem.parentIds) return updateDepart;
      const hand = (arr, pItem) => {
        arr.forEach(item => {
          let newItem = this.$common.copy(item);
          delete newItem.childList;
          newItem.depth = pItem.depth + 1;
          newItem.parentIds = `${[-1, '-1'].includes(pItem.id) ? '' : pItem.parentIds ? `${pItem.parentIds}.${pItem.id}` : pItem.id }`;
          if ([0, '0'].includes(newItem.isBusinessDept)) {
            newItem.businessDeptId = null;
          }
          this.$common.isEmpty(newItem.sort) && (newItem.sort = 0);
          updateDepart.push(newItem);
          !this.$common.isEmpty(item.childList) && hand(item.childList, newItem);
        })
      }
      !this.$common.isEmpty(currentItem.childList) && hand(currentItem.childList, newParams);
      return updateDepart;
    },
    // 删除部门
    delItem () {
      this.$confirm(`确认删除部门：${this.formData.name}？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.itemLoading = true;
        this.$http.post(this.api.department.remove, {id: this.formData.id}).then(res => {
          this.initAndRefreshData(true);
          this.itemLoading = false;
          this.$message.success('操作成功！');
        }).catch(() => {
          this.itemLoading = false;
        })
      }).catch(() => {})
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
.department-container{
  height: 100%;
  padding: 0;
  display: flex;
  .item-tree-list{
    width: 400px;
    padding: 10px 0;
    background: #fff;
    box-shadow: 1px 0 5px 1px var(--layout-shadow-color);
  }
  .item-tree-head{
    padding: 0 10px;
  }
  .item-item-info{
    position: relative;
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
    height: calc(100% - 100px);
    min-width: 300px;
    max-width: 700px;
    overflow-y: auto;
    overflow-x: hidden;
  }
}
</style>