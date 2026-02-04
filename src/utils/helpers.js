// Image preloading utility
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

// Text normalization for quiz answers
export function normalizeText(text) {
    return text.trim().toLowerCase().replace(/\s+/g, '')
}

// Format time (seconds to MM:SS)
export function formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Calculate win rate
export function calculateWinRate(winCount, appearCount) {
    if (appearCount === 0) return 0
    return Math.round((winCount / appearCount) * 100 * 10) / 10
}

// Shuffle array
export function shuffleArray(array) {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

// Random chance (for easter egg feature)
export function randomChance(percentage) {
    return Math.random() * 100 < percentage
}

// Format date
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
