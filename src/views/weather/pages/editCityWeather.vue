<template>
  <dyt-dialog
    v-model="dialogVisible"
    :title="country"
    top="10vh"
    width="800px"
    custom-class="editWeather"
    @close="closeDrawer"
  >
    <div v-loading="pageLoading" style="min-height: 300px;">
      <dyt-table
        v-if="!showTable"
        ref="cityWeather"
        :filter-fields="filterFields"
        :filter-model="filterModel"
        :table-columns="tableColumns"
        :table-config="tableConfig"
        :table-props="tableProps"
        :pagination-config="paginationConfig"
        :filter-config="filterConfig"
        :content-data-map="contentDataMap"
        :request-handler="requestHandler"
        :request-before="transformRequestData"
        @tableRowSortEnd ="updateCitySort"
        @filterReset="filterReset"
      >
        <!-- 城市列 -->
        <template v-slot:name-content="{row}">
          <dyt-select
            v-if="isCityEdit"
            v-model="row.id"
            :virtual="true"
            placeholder="请选择城市"
            :options="cityJson[row.tableRowId]"
            @change="cityValChange($event, row)"
            @visible-change="cityVisibleChange($event, row)"
          />
          <span v-else>{{row.cityName || ''}}</span>
        </template>
        <template v-slot:filterBottom>
          <div class="filter-bottom-box">
            <div class="filter-bottom-left">
              <dyt-button
                v-if="isCityEdit"
                type="primary"
                icon="plus"
                :disabled="pageLoading"
                @click="rowAddEdit"
              >
                添加城市
              </dyt-button>
            </div>
            <div class="filter-bottom-rigth">
              <dyt-button
                type="primary"
                icon="Refresh"
                :disabled="pageLoading"
                @click="refreshTable"
              >
                刷新列表
              </dyt-button>
            </div>
          </div>
        </template>
      </dyt-table>
    </div>
    <template v-slot:footer v-if="isCityEdit">
      <div class="foolter-button">
        <dyt-button :disabled="pageLoading" type="primary" @click="confirm">
          保存
        </dyt-button>
        <dyt-button @click="closeDrawer">
          取消
        </dyt-button>
      </div>
    </template>
  </dyt-dialog>
