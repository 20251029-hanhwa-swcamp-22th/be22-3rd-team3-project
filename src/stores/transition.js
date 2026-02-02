import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTransitionStore = defineStore('transition', () => {
    const transitionColor = ref('white')
    const isTransitioning = ref(false)

    function triggerTransition(color = 'white') {
        transitionColor.value = color
        isTransitioning.value = true

        setTimeout(() => {
            isTransitioning.value = false
        }, 800)
    }

    return {
        transitionColor,
        isTransitioning,
        triggerTransition
    }
})
