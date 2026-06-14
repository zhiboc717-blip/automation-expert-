<!--
  历史记录侧边栏

  从右侧滑出，显示最近的历史计算记录
  可通过 Navbar 或 Home 页面触发展开/收起
-->

<template>
  <!-- 遮罩层 -->
  <Transition name="sidebar-overlay">
    <div
      v-if="store.state.sidebarOpen"
      class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
      @click="store.toggleSidebar()"
    ></div>
  </Transition>

  <!-- 侧边栏面板 -->
  <Transition name="sidebar-panel">
    <aside
      v-if="store.state.sidebarOpen"
      class="fixed top-16 right-0 bottom-0 w-80 z-50 bg-[#111827] border-l border-[#1f2937] overflow-y-auto shadow-2xl no-print"
    >
      <!-- 头部 -->
      <div class="sticky top-0 bg-[#111827] p-4 border-b border-[#1f2937] flex items-center justify-between z-10">
        <h3 class="text-base font-bold text-[#e5e7eb] flex items-center gap-2">
          <svg class="w-5 h-5 text-[#3b82f6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          历史记录
        </h3>
        <button
          @click="store.toggleSidebar()"
          class="p-1.5 rounded-lg hover:bg-[#1f2937] text-[#9ca3af] hover:text-[#e5e7eb] transition-colors cursor-pointer bg-transparent border-none"
          title="关闭侧边栏"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 记录列表 -->
      <div class="p-3 space-y-2">
        <div
          v-for="record in store.state.historyRecords.slice(0, 50)"
          :key="record.id || record.timestamp"
          class="p-3 rounded-lg bg-[#0d1321] border border-[#1f2937] hover:border-[#374151] transition-colors group cursor-default"
        >
          <!-- 记录头部：模块名 + 时间 -->
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-sm font-semibold text-[#3b82f6]">
              {{ record.moduleName || '未知模块' }}
            </span>
            <span class="text-xs text-[#4b5563]">
              {{ formatTime(record.timestamp) }}
            </span>
          </div>

          <!-- 参数摘要 -->
          <div class="text-xs text-[#9ca3af] space-y-0.5">
            <div v-for="(val, key) in record.inputs" :key="key" class="truncate">
              <span class="text-[#4b5563]">{{ key }}</span>: {{ val }}
            </div>
            <div v-if="record.outputs" class="mt-1 pt-1 border-t border-[#1f2937]">
              <div v-for="(val, key) in record.outputs" :key="'o-' + key" class="truncate text-[#00FF00]">
                → {{ key }}: <span class="font-mono">{{ val }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div
          v-if="!store.state.historyRecords.length"
          class="flex flex-col items-center justify-center py-12 text-[#4b5563]"
        >
          <svg class="w-12 h-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-sm">暂无历史记录</p>
          <p class="text-xs mt-1">完成计算后将自动保存</p>
        </div>
      </div>
    </aside>
  </Transition>
</template>

<script setup>
import calcStore from '../../stores/calcStore.js'

const store = calcStore()

/**
 * 格式化时间戳为简短中文格式
 * @param {string} isoString - ISO 格式时间字符串
 * @returns {string} 如 "13:45:22" 或 "昨天 08:30"
 */
function formatTime(isoString) {
  if (!isoString) return '-'
  try {
    const date = new Date(isoString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()

    if (isToday) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
    return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return '-'
  }
}
</script>

<style scoped>
/* 侧边栏遮罩过渡动画 */
.sidebar-overlay-enter-active,
.sidebar-overlay-leave-active {
  transition: opacity 0.25s ease;
}
.sidebar-overlay-enter-from,
.sidebar-overlay-leave-to {
  opacity: 0;
}

/* 侧边栏面板滑入/滑出动画 */
.sidebar-panel-enter-active,
.sidebar-panel-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.sidebar-panel-enter-from,
.sidebar-panel-leave-to {
  transform: translateX(100%);
}
</style>
