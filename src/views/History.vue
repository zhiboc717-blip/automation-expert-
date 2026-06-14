<!--
  历史记录页面

  功能：
    - 展示所有历史计算记录列表
    - 支持按模块筛选
    - 支持删除单条记录
    - 支持一键清空
    - 支持导出 CSV
    - 在线时从 Supabase 拉取 + 本地 IndexedDB 合并展示
-->

<template>
  <div class="min-h-screen p-4 md:p-6 lg:p-8 pt-20 no-print">
    <!-- 页面头部 -->
    <header class="mb-6 flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-2xl md:text-3xl font-extrabold text-[#e5e7eb] tracking-tight">
          📋 历史记录
        </h1>
        <p class="mt-1 text-sm text-[#9ca3af]">
          共 {{ displayRecords.length }} 条记录
          <span v-if="offlineSync" class="ml-2 text-xs text-[#4b5563]">
            (本地缓存 + 云端)
          </span>
        </p>
      </div>

      <!-- 操作按钮组 -->
      <div class="flex gap-3">
        <!-- 同步按钮 -->
        <button
          v-if="!supabase.isOfflineMode"
          @click="handleSync"
          class="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg bg-[#3b82f6]/15 hover:bg-[#3b82f6]/25 text-[#3b82f6] transition-colors cursor-pointer border border-[#3b82f6]/25"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          同步到云端
        </button>

        <!-- 导出CSV -->
        <button
          @click="handleExportCSV"
          :disabled="!displayRecords.length"
          class="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg bg-[#00FF00]/10 hover:bg-[#00FF00]/20 text-[#00FF00] transition-colors cursor-pointer border border-[#00FF00]/25 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          导出 CSV
        </button>

        <!-- 清空 -->
        <button
          @click="handleClearAll"
          :disabled="!displayRecords.length"
          class="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg bg-[#ef4444]/10 hover:bg-[#ef4444]/20 text-[#ef4444] transition-colors cursor-pointer border border-[#ef4444]/25 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          清空全部
        </button>
      </div>
    </header>

    <!-- 筛选栏 -->
    <div class="mb-4 flex items-center gap-3">
      <span class="text-xs text-[#4b5563] font-medium">按模块筛选：</span>
      <select
        v-model="filterModule"
        class="h-8 w-40 bg-[#0d1321] border border-[#1f2937] rounded-md text-xs text-[#e5e7eb] outline-none focus:border-[#3b82f6] cursor-pointer appearance-none pl-3 pr-8"
        style="background-image: url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2710%27 height=%2710%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%239ca3af%27 stroke-width=%272%27%3E%3Cpolyline points=%276,9 12,15 18,9%27/%3E%3C/svg%3E'); background-repeat: no-repeat; background-position: right 6px center;"
      >
        <option value="">全部模块</option>
        <option v-for="(modInfo, id) in MODULES" :key="id" :value="modInfo.name">
          {{ modInfo.icon }} {{ modInfo.name }}
        </option>
      </select>
    </div>

    <!-- 历史记录列表 -->
    <div class="space-y-3">
      <!-- 单条记录卡片 -->
      <TransitionGroup name="list-fade">
        <div
          v-for="record in displayRecords"
          :key="record.id || record._localId || record.timestamp"
          class="card-panel hover:border-[#374151] group transition-all"
        >
          <!-- 卡片头部：模块名 + 时间 + 删除 -->
          <div class="flex items-start justify-between mb-3">
            <div class="space-y-0.5">
              <div class="flex items-center gap-2">
                <span class="text-base font-bold text-[#3b82f6]">{{ record.moduleName || '未知模块' }}</span>
                <span
                  v-if="record.success === false"
                  class="text-[10px] px-1.5 py-0.5 rounded bg-[#ef4444]/15 text-[#ef4444]"
                >出错</span>
                <span
                  v-else
                  class="text-[10px] px-1.5 py-0.5 rounded bg-[#00FF00]/15 text-[#00FF00]"
                >成功</span>
              </div>
              <p class="text-xs text-[#4b5563]">{{ formatFullTime(record.timestamp) }}</p>
            </div>
            <button
              @click="handleDelete(record)"
              class="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[#ef4444]/20 text-[#4b5563] hover:text-[#ef4444] transition-all cursor-pointer bg-transparent border-none"
              title="删除此条记录"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <!-- 输入参数区 -->
          <div v-if="record.inputs && Object.keys(record.inputs).length" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-1 mb-2">
            <div v-for="(val, key) in record.inputs" :key="'in-' + key" class="text-xs truncate">
              <span class="text-[#4b5563]">{{ key }}</span>
              <span class="text-[#9ca3af] ml-1">{{ val }}</span>
            </div>
          </div>

          <!-- 结果区（折叠） -->
          <details v-if="record.outputs && Object.keys(record.outputs).length" class="group/details mt-2">
            <summary class="cursor-pointer text-xs text-[#00FF00] hover:text-[#00FF00]/80 select-none list-none flex items-center gap-1">
              <svg class="w-3 h-3 transition-transform group-open/details:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
              展开查看结果 ({{ Object.keys(record.outputs).length }} 项)
            </summary>
            <div class="mt-2 pl-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-1">
              <div v-for="(val, key) in record.outputs" :key="'out-' + key" class="text-xs truncate font-mono">
                <span class="text-[#4b5563]">{{ key }}</span>
                <span class="text-[#00FF00] ml-1">{{ val }}</span>
              </div>
            </div>
          </details>

          <!-- 备注 -->
          <p v-if="record.note" class="mt-2 pt-2 border-t border-[#1f2937] text-xs text-[#9ca3af] italic line-clamp-2">
            📝 {{ record.note.slice(0, 120) }}{{ record.note.length > 120 ? '...' : '' }}
          </p>
        </div>
      </TransitionGroup>

      <!-- 空状态 -->
      <div
        v-if="!displayRecords.length && !isLoadingRecords"
        class="card-panel flex flex-col items-center justify-center py-16 text-[#4b5563]"
      >
        <svg class="w-16 h-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <p class="text-base font-medium">暂无历史记录</p>
        <p class="text-sm mt-1">在首页完成计算并点击「保存记录」即可在此查看</p>
        <router-link
          to="/"
          class="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#3b82f6]/15 text-[#3b82f6] text-sm hover:bg-[#3b82f6]/25 transition-colors"
        >
          ← 回到计算器
        </router-link>
      </div>

      <!-- 加载中 -->
      <div v-if="isLoadingRecords" class="flex items-center justify-center py-12">
        <svg class="animate-spin h-6 w-6 text-[#3b82f6]" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.924 3 8.11l2.98-2.98A7.962 7.962 0 016 17.291z"></path>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { MODULES, calcStore as createStore } from '../stores/calcStore.js'
