<template>
  <div class="create-page">
    <div class="container">
      <div class="create-header">
        <h1 class="gradient-text">🏆 월드컵 만들기</h1>
        <p>나만의 이상형 월드컵을 만들어보세요!</p>
      </div>

      <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          class="create-form card card-glass"
          @submit.prevent="handleSubmit"
      >
        <h3>기본 정보</h3>

        <el-form-item label="제목" prop="title">
          <el-input
              v-model="form.title"
              placeholder="월드컵 제목을 입력하세요"
              size="large"
          />
        </el-form-item>

        <el-form-item label="설명" prop="description">
          <el-input
              v-model="form.description"
              type="textarea"
              :rows="3"
              placeholder="월드컵에 대한 설명을 입력하세요"
          />
        </el-form-item>

        <el-form-item label="카테고리" prop="categoryId">
          <el-select
              v-model="form.categoryId"
              placeholder="카테고리를 선택하세요"
              size="large"
              style="width: 100%"
          >
            <el-option
                v-for="category in categories"
                :key="category.id"
                :label="category.name"
                :value="category.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="썸네일 이미지" prop="thumbnail">
          <ImageUploader v-model="form.thumbnail"/>
        </el-form-item>

        <el-divider/>

        <h3>후보 등록 ({{ candidates.length }}개)</h3>
        <p class="hint">최소 32개의 후보를 등록해야 합니다.</p>

        <!-- 다중 이미지 업로드 -->
        <div class="bulk-upload-section">
          <!-- 
          multiple : 여러 파일 선택 가능
          on-success : 업로드 성공 시 호출될 함수
          before-upload : 업로드 전 호출될 함수
          file-list : 업로드할 파일 목록
          -->
          <el-upload
              action="/api/upload"
              accept=".jpg,.jpeg,.png,.gif,.webp"
              name="image"
              :headers="uploadHeaders"
              :multiple="true"
              :show-file-list="false"
              :on-success="handleBulkImageUpload"
              :before-upload="beforeUpload"
              :file-list="bulkFileList"
          >
            <el-button type="success" size="default">
              <el-icon class="mr-1">
                <Upload/>
              </el-icon>
              여러 이미지 한번에 업로드
            </el-button>
            <template #tip>
              <div class="el-upload__tip">
                여러 이미지를 선택하면 빈 후보 슬롯부터 순서대로 자동 등록됩니다
              </div>
            </template>
          </el-upload>
        </div>

        <div class="candidates-grid">
          <div
              v-for="(candidate, index) in candidates"
              :key="index"
              class="candidate-item card"
          >
            <el-button
                type="danger"
                size="small"
                circle
                class="remove-btn"
                @click="removeCandidate(index)"
            >
              <el-icon>
                <Close/>
              </el-icon>
            </el-button>

            <div class="candidate-image">
              <img v-if="candidate.imageUrl" :src="getImageUrl(candidate.imageUrl)" alt="후보 이미지"/>
              <div v-else class="placeholder">이미지 없음</div>
            </div>

            <el-input
                v-model="candidate.name"
                placeholder="후보 이름"
                size="small"
                class="mt-2"
            />

            <el-upload
                action="/api/upload"
                accept=".jpg,.jpeg,.png,.gif,.webp"
                name="image"
                :headers="uploadHeaders"
                :show-file-list="false"
                :on-success="(res) => handleCandidateImageUpload(res, index)"
                :before-upload="beforeUpload"
            >
              <el-button size="small" type="primary" class="mt-1">
                이미지 업로드
              </el-button>
            </el-upload>
          </div>

          <div class="add-candidate-btn card" @click="addCandidate">
            <el-icon size="40">
              <Plus/>
            </el-icon>
            <p>후보 추가</p>
          </div>
        </div>

        <el-form-item class="submit-section">
          <el-button
              type="primary"
              size="large"
              :loading="loading"
              native-type="submit"
              :disabled="candidates.length < 32"
          >
            월드컵 만들기
          </el-button>
          <el-button size="large" @click="$router.push('/worldcup')">
            취소
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import {computed, onMounted, reactive, ref} from 'vue'
import {useRouter} from 'vue-router'
import {useAuthStore} from '@/stores/auth'
import {Close, Plus, Upload} from '@element-plus/icons-vue'
import {ElMessage} from 'element-plus'
import {worldcupApi} from '@/api/worldcupApi'
import {commonApi} from '@/api/commonApi'
import {getImageUrl} from "@/utils/helpers.js";
import ImageUploader from '@/components/create/ImageUploader.vue'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref(null)
const loading = ref(false)
const categories = ref([])

