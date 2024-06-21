<template>
  <div class="h-full w-full">
    <a-tabs v-model:activeKey="activeKey" class="h-full px-5">
      <a-tab-pane key="1" class="h-full" tab="服务端"><server></server></a-tab-pane>
      <a-tab-pane key="2" tab="客户端"><client></client></a-tab-pane>
    </a-tabs>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import server from './components/server.vue'
import client from './components/client.vue'
const activeKey = ref('1')
</script>
<style lang="less">
.ant-tabs-content {
  height: 100%;
}
</style>
