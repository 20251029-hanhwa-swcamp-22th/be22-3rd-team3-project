<template>
  <header class="app-header">
    <div class="container">
      <div class="header-content">
        <router-link to="/" class="logo">
          <h2 class="gradient-text">골라보숑</h2>
        </router-link>
        
        <nav class="nav-menu">
          <router-link to="/worldcup" class="nav-link">월드컵</router-link>
          <router-link to="/quiz" class="nav-link">퀴즈</router-link>
          
          <template v-if="authStore.isAuthenticated">
            <el-dropdown>
              <span class="user-menu">
                {{ authStore.user?.nickname || '사용자' }}
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="router.push('/worldcup/create')">
                    월드컵 만들기
                  </el-dropdown-item>
                  <el-dropdown-item @click="router.push('/quiz/create')">
                    퀴즈 만들기
                  </el-dropdown-item>
                  <el-dropdown-item @click="router.push('/mypage')">
                    마이페이지
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">
                    로그아웃
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          
          <template v-else>
            <router-link to="/login" class="btn btn-primary btn-sm">로그인</router-link>
          </template>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'

const authStore = useAuthStore()
const router = useRouter()

function handleLogout() {
  authStore.logout()
  ElMessage.success('로그아웃되었습니다')
  router.push('/')
}
</script>

<style scoped>
*:focus {
  outline: none;
}
.app-header {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  padding: var(--spacing-md) 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  text-decoration: none;
}

.logo h2 {
  margin: 0;
  font-size: 1.5rem;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  transition: color var(--transition-fast);
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--primary-light);
}

.user-menu {
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.btn-sm {
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .nav-menu {
    gap: var(--spacing-sm);
  }
  
  .nav-link {
    font-size: 0.875rem;
  }
}
</style>
