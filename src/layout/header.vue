<template>
  <div v-loading="data.headLoading" class="head-container">
    <img class="logo" src="@images/logo.png">
    <div class="operation-container">
      <span class="operation-item" @click="goToLapa">
        <span class="backUsercenter">
          <i class="lapa icon-fanhui" />
          <span>返回认证中心</span>
        </span>
      </span>
      <span class="operation-item">
        <i class="lapa icon-user" />
        {{ (getUserInfo && getUserInfo.securityUser && getUserInfo.securityUser.name) ? getUserInfo.securityUser.name : '' }}
      </span>
      <span class="operation-item" @click="loginOut">
        <i class="lapa icon-exit" />
        退出
      </span>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, reactive } from 'vue';
import connectAuth from '@/utils/connectAuth';
import store from '@/store';

let data = reactive({
  headLoading: false
})
const loginOut = () => {
  connectAuth.outLogin().then(res => {});
}
const goToLapa = () => {
  connectAuth.backOauth();
}
const getUserInfo = computed(() => {
  return store.getters['layout/userInfo'];
})
</script>
<style lang="less" scoped>
.head-container {
  display: flex;
  height: var(--layout-head-height);
  background: var(--layout-head-background);
  .logo {
    margin: 10px 10px 0 20px;
    height: 30px;
  }
  .operation-container {
    flex: 100;
    color: #fff;
    text-align: right;
  }
  .operation-item {
    display: inline-block;
    padding: 0px 10px;
    height: 100%;
    line-height: 50px;
    cursor: pointer;
    vertical-align: top;
  }

  .backUsercenter {
    align-items: center;
    padding: 6px 14px;
    margin: 0;
    border-radius: 14px;
    line-height: 16px;
    cursor: pointer;
    &:hover {
      background: rgba(216, 216, 216, 0.22);
    }
    i {
      margin-right: 6px;
    }
  }
}
</style>