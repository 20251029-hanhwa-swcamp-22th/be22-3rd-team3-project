import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTransitionStore = defineStore('transition', () => {
    const transitionColor = ref('white')
    const isTransitioning = ref(false)
    const transitionX = ref('50%')  // 원의 시작 X 위치
    const transitionY = ref('50%')  // 원의 시작 Y 위치

    function triggerTransition(color = 'white', event = null) {
        transitionColor.value = color

        // 클릭 이벤트가 있으면 클릭 위치 저장
        if (event) {
            const target = event.currentTarget
            const rect = target.getBoundingClientRect()
            // 버튼의 중심 좌표 계산
            transitionX.value = `${rect.left + rect.width / 2}px`
            transitionY.value = `${rect.top + rect.height / 2}px`
        } else {
            // 기본값: 화면 중앙
            transitionX.value = '50%'
            transitionY.value = '50%'
        }

        isTransitioning.value = true

        setTimeout(() => {
            isTransitioning.value = false
        }, 800)
    }

    return {
        transitionColor,
        isTransitioning,
        transitionX,
        transitionY,
        triggerTransition
    }
})
