<template>
  <footer class="app-footer">
    <div class="container">
      <div class="footer-content">
        <p>&copy; 2026 이상형 & 퀴즈 게임. All rights reserved.</p>
        <p class="footer-text">Made with ❤️ using Vue.js & Element Plus</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  padding: var(--spacing-lg) 0;
  //margin-top: var(--spacing-2xl);
}

.footer-content {
  text-align: center;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.footer-text {
  margin-top: var(--spacing-sm);
}
</style>