import { useOfflineSync } from '../composables/useOfflineSync.js'
import { useSupabase } from '../composables/useSupabase.js'
import { exportToCSV } from '../utils/exportUtils.js'

const store = createStore()
const offlineSync = useOfflineSync()
const supabase = useSupabase()

/** 是否正在加载 */
const isLoadingRecords = ref(false)
/** 当前筛选的模块 */
const filterModule = ref('')
/** 所有记录（本地+远程合并） */
const allRecords = ref([])

/**
 * 筛选后的记录列表
 */
const displayRecords = computed(() => {
  let records = allRecords.value
  if (filterModule.value) {
    records = records.filter(r => r.moduleName === filterModule.value)
  }
  return records
})

/**
 * 格式化完整时间字符串
 * @param {string} isoString - ISO 时间字符串
 * @returns {string}
 */
function formatFullTime(isoString) {
  if (!isoString) return '-'
  try {
    return new Date(isoString).toLocaleString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    })
  } catch {
    return '-'
  }
}

/**
 * 页面加载时获取所有历史记录
 * 合并本地 IndexedDB 和远程 Supabase 数据
 */
onMounted(async () => {
  isLoadingRecords.value = true

  try {
    // 1. 获取本地 IndexedDB 记录
    const localRecords = await offlineSync.getLocalHistory(200)
    const merged = [...localRecords]

    // 2. 如果在线且有登录态，拉取远程记录并去重合并
    if (!supabase.isOfflineMode && supabase.isLoggedIn) {
      try {
        const remoteRecords = await supabase.getCalcHistory(200)
        for (const rr of remoteRecords) {
          // 简单去重：根据 module_name + created_at 判断是否重复
          const exists = merged.some(
            lr => lr.moduleName === rr.module_name &&
                   Math.abs(new Date(lr.timestamp) - new Date(rr.created_at)) < 5000
          )
          if (!exists) {
            merged.push({
              id: rr.id,
              moduleName: rr.module_name,
              inputs: rr.inputs,
              outputs: rr.outputs,
              note: rr.note,
              timestamp: rr.created_at,
              success: true
            })
          }
        }
      } catch (e) {
        console.warn('[History] 远程记录加载失败:', e.message)
      }
    }

    // 3. 合并内存中的 store 记录（未持久化的）
    for (const sr of store.state.historyRecords) {
      const exists = merged.some(m =>
        m.id === sr.id ||
        (m.timestamp && m.timestamp === sr.timestamp)
      )
      if (!exists) merged.push(sr)
    }

    // 4. 按时间倒序排列
    merged.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))

    allRecords.value = merged
  } catch (error) {
    console.error('[History] 加载失败:', error)
  }

  isLoadingRecords.value = false
})

/**
 * 删除单条记录
 */
async function handleDelete(record) {
  if (!confirm(`确定要删除这条「${record.moduleName}」的记录吗？`)) return

  try {
    // 从 store 内存中移除
    store.state.historyRecords = store.state.historyRecords.filter(r => r !== record)

    // 从显示列表中移除
    const idx = allRecords.value.indexOf(record)
    if (idx !== -1) allRecords.value.splice(idx, 1)
  } catch (err) {
    alert('删除失败：' + err.message)
  }
}

/**
 * 清空全部记录
 */
async function handleClearAll() {
  if (!confirm('确定要清空所有历史记录吗？此操作不可撤销！')) return

  try {
    store.clearHistory()
    await offlineSync.clearLocalHistory()
    allRecords.value = []
  } catch (err) {
    alert('清空失败：' + err.message)
  }
}

/**
 * 导出 CSV
 */
function handleExportCSV() {
  exportToCSV(allRecords.value)
}

/**
 * 手动触发离线队列同步到云端
 */
async function handleSync() {
  if (supabase.isOfflineMode) {
    alert('当前处于离线模式，无法同步。')
    return
  }

  try {
    const result = await offlineSync.syncPendingItems()
    alert(
      `✅ 同步完成！\n成功：${result.synced} 条\n失败：${result.failed} 条`
    )

    // 刷新列表
    location.reload()
  } catch (err) {
    alert('同步失败：' + err.message)
  }
}
</script>

<style scoped>
/* 列表淡入动画 */
.list-fade-enter-active {
  transition: all 0.3s ease-out;
}
.list-fade-leave-active {
  transition: all 0.25s ease-in;
}
.list-fade-enter-from,
.list-fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

/* 折叠详情动画 */
details[open] summary svg {
  transform: rotate(90deg);
}
</style>
