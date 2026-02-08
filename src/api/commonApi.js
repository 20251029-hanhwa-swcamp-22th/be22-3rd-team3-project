import apiClient from './axios'

/**
 * 공통 API
 */
export const commonApi = {
    /**
     * 카테고리 목록 조회
     * @param {string} type - 카테고리 타입
     * @returns {Promise}
     */
    getCategories(type) {
        return apiClient.get(`/categories?type=${type}`)
    },

    /**
     * 단일 이미지 업로드
     * @param {File} file - 이미지 파일
     * @returns {Promise}
        */
    uploadImage(file) {
    const formData = new FormData()
    formData.append('image', file)
    return apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
},

    /**
     * 다중 이미지 업로드
     * @param {File[]} files - 이미지 파일 배열
     * @returns {Promise}
     */
    uploadMultipleImages(files) {
        const formData = new FormData()
        files.forEach(file => {
            formData.append('images', file)
        })
        return apiClient.post('/upload-multiple', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },

    /**
     *
     * @param {string} filename
     * @returns {Promise}
     */
    deleteImage(filename){
      return apiClient.delete(`/upload/files/${filename}`)
    }
}
