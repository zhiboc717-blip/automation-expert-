<!--
  附件上传组件

  支持：
    - 拖拽上传 / 点击选择文件
    - 文件类型和大小校验预览
    - 上传到 Supabase Storage 或本地处理
-->

<template>
  <div
    class="relative border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer group"
    :class="isDragging
      ? 'border-[#3b82f6] bg-[#3b82f6]/10'
      : 'border-[#1f2937] hover:border-[#374151] bg-[#0d1321]/50'"
    @drop.prevent="handleDrop"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @click="$refs.fileInput.click()"
  >
    <!-- 隐藏的文件输入框 -->
    <input
      ref="fileInput"
      type="file"
      multiple
      accept=".png,.jpg,.jpeg,.gif,.pdf,.csv,.txt,.json,.xlsx"
      @change="handleFileSelect"
      class="hidden"
    />

    <!-- 上传提示区域（无文件时） -->
    <div v-if="!files.length" class="space-y-2">
      <div class="flex justify-center">
        <svg class="w-10 h-10 text-[#4b5563] group-hover:text-[#9ca3af] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>
      <p class="text-sm text-[#9ca3af]">拖拽文件到此处，或<span class="text-[#3b82f6]">点击上传</span></p>
      <p class="text-xs text-[#4b5563]">支持 PNG/JPG/PDF/CSV/TXT 等格式，单文件 ≤10MB</p>
    </div>

    <!-- 已选择的文件列表 -->
    <div v-if="files.length" class="space-y-2 text-left">
      <div
        v-for="(file, idx) in files"
        :key="idx"
        class="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#111827] border border-[#1f2937]"
      >
        <!-- 文件图标 -->
        <span class="text-lg">{{ getFileIcon(file.name) }}</span>
        <!-- 文件名和大小 -->
        <div class="flex-1 min-w-0">
          <p class="text-sm text-[#e5e7eb truncate">{{ file.name }}</p>
          <p class="text-xs text-[#4b5563]">{{ formatFileSize(file.size) }}</p>
        </div>
        <!-- 删除按钮 -->
        <button
          @click.stop="removeFile(idx)"
          class="p-1 rounded hover:bg-[#ef4444]/20 text-[#4b5563] hover:text-[#ef4444] transition-colors cursor-pointer bg-transparent border-none"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

/** 当前已选择的文件列表 */
const files = ref([])
/** 是否正在拖拽悬停中 */
const isDragging = ref(false)
/** 文件输入框引用 */

const emit = defineEmits(['files-changed'])

/**
 * 处理拖拽放下事件
 * @param {DragEvent} event
 */
function handleDrop(event) {
  isDragging.value = false
  const droppedFiles = Array.from(event.dataTransfer.files || [])
  addFiles(droppedFiles)
}

/**
 * 处理点击选择文件
 * @param {Event} event
 */
function handleFileSelect(event) {
  const selectedFiles = Array.from(event.target.files || [])
  addFiles(selectedFiles)
}

/**
 * 添加文件到列表（带大小校验）
 * @param {Array<File>} newFiles
 */
function addFiles(newFiles) {
  const MAX_SIZE_MB = 10
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

  for (const file of newFiles) {
    if (file.size > MAX_SIZE_BYTES) {
      alert(`文件 "${file.name}" 超过 ${MAX_SIZE_MB}MB 限制！`)
      continue
    }
    files.value.push(file)
  }

  emit('files-changed', [...files.value])
}

/**
 * 移除指定索引的文件
 * @param {number} index
 */
function removeFile(index) {
  files.value.splice(index, 1)
  emit('files-changed', [...files.value])
}

/**
 * 根据扩展名返回对应 emoji 图标
 * @param {string} filename
 * @returns {string}
 */
function getFileIcon(filename) {
  const ext = filename.split('.').pop()?.toLowerCase()
  const iconMap = {
    png: '🖼️', jpg: '🖼️', jpeg: '🖼️', gif: '🎞️',
    pdf: '📕', csv: '📊', txt: '📝', json: '📋',
    xlsx: '📊', xls: '📊', docx: '📘', doc: '📘'
  }
  return iconMap[ext] || '📄'
}

/**
 * 格式化文件大小为人类可读字符串
 * @param {number} bytes
 * @returns {string}
 */
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(2) + ' MB'
}
</script>
