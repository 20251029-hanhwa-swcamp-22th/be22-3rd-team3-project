import { defineStore } from 'pinia'
import { ref } from 'vue'
import { worldcupApi } from '@/api/worldcupApi'

export const useWorldcupStore = defineStore('worldcup', () => {
    const currentWorldcup = ref(null)
    const candidates = ref([])
    const currentRound = ref([])
    const nextRound = ref([])
    const roundName = ref('32강')
    const startRoundCount = ref(16)  // 시작 라운드 (8, 16, 32 등)
    const matchIndex = ref(0)
    const selections = ref([])
    const top4 = ref([])

    function startGame(worldcup, candidatesList) {
        currentWorldcup.value = worldcup
        candidates.value = candidatesList
        currentRound.value = [...candidatesList]
        nextRound.value = []
        matchIndex.value = 0
        selections.value = []
        top4.value = []

        // Determine round name based on candidate count
        const count = candidatesList.length
        startRoundCount.value = count  // 시작 라운드 저장
        roundName.value = count === 32 ? '32강' : count === 16 ? '16강' :
            count === 8 ? '8강' : count === 4 ? '4강' : '결승'
    }

    function selectCandidate(candidate) {
        // 현재 매치 정보 가져오기
        const currentMatch = getCurrentMatch()

        // Save selection with match info (left, right, selected, round)
        if (currentMatch) {
            selections.value.push({
                leftId: currentMatch.left.id,
                rightId: currentMatch.right.id,
                selectedId: candidate.id,
                round: roundName.value
            })
        }

        // Add to next round
        nextRound.value.push(candidate)

        // Move to next match
        matchIndex.value += 2

        // Check if current round is complete
        if (matchIndex.value >= currentRound.value.length) {
            // Save top 4 when entering semifinals
            if (currentRound.value.length === 4) {
                top4.value = [...currentRound.value]
            }

            // Move to next round
            currentRound.value = [...nextRound.value]
            nextRound.value = []
            matchIndex.value = 0

            // Update round name
            const count = currentRound.value.length
            if (count === 1) {
                // Game finished
                return { finished: true, winner: currentRound.value[0] }
            }
            roundName.value = count === 16 ? '16강' : count === 8 ? '8강' :
                count === 4 ? '4강' : count === 2 ? '결승' : roundName.value
        }

        return { finished: false }
    }

    function getCurrentMatch() {
        if (matchIndex.value >= currentRound.value.length - 1) {
            return null
        }
        return {
            left: currentRound.value[matchIndex.value],
            right: currentRound.value[matchIndex.value + 1]
        }
    }

    function getProgress() {
        const totalMatches = currentRound.value.length / 2 < 1 ? 1 : currentRound.value.length / 2
        const currentMatch = Math.floor(matchIndex.value / 2) + 1
        return {
            current: currentMatch,
            total: totalMatches,
            percentage: (currentMatch / totalMatches) * 100
        }
    }

    async function saveResult(winner) {
        try {
            // Update winner stats
            await worldcupApi.updateCandidateStats(winner.id, {
                winCount: (winner.winCount || 0) + 1,
                finalCount: (winner.finalCount || 0) + 1
            })

            // Update all candidates' appear count
            for (const candidate of candidates.value) {
                await worldcupApi.updateCandidateStats(candidate.id, {
                    appearCount: (candidate.appearCount || 0) + 1
                })
            }

            // Save result
            const resultData = {
                worldcupId: currentWorldcup.value.id,
                winnerId: winner.id,
                top4: top4.value.map(c => c.id),
                selections: selections.value,
                startRound: startRoundCount.value,  // 시작 라운드 저장
                createdAt: new Date().toISOString()
            }

            await worldcupApi.saveWorldcupResult(resultData)

            return { success: true }
        } catch (error) {
            console.error('Failed to save result:', error)
            return { success: false, error }
        }
    }

    function reset() {
        currentWorldcup.value = null
        candidates.value = []
        currentRound.value = []
        nextRound.value = []
        roundName.value = '32강'
        startRoundCount.value = 16
        matchIndex.value = 0
        selections.value = []
        top4.value = []
    }

    return {
        currentWorldcup,
        candidates,
        currentRound,
        roundName,
        startRoundCount,
        matchIndex,
        selections,
        top4,
        startGame,
        selectCandidate,
        getCurrentMatch,
        getProgress,
        saveResult,
        reset
    }
})
