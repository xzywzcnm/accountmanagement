// 展示天气项目需要安装天气图标依赖： https://github.com/visualcrossing/WeatherIcons
const upms = '/dyt-cloud-upms-admin'
let api = {
  weatherApi: {
    /**
     * 获取天气管理列表
     * @param country 国家名称，非必传
     */
    getCountryAdminList: '/weather/sysCountryCity/getCountryList',
    // 获取国家列表
    // getCountry: '/weather/sysCityInfo/getCountry',
    getCountry: '/weather/sysCountry/getCountry',
    /**
     * 通过国家名称获取国家全部城市
     * @param country 国家名称，必传
     */
    getCountryCity: '/weather/sysCityInfo/getCountryAllCity',
    /**
     * 获取国家未新增城市
     * @param country 国家名称，必传
     */
    getCountryNotAddCity: '/weather/sysCountryCity/getCountryNotAddCity',
    /**
     * 获取国家已设置城市
     * @param country 国家名称，必传
     */
    getCountryListDetail: '/weather/sysCountryCity/getCountryListDetail',
    /**
     * 修改城市、国家展示状态 get 请求方式
     * @param msg 修改国家时传国家名，修改城市时传城市id
     * @param type 修改国家时传country，修改城市时传city
     * @param showStatus 是否展示(0:否 1:是)
     */
    updateShowStatus: '/weather/sysCountryCity/updateShowStatus',
    // 
    /**
     * 新增城市 post 请求方式
     * @param object []
     * @param cityId 城市id
     * @param lat 纬度
     * @param lon 经度
     * @param country 国家名称
     * @param isShow 是否首页展示(0:否 1:是)
     * @param sortNo 城市排序
     * @param countrySortNo 国家排序
     * @param type 请求接口上追加参数，新增国家时添加城市传 country, 编辑时忽略（即: 追加时需要传 country）
     */
     addCity: '/weather/sysCountryCity/addCity',
    /**
     * 删除国家、城市 get 请求方式
     * @param msg 删除国家时传国家名, 删除城市时传城市 id
     * @param type 删除国家时传 country, 删除城市时传 city
     */
    delete: '/weather/sysCountryCity/delete',
    /**
     * 获取单个国家全部城市的天气 get 请求方式
     * @param country 国家名
     */
    getCountryAllCityWeather: '/weather/weather/getCountryAllCityWeather',
    // 修改城市排序
    /**
     * 修改城市排序 post 请求方式
     * @param [cityId 城市id, sortNo 排序]
     */
    updateCitySortNo: '/weather/sysCountryCity/updateCitySortNo',
    /**
     * 修改国家排序 post 请求方式
     * @param [country 国家名称, countrySortNo 排序]
     */
    updateCountrySortNo: '/weather/sysCountryCity/updateCountrySortNo'
  },
}

const apiHand = (obj:any, str:string) => {
  for (let key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = `${str}${obj[key]}`;
    } else {
      apiHand(obj[key], str);
    }
  }
}
apiHand(api, upms);
export default api