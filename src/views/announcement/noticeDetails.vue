<template>
  <!-- eslint-disable vue/no-v-html -->
  <dyt-dialog
    size="medium"
    v-model="dVisible"
    title="查看公告"
    :fixed-height="false"
    custom-class="announcement-details-dialog"
  >
    <div
      v-loading="pageLoading"
      class="announcement-details"
    >
      <div class="details-title">
        {{ noticeDetails.title }}
      </div>
      <p style="margin-top: 5px;color: #afafaf;">
        {{ noticeDetails.gmtCreate }}
      </p>
      <div
        class="details-container"
        v-html="noticeDetails.content"
      />
      <dytImage ref="dytImage" target-container=".announcement-details" />
    </div>
    <template v-slot:footer>
      <div class="foolter-button">
        <el-button @click="closeDialog()">
          关 闭
        </el-button>
      </div>
    </template>
  </dyt-dialog>
</template>
<script>
import dytImage from '@/components/dytImageView/dytImage.vue';

export default {
  name: 'AnnouncementDetails',
  components: { dytImage },
  props: {
    moduleData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    visible: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      dVisible: false,
      pageLoading: false,
      noticeDetails: {
        title: '',
        content: ''
      }
    };
  },
  computed: {},
  watch: {
    visible: {
      immediate: true,
      deep: true,
      handler(val) {
        this.dVisible = val;
      }
    },
    dVisible: {
      deep: true,
      handler(val) {
        this.$emit('update:visible', val);
        this.$nextTick(() => {
          val && this.dataInit(this.moduleData);
        });
      }
    }
  },
  created() {},
  mounted() {},
  // 组件销毁前
  beforeUnmount () {},
  methods: {
    // 初始化数据
    dataInit (val) {
      if (!val.id) {
        this.pageLoading = false;
        return;
      }
      this.$http.get(this.api.announcement.getDetails, {params: {id: val.id}}).then(res => {
        let noticeDetails = {};
        Object.keys(res.data).forEach(key => {
          noticeDetails[key] = res.data[key];
        });
        this.noticeDetails = noticeDetails;
        this.pageLoading = false;
        this.$nextTick(() => {
          this.$refs.dytImage.initImageView();
        })
      }).catch(() => {
        this.pageLoading = false;
      })
    },
    // 不再显示
    closeDialog (type) {
      this.dVisible = false;
    }
  }
};
</script>
<style lang="less" scoped>
.announcement-details{
  min-height: 200px;
  .details-title{
    padding: 5px 0 10px 0;
    font-size: 18px;
    font-weight: bold;
    border-bottom: 1px #ccc dashed;
  }
  .details-container{
    margin-top: 25px;
    white-space: pre-wrap;
  }
  // /deep/img {
  //   max-width: 100%;
  // }
}
</style>
<style lang="less">
.announcement-details-dialog{
  max-width: 1200px;
}
</style>

