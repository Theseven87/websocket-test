<script setup>
import layout from './pages/layout/index.vue'
</script>

<template>
  <a-config-provider :locale="zhCN">
    <layout class="overflow-hidden"></layout>
    <!-- <router-view /> -->
  </a-config-provider>
</template>

<style scoped></style>
