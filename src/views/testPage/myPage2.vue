<template>
  <div style="padding: 60px">
    <el-button @click="broadcast">广播信息</el-button>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount } from 'vue';
import getGlobal from "@/utils/global";
// import connectAuth from "@/utils/connectAuth";

// connectAuth.getToken().then(res => {
//   console.log('connectAuth', res);
// })
// connectAuth.encryption('123545').then(res => {
//   console.log('加密后: ', res);
// })


const global = getGlobal();

const mytest = (value:any) => {
  console.log(`当前页面 ${location.href}`, value)
}

const authToken = (val:any) => {
  console.log('authToken', val);
}


global.$bus.on('mytest', mytest);


global.$bus.on('auth-token', authToken);
let index = 0;
const broadcast = () => {
  index++;
  global.$bus.emit('mytest', {text: `我来自于 ${location.href}, 第 ${index} 次广播`});
  global.$bus.emit('mytest1', {text: `我来自于 ${location.href}, 第 ${index} 次广播`});
}
// 销毁组件前解绑订阅
onBeforeUnmount(() => {
  global.$bus.off('mytest', mytest);
})
</script>
