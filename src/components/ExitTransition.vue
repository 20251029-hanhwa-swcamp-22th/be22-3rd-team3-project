<template>
  <transition name="shrink">
    <div 
      v-if="isVisible" 
      class="exit-transition-overlay"
      :style="{ 
        backgroundColor: color,
        left: `${centerX}px`,
        top: `${centerY}px`
      }"
    ></div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  color: {
    type: String,
    required: true
  }
})

const isVisible = ref(false)
const centerX = ref(0)
const centerY = ref(0)

// 화면 중앙 계산
onMounted(() => {
  centerX.value = window.innerWidth / 2
  centerY.value = window.innerHeight / 2
})

// 외부에서 호출할 수 있는 함수
const trigger = () => {
  isVisible.value = true
  return new Promise(resolve => {
    setTimeout(resolve, 600) // 애니메이션 시간
  })
}

defineExpose({
  trigger
})
</script>

<style scoped>
.exit-transition-overlay {
  position: fixed;
  width: 300vmax;
  height: 300vmax;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  pointer-events: none;
}

/* 줄어드는 애니메이션 */
.shrink-enter-active {
  animation: shrinkCircle 0.6s cubic-bezier(0.65, 0, 0.35, 1) forwards;
}

@keyframes shrinkCircle {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
}
</style>
