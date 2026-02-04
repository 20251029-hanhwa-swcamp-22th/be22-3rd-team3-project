import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite' // 1. loadEnv 추가
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  // 2. 현재 모드(development/production)에 맞는 .env 파일을 로드합니다.
  // process.cwd()는 프로젝트의 루트 경로를 의미합니다.
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      proxy: {
        '/api': {
          // 3. import.meta.env 대신 env 객체에서 가져옵니다.
          target: env.VITE_API_BASE_URL || 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  }
})