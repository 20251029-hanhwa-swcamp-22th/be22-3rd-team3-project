<template>
  <div class="mypage-container">
    <div class="container">
      <div class="mypage-card card card-glass">
        <h2 class="text-center mb-4">마이페이지</h2>

        <!-- 내 정보 섹션 -->
        <div class="info-section">
          <h3>내 정보</h3>
          <div class="info-item">
            <label>이메일</label>
            <p>{{ user?.email || '-' }}</p>
          </div>
          <div class="info-item">
            <label>가입일</label>
            <p>{{ formatDate(user?.createdAt) }}</p>
          </div>
        </div>
        <el-divider />
        <!-- 닉네임 변경 섹션 -->
        <div class="nickname-section">
          <h3>닉네임 변경</h3>

          <div class="info-item">
            <label>현재 닉네임</label>
            <p>{{ user?.nickname || '-' }}</p>
          </div>
          <el-form :model="form" :rules="rules" ref="formRef">
            <el-form-item label="새 닉네임" prop="newNickname">
              <el-input
                  v-model="form.newNickname"
                  placeholder="새 닉네임을 입력하세요"
                  @input="handleNicknameInput"
                  :disabled="loading"
              >
                <template #suffix>
                  <!-- 중복 체크 상태 아이콘 -->
                  <el-icon v-if="nicknameCheckLoading" class="is-loading">
                    <Loading />
                  </el-icon>
                  <el-icon v-else-if="nicknameAvailable === true" color="green">
                    <CircleCheck />
                  </el-icon>
                  <el-icon v-else-if="nicknameAvailable === false" color="red">
                    <CircleClose />
                  </el-icon>
                </template>
              </el-input>

              <!-- 중복 체크 결과 메시지 -->
              <div class="nickname-feedback">
                <span v-if="nicknameAvailable === true" class="success">
                  ✅ 사용 가능한 닉네임입니다
                </span>
                <span v-else-if="nicknameAvailable === false" class="error">
                  ❌ 이미 사용 중인 닉네임입니다
                </span>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button
                  type="primary"
                  @click="handleUpdateNickname"
                  :loading="loading"
                  :disabled="!nicknameAvailable || !form.newNickname"
              >
                닉네임 변경
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

</script>

<style scoped>

</style>