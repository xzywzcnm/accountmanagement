<template>
  <div class="weather-manage-list">
    <dyt-table
      v-if="tableVisible"
      ref="weatherList"
      :filter-fields="filterFields"
      :filter-model="filterModel"
      :table-columns="tableColumns"
      :table-config="tableConfig"
      :pagination-config="paginationConfig"
      :content-data-map="contentDataMap"
      :request-handler="requestHandler"
      :request-before="transformRequestData"
      @tableRowSortEnd ="updateCountrySort"
      @filterReset="filterReset"
    >
      <template v-slot:filterBottom>
        <div class="filter-bottom-box">
          <div class="filter-bottom-left">
            <dyt-button
              v-if="power.add"
              type="primary"
              icon="plus"
              @click="rowAddEdit({})"
            >
              添加
            </dyt-button>
          </div>
        </div>
      </template>
    </dyt-table>
    <!-- 新增 -->
    <addCountryWeather
      ref="cityWeatherList"
      v-model:visible="addCountryVisible"
      v-model:refresh="refresh"
    />
    <!-- 编辑 -->
    <editCityWeather
      ref="editCityWeather"
      v-model:visible="editCityVisible"
      :module-data="rowAddEditInfo"
      :city-edit="isCityEdit"
    />
  </div>
</template>
<script lang="tsx">
import { defineComponent } from 'vue';
import addCountryWeather from './addCountryWeather.vue';
import editCityWeather from './editCityWeather.vue';

interface dataType{
  isCityEdit: boolean,
  [key:string]: any
}