const form = reactive({
  title: '',
  description: '',
  categoryId: null,
  thumbnail: ''
})

const candidates = ref([])
const bulkFileList = ref([])

const uploadHeaders = computed(() => {
  const token = localStorage.getItem('token')
  return token ? {Authorization: `Bearer ${token}`} : {}
})

const rules = {
  title: [
    {required: true, message: '제목을 입력해주세요', trigger: 'blur'},
    {min: 2, max: 100, message: '제목은 2-100자 사이여야 합니다', trigger: 'blur'}
  ],
  description: [
    {required: true, message: '설명을 입력해주세요', trigger: 'blur'}
  ],
  categoryId: [
    {required: true, message: '카테고리를 선택해주세요', trigger: 'change'}
  ],
  thumbnail: [
    {required: true, message: '썸네일 이미지를 업로드해주세요', trigger: 'change'}
  ]
}

onMounted(async () => {
  await loadCategories()
  // 초기 후보 32개 생성
  for (let i = 0; i < 32; i++) {
    candidates.value.push({name: '', imageUrl: ''})
  }
})

async function loadCategories() {
  try {
    const response = await commonApi.getCategories('worldcup')
    categories.value = response.data
  } catch (error) {
    console.error('Failed to load categories:', error)
    ElMessage.error('카테고리를 불러오는데 실패했습니다')
  }
}

function addCandidate() {
  candidates.value.push({name: '', imageUrl: ''})
}

function removeCandidate(index) {
  if (candidates.value.length <= 32) {
    ElMessage.warning('최소 32개의 후보가 필요합니다')
    return
  }
  candidates.value.splice(index, 1)
}

function beforeUpload(file) {
  // 1. 허용할 확장자 목록
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  // 2. 파일 타입 확인
  const isImage = allowedTypes.includes(file.type);

  // 3. (옵션) 확장자 명으로 한 번 더 확인
  const extension = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();
  const isExtAllowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);

  if (!isImage && !isExtAllowed) {
    ElMessage.error('JPG, PNG, GIF, WebP 형식의 이미지인지만 확인해주세요!');
    return false;
  }

  // 용량 제한도 추가하는 것을 권장합니다 (예: 5MB)
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    ElMessage.error('이미지 크기는 5MB를 넘을 수 없습니다.');
    return false;
  }

  return true;
}


function handleCandidateImageUpload(response, index) {
  console.log('서버 응답 데이터:', response);

  if (response && response.url) {
    // 서버에서 이미 /uploads/파일명 형식으로 반환하므로 그대로 저장
    console.log(response.url);
    candidates.value[index].imageUrl = response.url;
    ElMessage.success(`${index + 1}번 후보 이미지 업로드 성공!`);
  } else {
    console.error('응답 객체에 url 필드가 없습니다.');
    ElMessage.error('서버 응답 형식이 올바르지 않습니다.');
  }
}

// 다중 이미지 업로드 핸들러
function handleBulkImageUpload(response, file, fileList) {
  console.log('다중 업로드 서버 응답:', response);

  if (response && response.url) {
    // 빈 후보 슬롯 찾기 (이미지가 없는 첫 번째 후보)
    const emptyIndex = candidates.value.findIndex(c => !c.imageUrl);

    if (emptyIndex !== -1) {
      // 서버에서 이미 /uploads/파일명 형식으로 반환하므로 그대로 저장
      candidates.value[emptyIndex].imageUrl = response.url;

      // 업로드된 파일 개수 계산
      const uploadedCount = fileList.filter(f => f.status === 'success').length;
      ElMessage.success(`이미지 업로드 중... (${uploadedCount}/${fileList.length})`);
    } else {
      ElMessage.warning('모든 후보 슬롯에 이미지가 등록되었습니다.');
    }
  } else {
    console.error('응답 객체에 url 필드가 없습니다.');
    ElMessage.error('서버 응답 형식이 올바르지 않습니다.');
  }
}


