<template>
  <div style="padding: 60px">
    common.js 测试
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount } from 'vue';
import getGlobal from "@/utils/global";
const global = getGlobal();

const mytest = (value:any) => {
  console.log(`当前页面 ${location.href}`, value)
}
const mytest1 = (value:any) => {
  console.log(`当前页面 ${location.href}`, value)
}

global.$bus.on('mytest', mytest);
global.$bus.on('mytest', mytest);
global.$bus.on('mytest', mytest1);
global.$bus.on('mytest1', mytest);

// 销毁组件前解绑订阅
onBeforeUnmount(() => {
  global.$bus.off('mytest', mytest);
  global.$bus.off('mytest', mytest);
  global.$bus.off('mytest', mytest1);
  global.$bus.off('mytest1', mytest);
})

</script>
