<script setup lang="ts">
import 'vue-sonner/style.css'
import { RouterView } from 'vue-router';
import { Toaster } from 'vue-sonner';
</script>

<template>
  <router-view />
  <Toaster :expand="true" :visible-toasts="5" close-button-position="bottom-right" richColors :close-button="true" position="top-center" class="font-[serif]"/>
</template>
<style scoped></style>