async function handleSubmit() {
  if (!formRef.value) return;

  try {
    // 1. Element Plus 폼 검증 - 각 필드별 상세 에러 메시지 표시
    const validationResult = await formRef.value.validate().catch((errors) => {
      // 검증 실패 시 어떤 필드가 비어있는지 확인
      const errorMessages = [];

      // rules 객체의 각 필드를 확인하여 빈 부분 찾기
      if (!form.title || form.title.trim() === '') {
        errorMessages.push('📝 제목을 입력해주세요');
      } else if (form.title.length < 2 || form.title.length > 100) {
        errorMessages.push('📝 제목은 2-100자 사이여야 합니다');
      }

      if (!form.description || form.description.trim() === '') {
        errorMessages.push('📄 설명을 입력해주세요');
      }

      if (!form.categoryId) {
        errorMessages.push('🏷️ 카테고리를 선택해주세요');
      }

      if (!form.thumbnail || form.thumbnail.trim() === '') {
        errorMessages.push('🖼️ 썸네일 이미지를 업로드해주세요');
      }

      // 에러 메시지 출력
      if (errorMessages.length > 0) {
        errorMessages.forEach(msg => {
          ElMessage.error(msg);
        });
      } else {
        ElMessage.error('입력 항목 중 빠진 부분이 있는지 확인해주세요.');
      }

      throw new Error('Form validation failed');
    });

    // 2. 후보자 유효성 검증 (이름과 이미지가 모두 있는 것만 필터링)
    const validCandidates = candidates.value.filter(
        (c) => c.name.trim() !== '' && c.imageUrl.trim() !== ''
    );

    // 최소 32개 조건 체크
    if (validCandidates.length < 32) {
      ElMessage.error(
          `🎯 최소 32개의 후보가 필요합니다. (현재 완료: ${validCandidates.length}/32)
          💡 팁: 상단의 "여러 이미지 한번에 업로드" 버튼으로 여러 이미지를 한번에 등록할 수 있습니다!`
      );
      return; // 실행 중단
    }

    // 3. 생성 프로세스 시작
    loading.value = true;

    // 4. 월드컵 기본 정보 생성 (worldcupApi 사용)
    const worldcupData = {
      title: form.title,
      description: form.description,
      categoryId: form.categoryId,
      thumbnail: form.thumbnail,
      userId: authStore.user?.id,
      createdAt: new Date().toISOString(),
      viewCount: 0,
      playCount: 0
    };

    // apiClient 대신 정의된 worldcupApi.createWorldcup 호출
    const worldcupResponse = await worldcupApi.createWorldcup(worldcupData);
    const worldcupId = worldcupResponse.data.id;

    // 5. 유효한 후보자들을 서버에 등록
    // 여러 개의 요청을 병렬로 처리하여 속도를 높입니다.
    const candidatePromises = validCandidates.map((candidate) =>
        worldcupApi.createCandidate({
          worldcupId,
          name: candidate.name,
          imageUrl: candidate.imageUrl,
          winCount: 0,
          appearCount: 0,
          finalCount: 0
        })
    );

    await Promise.all(candidatePromises);

    ElMessage.success('월드컵이 성공적으로 생성되었습니다! 🏆');
    router.push('/worldcup');

  } catch (error) {
    // 폼 검증 실패가 아닌 실제 API 에러인 경우에만 메시지 출력
    if (error.message !== 'Form validation failed') {
      console.error('월드컵 생성 중 에러 발생:', error);
      const serverMsg = error.response?.data?.message || '서버와의 통신 중 오류가 발생했습니다.';
      ElMessage.error(serverMsg);
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.create-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.create-header p {
  color: var(--text-secondary);
  margin-top: var(--spacing-sm);
}

.create-form {
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--spacing-2xl);
}

.create-form h3 {
  margin-bottom: var(--spacing-md);
  color: var(--primary-light);
}

.hint {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin-bottom: var(--spacing-md);
}

.candidates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.candidate-item {
  position: relative;
  padding: var(--spacing-md);
  text-align: center;
}

.remove-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 10;
}

.candidate-image {
  width: 100%;
  height: 120px;
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  background: var(--bg-tertiary);
  margin-bottom: var(--spacing-sm);
}

.candidate-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 0.75rem;
}

.add-candidate-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  cursor: pointer;
  transition: all var(--transition-normal);
  border: 2px dashed var(--border-color);
}

.add-candidate-btn:hover {
  border-color: var(--primary-light);
  background: var(--bg-hover);
}

.add-candidate-btn p {
  margin-top: var(--spacing-sm);
  color: var(--text-secondary);
}

.submit-section {
  margin-top: var(--spacing-2xl);
  text-align: center;
}

.mt-1 {
  margin-top: var(--spacing-xs);
}

.mt-2 {
  margin-top: var(--spacing-sm);
}

.bulk-upload-section {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--border-radius-md);
  border: 2px dashed var(--primary-light);
}

.mr-1 {
  margin-right: var(--spacing-xs);
}

</style>
