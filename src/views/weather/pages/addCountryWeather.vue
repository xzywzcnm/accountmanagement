<template>
  <dyt-dialog
    v-model="dialogVisible"
    title="添加国家"
    top="10vh"
    custom-class="addCountryWeather"
    @close="closeDrawer"
  >
    <div v-loading="pageLoading">
      <dyt-table
        ref="countryWeather"
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
        @filterReset="filterReset"
      >
        <!-- 国家列 -->
        <template v-slot:country-content="{row}">
          <!-- {{row.country}} -->
          <dyt-select
            v-model="row.country"
            :virtual="true"
            :options="countryList"
            placeholder="请选择国家"
            @change="countryValChange(row)"
          />
        </template>
        <!-- 城市列 -->
        <template v-slot:name-content="{row}">
          <dyt-select
            v-model="row.name"
            :virtual="true"
            :disabled="!row.country"
            :placeholder="`${row.country ? '请选择城市' : '请先选择国家再选城市'}`"
            :options="cityJson[row.tableRowId]"
            @change="cityValChange($event, row)"
            @visible-change="cityVisibleChange($event, row)"
          />
        </template>
        <template v-slot:filterBottom>
          <div class="filter-bottom-box">
            <div class="filter-bottom-left">
              <dyt-button
                type="primary"
                icon="plus"
                @click="rowAddEdit"
              >
                添加国家
              </dyt-button>
            </div>
          </div>
        </template>
      </dyt-table>
    </div>
    <template v-slot:footer>
      <div class="foolter-button">
        <dyt-button type="primary" @click="confirm">
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
  countryList: Array<{[key:string]: string|number}>,
  tableData: Array<{[key:string]: any}>,
  cityJson: {[key:string]: Array<{[key:string]: any}>},
  cityCache: Array<{[key:string]: any}>,
  [key:string]: any
}
let initId = Math.random().toString(36).substring(2);
export default defineComponent({
  name: 'addCountryWeather',
  components: {},
  props: {
    visible: { type: Boolean, default: false },
    refresh: { type: Boolean, default: false }
  },
  emits: ['update:visible', 'update:refresh'],
  data():dataType {
    return {
      dialogVisible: false,
      filterFields: [],
      cityJson: {
        [initId]: []
      },
      tableData: [
        { tableRowId: initId, country: '', name: '', isShow: true }
      ],
      filterModel: {},
      filterConfig: {
        showFilter: false
      },
      tableProps: {
        'max-height': '50vh'
      },
      tableColumns: [
        {
          label: '国家', prop: 'country', align: 'center', 'min-width': '100'
        },
        {
          label: '城市', prop: 'name', align: 'center', 'min-width': '100'
        },
        {
          label: '首页展示', prop: 'isShow', align: 'center', 'width': '100',
          render: ({row, $index}:any) => {
            return (<div>
              <el-switch
                model-value={row.isShow}
                onClick={
                  (e:any) => {
                    row.isShow = !row.isShow;
                    this.tableData[$index] = row;
                  }
                }
              />
            </div>)
          }
        },
        {
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
        }
      ],
      tableConfig: {
        autoload: true,
        enableRowSort: false
      },
      paginationConfig: {
        showPagination: false
      },
      contentDataMap: { rows: 'data', total: 'total', errorInfos: 'msg' },
      countryList: [],
      pageLoading: false,
      cityCache: []
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
        this.initPageData();
      }
    }
  },
  computed: {
    power () {
      return {
        delete: true
      }
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
      this.pageLoading = true;
      const allPromise = [
        { getVal: () => this.getCountryData(), key: 'countryList' }
      ];
      this.$common.allSettled(allPromise.map(m => m.getVal)).then(arr => {
        arr.forEach((item, index) => {
          if (item.status === 'fulfilled') {
            this[allPromise[index].key] = item.value as Array<{[key:string]:string|number}>;
          }
        });
        this.pageLoading = false;
      })
    },
    // 列表参数转换
    transformRequestData (requestData: any) {
      let request = this.$common.copy(requestData);
      delete request.pageNum;
      delete request.pageSize;
      return request;
    },
    // 获取列表数据
    requestHandler (requestData:any) {
      return {
        total: this.tableData.length,
        data: this.$common.copy(this.tableData),
        msg: ''
      }
    },
    // 重置
    filterReset () {},
    // 刷新列表
    refreshTable () {},
    // 关闭
    closeDrawer () {
      initId = Math.random().toString(36).substring(2);
      this.dialogVisible = false;
      this.tableData = [{ tableRowId: initId, country: '', name: '', isShow: false }];
      this.cityJson = {[initId]: []};
      this.countryList = [];
      this.$nextTick(() => {
        this.$refs.countryWeather.search();
      })
    },
    // 新增行
    rowAddEdit () {
      const rowId = Math.random().toString(36).substring(2);
      this.cityJson[rowId] = [];
      this.tableData.splice(0, 0, {tableRowId: rowId, country: '', name: '', isShow: true });
      this.$nextTick(() => {
        this.$refs.countryWeather.search();
      })
    },
    // 删除行
    deleteRow (row:{[key:string]:any}) {
      if (this.$common.isEmpty(row.tableRowId)) return;
      if (this.$common.isEmpty(row.country)) {
        this.deleteHand(row);
        return;
      };
      const city = this.getCityJson(row);
      this.$confirm(`确认是否删除：${row.country}-${city.cityName || ''}？`, '操作提示', {
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        closeOnClickModal: false,
        type: 'warning'
      }).then(() => {
        this.deleteHand(row);
      }).catch(() => {})
    },
    // 通过行临时 ID 获取对应城市对象
    getCityJson (obj:{[key:string]: any}):{[key:string]: any} {
      return this.cityJson[obj.tableRowId].filter((f) => f.id === obj.name)[0] || {};
    },
    deleteHand (row:{[key:string]:any}) {
      const allId = this.tableData.map(m => m.tableRowId);
      this.tableData.splice(allId.indexOf(row.tableRowId), 1);
      delete this.cityJson[row.tableRowId];
      this.$nextTick(() => {
        this.$refs.countryWeather.search();
      })
    },
    // 获取国家
    getCountryData () {
      return new Promise((resolve) => {
        this.$http.get(this.api.weatherApi.getCountry, { hiddenError: true }).then(res => {
          resolve((res.data || []).filter((f:any) => !this.$common.isEmpty(f.cnName)).map((m:any) => {
            return {...m, value: m.cnName || '', label: m.cnName || ''}
          }));
        }).catch(() => {
          resolve([]);
        })
      });
    },
    // 获取城市
    getCity (country?:string):Promise<Array<{[key:string]: any}>> {
      return new Promise((resolve) => {
        if (this.$common.isEmpty(country)) return resolve([]);
        if (!this.$common.isEmpty(this.cityCache[country])) return resolve(this.cityCache[country]);
        this.$http.get(this.api.weatherApi.getCountryNotAddCity, { params: {country: country}, hiddenError: true }).then(res => {
          const cityList = (res.data || []).filter((f:any) => !this.$common.isEmpty(f.id)).map((m:any) => {
            return {...m, value: m.id || '', label: m.cityName || '', disabled: false}
          });
          this.cityCache[country] = cityList;
          resolve(cityList);
        }).catch(() => {
          resolve([]);
        })
      });
    },
    // 切换国家
    countryValChange (row:{[key:string]:any}) {
      const allId = this.tableData.map(m => m.tableRowId);
      this.getCity(row.country).then(res => {
        row.name = '';
        this.cityJson[row.tableRowId] = res;
        this.tableData[allId.indexOf(row.tableRowId)] = row;
      });
    },
    // 城市切换
    cityValChange (val:string, row:{[key:string]:any}) {
      const allId = this.tableData.map(m => m.tableRowId);
      this.tableData[allId.indexOf(row.tableRowId)] = row;
    },
    // 城市下拉显示隐藏时
    cityVisibleChange (visible:boolean, row:{[key:string]:any}) {
      if (!visible) return;
      const tableAllName = this.tableData.map((m) => m.name);
      this.cityJson[row.tableRowId] = this.cityJson[row.tableRowId].map((m) => {
        return {
          ...m,
          disabled: row.tableRowId === m.tableRowId ? false : tableAllName.includes(m.id)
        }
      })
    },
    // 保存新增的城市
    confirm () {
      const undoneCountry = this.tableData.filter(f => this.$common.isEmpty(f.country));
      const undoneCity = this.tableData.filter(f => this.$common.isEmpty(f.name)).map(m => m.country).filter(fm => !this.$common.isEmpty(fm));
      const paramsData = this.tableData.filter(f => !this.$common.isEmpty(f.name)).map(m => {
        const city = this.getCityJson(m);
        return {
          country: m.country,
          cityId: m.name,
          isShow: m.isShow ? '1' : '0',
          lat: city.lat,
          lon: city.lon,
          countrySortNo: null
        }
      });
      if (undoneCountry.length > 0 || undoneCity.length > 0) {
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
      this.$http.post(`${this.api.weatherApi.addCity}?type=country`, paramsData).then((res) => {
        this.$message.success('保存成功！');
        this.$nextTick(() => {
          this.$emit('update:refresh', true);
          this.closeDrawer();
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
