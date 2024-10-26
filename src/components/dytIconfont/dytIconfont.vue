<template>
  <dyt-select
    class="dyt-iconfont-demo"
    :loading="loading"
    :class="{
      'iconfont-empty': $common.isEmpty(selectConfig.modelValue)
    }"
    :ref="pageId"
    v-bind="selectConfig"
  >
    <template v-slot:prefix>
      <i :class="`lapa icon-${selectConfig.modelValue}`" v-if="!$common.isEmpty(selectConfig.modelValue)"/>
    </template>
    <el-option
      v-for="(icon, index) in iconfontData"
      :key="`${index}-${icon.icon_id}`"
      :label="icon.font_class"
      :value="icon.font_class"
    >
      <i :class="`lapa icon-${icon.font_class}`" />
      <span style="margin-left: 5px;">{{ icon.font_class }}</span>
    </el-option>
  </dyt-select>
</template>
<script>

export default {
  name: 'DytIconfont',
  components: {},
  props: {},
  data () {
    return {
      pageId: Math.random().toString(36).substring(2),
      selectValue: '',
      loading: true,
      iconfontData: [],
      defaultConfig: {
        placeholder: '请选择图标'
      }
    }
  },
  computed: {
    selectConfig () {
      let config = { ...this.defaultConfig, ...this.$attrs };
      if (config.disabled || config.readonly) {
        config.placeholder = '';
      }
      return config;
    }
  },
  watch: {},
  created () {
    this.init();
  },
  mounted () {},
  methods: {
    init () {
      // 获取 iconFont 目录下基础字体图标
      const files = import.meta.glob("@/assets/iconFont/baseIconFont/iconfont.json");
      Object.keys(files).forEach((key) => {
        files[key]().then(res => {
          this.loading = false;
          if (this.$common.isEmpty(res.glyphs)) return;
          this.iconfontData = res.glyphs;
        }).catch(() => {
          this.loading = false;
        })
      })
    },
    focus () {
      this.$refs[`${this.pageId}`].focus();
    },
    blur () {
      this.$refs[`${this.pageId}`].blur();
    }
  }
};
</script>
<style lang="scss">
.dyt-iconfont-demo{
  &.iconfont-empty{
    .el-input__prefix{
      width: 0;
    }
  }
  .el-input__prefix{
    --el-input-inner-height: calc(var(--el-input-height, 32px) - 2px);
    height: var(--el-input-inner-height);
    line-height: var(--el-input-inner-height);
  }
}
</style>
