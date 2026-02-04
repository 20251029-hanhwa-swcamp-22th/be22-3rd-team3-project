<template>
  <div class="image-uploader">
    <el-upload
      :action="uploadUrl"
      :name="uploadFieldName"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-remove="handleRemove"
      :before-upload="beforeUpload"
      :file-list="fileList"
      :limit="limit"
      :multiple="multiple"
      list-type="picture-card"
      :auto-upload="true"
    >
      <el-icon><Plus /></el-icon>
    </el-upload>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { commonApi } from "@/api/commonApi.js";

const props = defineProps({
  modelValue: {
    type: [String, Array],
    default: ''
  },
  multiple: {
    type: Boolean,
    default: false
  },
  limit: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['update:modelValue'])

const uploadUrl = computed(() => {
  return import.meta.env.VITE_API_BASE_URL
  + props.multiple ? '/upload-multiple' : '/upload'
})

const uploadFieldName = computed(() => {
  return props.multiple ? 'images' : 'image'
})



const fileList = ref([])

function beforeUpload(file) {
  // MIME 타입 검증 : 파일의 실제 형식이 이미지인지 확인
  const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const isValidMime = validMimeTypes.includes(file.type)

  // 확장자 검증
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
  const validExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  const isValidExt = validExts.includes(ext)

  // 파일 크기 검증
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isValidMime || !isValidExt) {
    ElMessage.error('JPG, PNG, GIF, WEBP 파일만 업로드 가능합니다!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('이미지 크기는 5MB를 초과할 수 없습니다!')
    return false
  }
  return true
}

function handleSuccess(response, file) {
  if (props.multiple) {
    const urls = response.files.map(f => f.url)
    emit('update:modelValue', [...(props.modelValue || []), ...urls])
  } else {
    emit('update:modelValue', response.url)
  }
  ElMessage.success('이미지 업로드 성공!')
}


async function handleRemove(uploadFile) {
  // 1. URL에서 파일명 추출 (예: /uploads/abc.jpg -> abc.jpg)
  // uploadFile구조에 따라 response가 있을수도 없을수도 있음
  const fileUrl = uploadFile.response ? uploadFile.response.url : uploadFile.url
  if (!fileUrl) return

  const filename = fileUrl.split('/').pop() // URL의 마지막 부분이 파일명

  try {
    // 2. 서버에 실제 파일 삭제 요청
    await commonApi.deleteImage(filename)
    console.log('서버 파일 삭제 성공:', filename)
  } catch (error) {
    console.error('서버 파일 삭제 실패:', error)
    // 실패해도 UI에서는 지워줘야 할까? -> 일단 진행 (사용자 경험 위해)
  }

  if (props.multiple) {
    const newValue = props.modelValue.filter(url => url !== fileUrl)
    emit('update:modelValue', newValue)
  } else {
    emit('update:modelValue', '')
  }
}

function handleError(error) {
  console.error('Upload error:', error)
  ElMessage.error('이미지 업로드 실패!')
}
</script>

<style scoped>
.image-uploader {
  margin: var(--spacing-md) 0;
}
</style>
