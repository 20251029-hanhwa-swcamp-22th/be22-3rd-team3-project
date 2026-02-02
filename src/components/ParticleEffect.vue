<template>
  <div class="particle-container" ref="container"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

// Props 정의: 파티클 효과 타입과 지속 시간
const props = defineProps({
  type: {
    type: String,
    default: 'confetti', // confetti, stars, hearts
    validator: (value) => ['confetti', 'stars', 'hearts'].includes(value)
  },
  duration: {
    type: Number,
    default: 3000 // 3초
  },
  density: {
    type: Number,
    default: 50 // 파티클 개수
  }
})

// Emit 정의: 애니메이션 완료 시 이벤트 발생
const emit = defineEmits(['complete'])

// DOM 참조
const container = ref(null)

// 파티클 객체 배열
let particles = []
let animationId = null

// 파티클 클래스 정의
class Particle {
  constructor(x, y, color, shape) {
    this.x = x
    this.y = y
    this.vx = (Math.random() - 0.5) * 10 // 수평 속도 (랜덤)
    this.vy = Math.random() * -15 - 5 // 수직 속도 (위로)
    this.gravity = 0.5 // 중력 가속도
    this.rotation = Math.random() * 360 // 회전 각도
    this.rotationSpeed = (Math.random() - 0.5) * 10 // 회전 속도
    this.color = color
    this.shape = shape
    this.size = Math.random() * 10 + 5 // 크기 5~15px
    this.opacity = 1
    this.fadeSpeed = 0.02 // 페이드 아웃 속도
  }

  update() {
    // 물리 법칙 적용: 중력, 속도
    this.vy += this.gravity
    this.x += this.vx
    this.y += this.vy
    this.rotation += this.rotationSpeed
    this.opacity -= this.fadeSpeed

    // 투명도가 0 이하면 파티클 제거
    return this.opacity > 0
  }

  draw(ctx) {
    ctx.save()
    ctx.globalAlpha = this.opacity
    ctx.translate(this.x, this.y)
    ctx.rotate((this.rotation * Math.PI) / 180)

    if (this.shape === 'circle') {
      // 원형 파티클
      ctx.fillStyle = this.color
      ctx.beginPath()
      ctx.arc(0, 0, this.size, 0, Math.PI * 2)
      ctx.fill()
    } else if (this.shape === 'square') {
      // 사각형 파티클
      ctx.fillStyle = this.color
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size)
    } else {
      // 텍스트 파티클 (이모지)
      ctx.font = `${this.size * 2}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(this.shape, 0, 0)
    }

    ctx.restore()
  }
}

// 애니메이션 루프
function animate(ctx, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 모든 파티클 업데이트 및 그리기
  particles = particles.filter((particle) => {
    const isAlive = particle.update()
    if (isAlive) particle.draw(ctx)
    return isAlive
  })

  // 파티클이 모두 사라졌으면 종료
  if (particles.length > 0) {
    animationId = requestAnimationFrame(() => animate(ctx, canvas))
  } else {
    emit('complete')
  }
}

// 파티클 생성 함수
function createParticles() {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  // 캔버스 크기 설정 (전체 화면)
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  canvas.style.position = 'fixed'
  canvas.style.top = '0'
  canvas.style.left = '0'
  canvas.style.pointerEvents = 'none' // 클릭 이벤트 무시
  canvas.style.zIndex = '9999'

  container.value.appendChild(canvas)

  // 파티클 타입에 따라 색상과 모양 결정
  let colors = []
  let shapes = []

  if (props.type === 'confetti') {
    colors = ['#6366f1', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#a855f7']
    shapes = ['circle', 'square']
  } else if (props.type === 'stars') {
    colors = ['#fbbf24', '#fde047']
    shapes = ['⭐', '✨', '💫']
  } else if (props.type === 'hearts') {
    colors = ['#ec4899', '#f472b6']
    shapes = ['❤️', '💖', '💕']
  }

  // 파티클 생성
  for (let i = 0; i < props.density; i++) {
    const x = Math.random() * canvas.width // 랜덤 X 위치
    const y = canvas.height * 0.3 // 화면 상단에서 시작
    const color = colors[Math.floor(Math.random() * colors.length)]
    const shape = shapes[Math.floor(Math.random() * shapes.length)]

    particles.push(new Particle(x, y, color, shape))
  }

  // 애니메이션 시작
  animate(ctx, canvas)

  // 지정된 시간 후 자동 종료
  setTimeout(() => {
    if (animationId) {
      cancelAnimationFrame(animationId)
    }
    particles = []
  }, props.duration)
}

// 컴포넌트 마운트 시 파티클 생성
onMounted(() => {
  createParticles()
})

// 컴포넌트 언마운트 시 정리
onBeforeUnmount(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  particles = []
})
</script>

<style scoped>
.particle-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
}
</style>