</template>
<script lang="tsx">
import { defineComponent } from 'vue';
interface dataType{
  tableData: Array<{[key:string]: any}>,
  cityJson: {[key:string]: Array<{[key:string]: any}>},
  cityDataList: Array<{[key:string]: any}>,
  discardRow: Array<{[key:string]: any}>,
  [key:string]: any
}
export default defineComponent({
  name: 'editWeather',
  components: {},
  props: {
    visible: { type: Boolean, default: false },
    cityEdit: { type: Boolean, default: true },
    moduleData: { type: Object, default: () => {return {}}}
  },
  emits: ['update:visible'],
  data():dataType {
    return {
      dialogVisible: false,
      isUpdateTable: true,
      filterFields: [],
      cityJson: {},
      cityDataList: [],
      tableData: [],
      oldTableData: [],
      discardRow: [],
      filterModel: {},
      filterConfig: {
        showFilter: false
      },
      tableProps: {
        'max-height': '50vh'
      },
      tableColumns: [
        {
          label: '排序', prop: '$tableRowIndex', align: 'center', 'width': '70'
        },
        {
          label: '城市', prop: 'name', align: 'center', 'min-width': '100'
        },
        {
          label: '首页展示', prop: 'show', align: 'center', 'width': '100',
          render: ({row, $index}:any) => {
            return (<div>
              <el-switch
                model-value={this.$common.isBoolean(row.show) ? row.show : [1, '1'].includes(row.show)}
                disabled={!this.isCityEdit}
                loading={row.showLoading}
                onClick={
                  (e:any) => {
                    if (!this.isCityEdit) return;
                    row.showLoading = true;
                    const status = this.$common.isBoolean(row.show) ? !row.show : ![1, '1'].includes(row.show);
                    row.show = status;
                    this.tableData[$index].show = status;
                    this.$nextTick(() => {
                      row.showLoading = false;
                    });
                  }
                }
              />
            </div>)
          }
        }
      ],
      tableConfig: {
        // autoload: true,
        enableRowSort: true
      },
      paginationConfig: {
        showPagination: false
      },
      contentDataMap: { rows: 'data', total: 'total', errorInfos: 'msg' },
      showTable: true,
      pageLoading: true
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
        if (!val) return;
        setTimeout(() => {
          this.initPageData();
        }, 200);
      }
    }
  },
  computed: {
    power () {
      return {
        delete: true
      }
    },
    country () {
      return this.moduleData.countryName || ''
    },
    countrySortNo () {
      return this.moduleData.countrySortNo || null;
    },
    isCityEdit () {
      return this.cityEdit;
    }
  },
  created() {},
  // 页面渲染完
  mounted() {},
  // 组件销毁前
  beforeUnmount () {},
  methods: {
    // 初始化弹窗数据
    initPageData () {
      // 设置是否能拖拽
      this.tableConfig = {
        enableRowSort: this.isCityEdit
      }
      // 操作列初始化
      this.isCityEdit && this.tableColumns.push({
        label: '操作', align: 'center', fixed: 'right', 'width': '100',
        render: ({row}:any) => {
          return (<dyt-button
            disabled={!this.power.delete}
            onClick={
              (e:any) => {
                this.deleteRow(row);
              }
            }
            size="small"
            type="danger"
          >
            删除
          </dyt-button>)
        }
      });
      // 初始化数据获取
      const allPromise = [
        { getVal: () => this.getAllCity(this.country), key: 'cityDataList' }
      ];
      this.$common.allSettled(allPromise.map(m => m.getVal)).then(arr => {
        arr.forEach((item, index) => {
          if (item.status === 'fulfilled') {
            this[allPromise[index].key] = item.value as Array<{[key:string]:string|number}>;
          }
        });
        this.pageLoading = false;
        this.showTable = false;
        this.$nextTick(() => {
          this.$refs.cityWeather.search();
        })
      }).catch(() => {
        this.pageLoading = false;
        this.showTable = false;
      })
    },
    // 列表参数转换
    transformRequestData (requestData: any) {
      let request = this.$common.copy(requestData);
      request.country = this.country;
      delete request.pageNum;
      delete request.pageSize;
      return request;
    },
    // 获取列表数据
    requestHandler (requestData:any) {
      if (!this.isUpdateTable) {
        return {
          total: this.tableData.length,
          data: this.$common.copy(this.tableData),
          msg: ''
        }
      }
      return new Promise((resolve) => {
        this.isUpdateTable = false;
        this.$http.get(this.api.weatherApi.getCountryListDetail, { params: requestData }).then(res => {
          if (res.data) {
            let allCity:Array<string> = [];
            this.tableData = res.data.map((m:any) => {
              allCity.push(m.id);
              return {...m, isAdd: false, showLoading: false, tableRowId: Math.random().toString(36).substring(2) }
            });
            this.tableData.forEach(item => {
              this.cityJson[item.tableRowId] = this.cityRowOption(allCity, item);
            });
            this.oldTableData = this.$common.copy(this.tableData);
            resolve({
              total: this.tableData.length,
              data: this.$common.copy(this.tableData),
              msg: ''
            })
          }
        }).catch((err) => {
          resolve({ total: 0, data: [], msg: err.msg || '查询出错' });
        })
      })
    },
    cityRowOption (allCity:Array<string>, item:any) {
      return this.cityDataList.map((m:any) => {
        return {
          ...m,
          disabled: allCity.includes(m.value) && item.id !== m.value ? true : false
        }
      })
    },
    // 重置
    filterReset () {},
    // 刷新列表
    refreshTable () {
      this.isUpdateTable = true;
      this.$nextTick(() => {
        this.$refs.cityWeather.search();
      })
    },
    // 关闭
    closeDrawer () {
      this.dialogVisible = false;
      this.tableData = [];
      this.cityJson = {};
      this.isUpdateTable = true;
      this.pageLoading = true;
      this.showTable = true;
      this.discardRow = [];
      this.$nextTick(() => {
        this.tableColumns.length >= 4 && this.tableColumns.splice(this.tableColumns.length - 1, 1);
      })
    },
    // 新增行
    rowAddEdit () {
      const rowId = Math.random().toString(36).substring(2);
      this.cityJson[rowId] = this.cityRowOption(this.tableData.map(m => m.id), {});
      const addRow = {
        tableRowId: rowId,
        showLoading: false,
        country: this.country,
        countrySortNo: this.countrySortNo,
        isAdd: true,
        cityName: '', // 实际是城市 ID
        id: '',
        lat: '',
        lon: '',
        show: true
      }
      this.tableData.push(addRow);
      // this.tableData.splice(0, 0, addRow);
      this.$nextTick(() => {
        this.$refs.cityWeather.search();
      })
    },
    // 删除行
    deleteRow (row:{[key:string]:any}) {
      if (this.$common.isEmpty(row.tableRowId)) return;
      if (row.isAdd) {
        this.deleteHand(row);
        return;
      }
      this.$confirm(`确认是否删除：${row.cityName}？`, '操作提示', {
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        closeOnClickModal: false,
        type: 'warning'
      }).then(() => {
        this.deleteData({ msg: row.id, type: 'city' }).then(res => {
          res && this.deleteHand(row);
        })
      }).catch(() => {})
    },
    // 发起删除请求
    deleteData (params: {[key:string]: any}):Promise<boolean> {
      return new Promise((resolve) => {
        if (this.$common.isEmpty(params.msg)) return resolve(true);
        this.$http.get(this.api.weatherApi.delete, {
          params: params
        }).then(() => {
          resolve(true);
        }).catch(() => {
          resolve(false);
        })
      })
    },
    // 数据删除后处理视图
    deleteHand (row:{[key:string]:any}) {
      const allId = this.tableData.map(m => m.tableRowId);
      this.tableData.splice(allId.indexOf(row.tableRowId), 1);
      delete this.cityJson[row.tableRowId];
      this.$nextTick(() => {
        this.$refs.cityWeather.search();
      })
    },
    // 获取城市
    getAllCity (country?:string) {
      return new Promise((resolve) => {
        if (this.$common.isEmpty(country)) return resolve([]);
        this.$http.get(this.api.weatherApi.getCountryCity, { params: {country: country}, hiddenError: true }).then(res => {
          resolve((res.data || []).filter((f:any) => !this.$common.isEmpty(f.id)).map((m:any) => {
            return {...m, value: m.id || '', label: m.cityName || '', disabled: false}
          }));
        }).catch(() => {
          resolve([]);
        })
      });
    },
    // 城市切换
    cityValChange (val:string, row:{[key:string]:any}) {
      const allId = this.tableData.map(m => m.tableRowId);
      const checkCity = this.cityJson[row.tableRowId].filter(f => val === f.id)[0] || {};
      const discardCityId = this.discardRow.map(m => m.id);
      const oldRow = this.tableData[allId.indexOf(row.tableRowId)];
      // 如果切换其他城市后再次切换回来时，移除删除数组中对应的数据, 并且设置当前行为非新增
      if (discardCityId.includes(row.id)) {
        this.discardRow.splice(discardCityId.indexOf(row.id), 1);
        row.isAdd = false;
        !oldRow.isAdd && this.discardRow.push(oldRow);
      } else if (!row.isAdd) {
        // 非新增数据，切换到其他城市后，添加到删除数组中, 并且设置当前行为新增
        this.discardRow.push(oldRow);
        row.isAdd = true;
      }
      const newRow = {
        ...row,
        cityName: checkCity.cityName, // 实际是城市 ID
        lat: checkCity.lat,
        lon: checkCity.lon
      }
      this.tableData[allId.indexOf(row.tableRowId)] = newRow;
      row = this.$common.copy(newRow);
    },
    // 城市下拉显示隐藏时
    cityVisibleChange (visible:boolean, row:{[key:string]:any}) {
      if (!visible) return;
      const tableAllName = this.tableData.map((m) => m.id);
      this.cityJson[row.tableRowId] = this.cityJson[row.tableRowId].map(m => {
        return {
          ...m,
          disabled: row.tableRowId === m.tableRowId ? false : tableAllName.includes(m.value)
        }
      })
    },
    // 保存城市
    confirm () {
      const saveData = this.tableData.filter(f => !this.$common.isEmpty(f.id));
      const undoneCity = this.tableData.filter(f => this.$common.isEmpty(f.id));
      const paramsData = saveData.map((m, index) => {
        const city = this.cityDataList.filter(f => m.id === f.id)[0] || {};
        return {
          country: this.country,
          countrySortNo: this.countrySortNo,
          cityId: m.id,
          isShow: typeof m.show === 'boolean' ? m.show ? '1' : '0' : m.show,
          lat: city.lat,
          sortNo: index,
          lon: city.lon
        }
      });
      if (undoneCity.length > 0) {
        this.$confirm(`存在信息填写不完整，不完整部分将无法保存，是否继续保存操作？`, '操作提示', {
          cancelButtonText: '取消',
          confirmButtonText: '确定',
          closeOnClickModal: false,
          type: 'warning'
        }).then(() => {
          if(paramsData.length === 0) {
            this.closeDrawer();
            return;
          }
          this.saveData(paramsData);
        }).catch(() => {})
        return;
      }
      this.saveData(paramsData);
    },
    saveData (paramsData:Array<any>) {
      this.pageLoading = true;
      this.deleteData({ msg: this.discardRow.map(m => m.id).join(','), type: 'city' }).then(res => {
        if (res) {
          this.$http.post(this.api.weatherApi.addCity, paramsData).then((res) => {
            this.$message.success('保存成功！');
            this.pageLoading = false;
            this.$nextTick(() => {
              this.closeDrawer();
            })
          }).catch(() => {
            this.pageLoading = false;
          })
        } else {
          this.pageLoading = false;
        }
      })
    },
    // 表格行拖动回调
    updateCitySort (reslove:{data: Array<{[key:string]:any}>, oldData: Array<{[key:string]:any}>}) {
      this.isDrg = true;
      const params = reslove.data.filter(f => !this.$common.isEmpty(f.id)).map((m, index) => {
        return { cityId: m.id, sortNo: index.toString() }
      });
      const oldParams = reslove.oldData.filter(f => !this.$common.isEmpty(f.id)).map(m => m.id);
      // 判断拖动前和拖动后排序是否一致
      let different = false;
      params.forEach((item, index) => {
        if (oldParams[index] !== item.cityId && !different) {
          different = true;
        }
      });
      if (!different) {
        this.tableData = reslove.data;
        return;
      }
      this.citySortSave(params).then(res => {
        this.tableData = res ? reslove.data : reslove.oldData;
        if (res) return;
        this.$nextTick(() => {
          this.$refs.cityWeather.search();
        })
      });
    },
    // 排序保存
    citySortSave (params:{[key:string]:any}, other:{[key:string]:any} = {}):Promise<boolean> {
      return new Promise((reslove) => {
        this.$http.post(this.api.weatherApi.updateCitySortNo, params, other).then(() => {
          reslove(true);
        }).catch(() => {
          reslove(false);
        })
      })
    }
  }
});
</script>
<style lang="less" scoped>
.filter-bottom-content{
  .filter-bottom-box{
    display: flex;
  }
  .filter-bottom-left{
    flex: 50;
  }
  .filter-bottom-right{
    flex: 50;
  }
}
</style>
