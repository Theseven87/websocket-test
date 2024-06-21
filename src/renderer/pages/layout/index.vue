<template>
  <div class="w-full h-full">
    <a-layout class="w-full h-full">
      <a-layout-sider v-model:collapsed="collapsed" :trigger="null" collapsible>
        <div class="logo"></div>
        <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline" @click="goto">
          <a-menu-item v-for="item in routerConf" :key="item.id">
            <component :is="item.icon" />
            <span>{{ item.label }}</span>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      <a-layout>
        <a-layout-header style="background: #fff; padding-left: 20px">
          <menu-unfold-outlined
            v-if="collapsed"
            class="trigger text-xl hover:text-blue-600 duration-300"
            @click="() => (collapsed = !collapsed)"
          />
          <menu-fold-outlined
            v-else
            class="trigger text-xl hover:text-blue-600 duration-300"
            @click="() => (collapsed = !collapsed)"
          />
        </a-layout-header>
        <a-layout-content :style="{ margin: '24px 16px', background: '#fff', minHeight: '280px' }">
          <div class="h-full">
            <RouterView />
          </div>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
const router = useRouter()
import routerConf from './routerConfig.json'
const selectedKeys = ref(['ws'])
const collapsed = ref(false)

const goto = ({ key }) => {
  router.push(`/${key}`)
}
</script>

<style>
.site-layout .site-layout-background {
  background: #fff;
}
</style>
