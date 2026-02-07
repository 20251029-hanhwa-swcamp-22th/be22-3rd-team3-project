import { defineStore } from 'pinia'
import { ref } from 'vue'
import { worldcupApi } from '@/api/worldcupApi'

export const useWorldcupStore = defineStore('worldcup', () => {
    const currentWorldcup = ref(null)
    const candidates = ref([])
    const currentRound = ref([])
    const nextRound = ref([])
    const roundName = ref('64강')
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

        // 후보 수에 따라 라운드 이름 결정
        const count = candidatesList.length
        startRoundCount.value = count  // 시작 라운드 저장
        roundName.value = count === 64 ? '64강' : count === 32 ? '32강' : count === 16 ? '16강' :
            count === 8 ? '8강' : count === 4 ? '4강' : '결승'
    }

    function selectCandidate(candidate) {
        // 현재 매치 정보 가져오기
        const currentMatch = getCurrentMatch()

        // 매치 정보와 함께 선택 내역 저장 (왼쪽, 오른쪽, 선택됨, 라운드)
        if (currentMatch) {
            selections.value.push({
                leftId: currentMatch.left.id,
                rightId: currentMatch.right.id,
                selectedId: candidate.id,
                round: roundName.value
            })
        }

        // 다음 라운드에 추가
        nextRound.value.push(candidate)

        // 다음 매치로 이동
        matchIndex.value += 2

        // 현재 라운드가 완료되었는지 확인
        if (matchIndex.value >= currentRound.value.length) {
            // 4강 진입 시 상위 4명 저장
            if (currentRound.value.length === 4) {
                top4.value = [...currentRound.value]
            }

            // 다음 라운드로 이동
            currentRound.value = [...nextRound.value]
            nextRound.value = []
            matchIndex.value = 0

            // 라운드 이름 업데이트
            const count = currentRound.value.length
            if (count === 1) {
                // 게임 종료
                return { finished: true, winner: currentRound.value[0] }
            }
            roundName.value = count === 64 ? '64강' :roundName.value = count === 32 ? '32강' : count === 16 ? '16강' : count === 8 ? '8강' :
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
            // 우승자 통계 업데이트
            await worldcupApi.updateCandidateStats(winner.id, {
                winCount: (winner.winCount || 0) + 1,
                finalCount: (winner.finalCount || 0) + 1
            })

            // 모든 후보의 출전 횟수 업데이트
            for (const candidate of candidates.value) {
                await worldcupApi.updateCandidateStats(candidate.id, {
                    appearCount: (candidate.appearCount || 0) + 1
                })
            }

            // 결과 저장
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