export default defineComponent({
  name: 'weatherManage',
  components: { addCountryWeather, editCityWeather },
  props: {},
  data():dataType {
    return {
      filterFields: [
        {
          type: 'select',
          model: 'country',
          label: '国家',
          placeholder: '请选择国家',
          style: {
            width: '300px'
          },
          options: () => {
            // 获取国家
            return new Promise((resolve) => {
              this.$http.get(this.api.weatherApi.getCountry, { hiddenError: true }).then(res => {
                // resolve((res.data || []).filter((f:any) => !this.$common.isEmpty(f.mainCountryCode)).map((m:any) => {
                resolve((res.data || []).filter((f:any) => !this.$common.isEmpty(f.cnName)).map((m:any) => {
                  return {...m, value: m.cnName || '', label: m.cnName || ''}
                }));
              }).catch(() => {
                resolve([]);
              })
            })
          },
          componentProps: {
            // multiple: true,
            // 'multiple-limit': 1
          }
        }
      ],
      filterModel: {},
      tableColumns: [
        {
          label: '排序', prop: '$tableRowIndex', align: 'center', 'width': '70'
        },
        {label: '国家', prop: 'countryName', align: 'center', 'min-width': '200'},
        {
          label: '首页展示', prop: 'show', align: 'center', 'width': '100',
          render: ({row, $index}:any) => {
            // <span style="margin-right: 5px;">{[1, '1'].includes(row.show) ? '是' : '否'}</span>
            // style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
            return (<div>
              <el-switch
                loading={row.showLoading}
                disabled={!this.power .enable}
                model-value={[1, '1'].includes(row.show)}
                onClick={
                  (e:any) => {
                    this.beforeChange($index, row);
                  }
                }
              />
            </div>)
          }
        },
        {label: '最后更新时间', prop: 'lastUpdateTime', align: 'center', 'width': '200'},
        {
          label: '操作',
          width: 180,
          fixed: 'right',
          align: 'center',
          render: ({row}:any) => {
            return (<div>
              <dyt-button
                disabled={!this.power.edit}
                onClick={
                  (e:any) => {
                    this.isCityEdit = true;
                    this.rowAddEdit(row);
                  }
                }
                size="small"
                type="primary"
              >
                编辑城市
              </dyt-button>
              <dyt-button
                onClick={
                  (e:any) => {
                    this.isCityEdit = false;
                    this.rowAddEdit(row);
                  }
                }
                size="small"
                type="primary"
              >
                查看
              </dyt-button>
              <dyt-button
                disabled={!this.power.delete}
                onClick={
                  (e:any) => {
                    this.deleteCountry(row)
                  }
                }
                size="small"
                type="danger"
              >
                删除
              </dyt-button>
            </div>)
          },
        }
      ],
      rowAddEditInfo: {},
      addCountryVisible: false,
      editCityVisible: false,
      refresh: false,
      isDrg: false,
      tableConfig: {
        // indexMethod: true,
        enableRowSort: true
      },
      tableData: [],
      paginationConfig: {
        showPagination: false
      },
      contentDataMap: { rows: 'data', total: 'total', errorInfos: 'msg' },
      countryList: [],
      isCityEdit: true,
      tableVisible: false
    }
  },
  watch: {
    addCountryVisible: {
      deep: true,
      handler (val:boolean) {
        if (!val && this.refresh) {
          this.$refs.weatherList.search();
          this.refresh = false;
        }
      }
    }
  },
  computed: {
    // 权限
    power () {
      return this.$common.getPower({
        add: 'publicMun_weatherManage_addCountry',
        edit: 'publicMun_weatherManage_editCity',
        enable: 'publicMun_weatherManage_enable',
        delete: 'publicMun_weatherManage_deleteCountry',
        sort: 'publicMun_weatherManage_countrySort'
      }) as {[key:string]:boolean};
    }
  },
  created() {
    this.initPage();    
  },
  methods: {
    initPage () {
      // 表格设置
      this.tableConfig = {
        // indexMethod: true,
        enableRowSort: this.power.sort
      }
      // 显示列表
      this.tableVisible = true;
    },
    // 参数转换
    transformRequestData (requestData:any) {
      let request = this.$common.copy(requestData);
      delete request.pageNum;
      delete request.pageSize;
      return request;
    },
    // 请求数据
    requestHandler (requestData:any) {
      if (this.isDrg) {
        this.isDrg = false;
        return {
          total: this.tableData.length,
          data: this.tableData,
          msg: ''
        };
      }
      return new Promise((resolve) => {
        this.$http.get(this.api.weatherApi.getCountryAdminList, { params: requestData, removeEmpty: false }).then(res => {
          this.tableData = (res.data || []);
          resolve({
            total: this.tableData.length,
            data: this.tableData.map((m:any) => {
              return {
                ...m,
                showLoading: false
              }
            }),
            msg: ''
          })
        }).catch(err => {
          this.tableData = [];
          resolve({
            total: 0,
            data: [],
            msg: err.msg
          })
        })
      })
    },
    // 重置搜索栏
    filterReset () {},
    // 添加(编辑)天气
    rowAddEdit (row:{[key:string]:any}) {
      this.rowAddEditInfo = row;
      this.$nextTick(() => {
        if (this.$common.isEmpty(row)) {
          this.addCountryVisible = true;
          return;
        }
        this.editCityVisible = true;
      });
    },
    // 删除国家
    deleteCountry (row:{[key:string]:any}) {
      if (this.isDrg) {
        this.$message.error('排序保存中，请稍等...')
        return;
      }
      if (this.$common.isEmpty(row.countryName)) return;
      this.$confirm(`确认是否删除：${row.countryName}？`, '操作提示', {
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        closeOnClickModal: false,
        type: 'warning'
      }).then(() => {
        this.isDrg = true;
        this.$http.get(this.api.weatherApi.delete, {
          params: { msg: row.countryName, type: 'country' }
        }).then(res => {
          this.$message.success('操作成功！');
          this.tableData = this.tableData.filter((f:any) => f.countryName !== row.countryName);
          this.$nextTick(() => {
            this.$refs.weatherList.search();
          })
        })
      }).catch(() => {})
    },
    // 修改国家排序
    updateCountrySort (reslove:{data: Array<{[key:string]:any}>, oldData: Array<{[key:string]:any}>}) {
      this.isDrg = true;
      const params = reslove.data.map((m, index) => {
        return { country: m.countryName, countrySortNo: index }
      });
      const oldParams = reslove.oldData.map(m => m.countryName);
      // 判断拖动前和拖动后排序是否一致
      let different = false;
      params.forEach((item, index) => {
        if (oldParams[index] !== item.country && !different) {
          different = true;
        }
      });
      if (!different) {
        this.tableData = reslove.data;
        return;
      }
      this.$http.post(this.api.weatherApi.updateCountrySortNo, params).catch(() => {
        this.tableData = reslove.oldData;
        this.$nextTick(() => {
          this.$refs.weatherList.search();
        })
      })
    },
    // 改变首页展示列操作
    beforeChange (index:number, row:{[key:string]:any}) {
      if (!this.power.enable) return;
      if (this.isDrg) {
        this.$message.error('排序保存中，请稍等...')
        return;
      }
      if (!this.$common.isEmpty(row)) {
        row.showLoading = true;
        this.$http.get(this.api.weatherApi.updateShowStatus, {
          params: {
            type: 'country',
            msg: row.countryName,
            showStatus: [1, '1'].includes(row.show) ? 0 : 1
          }
        }).then(() => {
          this.$message.success('操作成功！');
          this.tableData[index] = {
            ...row,
            show: [1, '1'].includes(row.show) ? '0' : '1',
            showLoading: false
          }
          row.showLoading = false;
          row.show = [1, '1'].includes(row.show) ? '0' : '1';
        }).catch(() => {
          row.showLoading = false;
        })
      }
    }
  }
})
</script>
<style lang="scss" scoped>
.weather-manage-list{
  position: relative;
  height: 100%;
}
</style>