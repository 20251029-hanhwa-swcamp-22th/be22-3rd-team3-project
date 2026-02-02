<template>
  <div 
    class="page-transition-overlay" 
    :class="{ active: isTransitioning }"
    :style="{ background: transitionColor }"
  ></div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useTransitionStore } from '../stores/transition'

const transitionStore = useTransitionStore()
const { isTransitioning, transitionColor } = storeToRefs(transitionStore)
</script>

<style scoped>
.page-transition-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  pointer-events: none;
  transition: all 0.8s cubic-bezier(0.65, 0, 0.35, 1);
}

.page-transition-overlay.active {
  width: 300vmax;
  height: 300vmax;
}
</style>
