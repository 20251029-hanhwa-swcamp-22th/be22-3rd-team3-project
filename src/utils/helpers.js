// 이미지 사전 로딩 유틸리티
export function preloadImages(imageUrls) {
    return Promise.all(
        imageUrls.map(url => {
            return new Promise((resolve, reject) => {
                const img = new Image()
                img.onload = () => resolve(url)
                img.onerror = () => reject(url)
                img.src = url
            })
        })
    )
}

// 퀴즈 정답 비교를 위한 텍스트 정규화
export function normalizeText(text) {
    return text.trim().toLowerCase().replace(/\s+/g, '')
}

// 시간 포맷 (초를 MM:SS 형식으로 변환)
export function formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 승률 계산
export function calculateWinRate(winCount, appearCount) {
    if (appearCount === 0) return 0
    return Math.round((winCount / appearCount) * 100 * 10) / 10
}

// 배열 셔플
export function shuffleArray(array) {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

// 확률 판단 (이스터에그 기능용)
export function randomChance(percentage) {
    return Math.random() * 100 < percentage
}

// 날짜 포맷
export function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    })
}

// 이미지 URL 포맷팅 헬퍼 함수
export function getImageUrl(url) {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    // 슬래시가 없으면 추가
    return url.startsWith('/') ? `${import.meta.env.VITE_API_BASE_URL}${url}`
        : `${import.meta.env.VITE_API_BASE_URL}/${url}`;
}
