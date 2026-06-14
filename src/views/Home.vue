<!--
  Home 主页面

  包含：
    - 模块导航标签页（A~F 六个模块切换）
    - 当前选中模块的表单 + 计算 + 结果展示
    - 备注编辑器 + 文件上传
    - 打印总表导出区域
    - Sidebar 侧边栏入口
-->

<template>
  <div class="min-h-screen p-4 md:p-6 lg:p-8 pt-20 no-print">
    <!-- 页面标题区 -->
    <header class="mb-6">
      <h1 class="text-2xl md:text-3xl font-extrabold text-[#e5e7eb] tracking-tight">
        ⚙️ 自动化调试专家
      </h1>
      <p class="mt-1.5 text-sm text-[#9ca3af]">
        工业自动化参数计算综合平台 — 脉冲 / 频率 / 齿轮比 / 线速度 / 同步 / Modbus
      </p>
    </header>

    <!-- 模块导航 Tab 栏 -->
    <nav class="mb-6 flex flex-wrap gap-2" role="tablist">
      <button
        v-for="(modInfo, id) in MODULES"
        :key="id"
        role="tab"
        @click="activeTab = id"
        :aria-selected="activeTab === id"
        class="
          relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer
          border-none flex items-center gap-2
        "
        :class="activeTab === id
          ? 'bg-gradient-to-br from-[#111827] to-[#1a2332] text-[#00FF00] shadow-lg shadow-black/30 ring-1 ring-[#00FF00]/25'
          : 'bg-[#111827]/50 text-[#9ca3af] hover:text-[#e5e7eb] hover:bg-[#1a2332] ring-1 ring-transparent'"
      >
        <span class="text-base">{{ modInfo.icon }}</span>
        <span class="hidden sm:inline">{{ modInfo.name }}</span>
        <span class="sm:hidden">模块{{ id }}</span>
      </button>
    </nav>

    <!-- 主内容网格：左侧模块 | 右侧备注+导出 -->
    <div class="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
      <!-- 左侧：当前模块计算区 -->
      <section class="space-y-5 min-w-0">
        <!-- 动态渲染当前选中的模块组件 -->
        <component
          :is="currentComponent"
          ref="moduleRef"
          @open-formula="openFormulaModal"
        />
      </section>

      <!-- 右侧：备注 + 导出 + 附件 -->
      <aside class="space-y-5 h-fit lg:sticky lg:top-20">
        <!-- Markdown 备注 -->
        <NoteEditor v-model:note-text="noteText" />

        <!-- 附件上传 -->
        <FileUpload @files-changed="onFilesChanged" />

        <!-- 参数总表导出 -->
        <PrintReport
          :all-modules-data="allModulesData"
          :history-records="store.state.historyRecords"
        />

        <!-- 快捷操作按钮 -->
        <div class="flex gap-3">
          <button
            @click="store.toggleSidebar()"
            class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#1f2937] hover:bg-[#374151] text-sm text-[#9ca3af] hover:text-[#e5e7eb] transition-colors cursor-pointer border border-[#1f2937]"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            历史侧边栏
          </button>
          <button
            @click="saveCurrentToHistory"
            class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#3b82f6]/15 hover:bg-[#3b82f6]/25 text-sm text-[#3b82f6] transition-colors cursor-pointer border border-[#3b82f6]/25"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            保存记录
          </button>
        </div>
      </aside>
    </div>

    <!-- 全局侧边栏 -->
    <Sidebar />
  </div>
</template>

<script setup>
import { ref, computed, shallowRef, markRaw } from 'vue'
import { MODULES, calcStore as createStore } from '../stores/calcStore.js'
import { useOfflineSync } from '../composables/useOfflineSync.js'
import ModuleA_PulseDistance from '../components/modules/ModuleA_PulseDistance.vue'
import ModuleB_FreqSpeed from '../components/modules/ModuleB_FreqSpeed.vue'
import ModuleC_GearRatio from '../components/modules/ModuleC_GearRatio.vue'
import ModuleD_VFDLineSpeed from '../components/modules/ModuleD_VFDLineSpeed.vue'
import ModuleE_RollerSync from '../components/modules/ModuleE_RollerSync.vue'
import ModuleF_AccelModbus from '../components/modules/ModuleF_AccelModbus.vue'
import NoteEditor from '../components/notes/NoteEditor.vue'
import FileUpload from '../components/notes/FileUpload.vue'
import PrintReport from '../components/export/PrintReport.vue'
import Sidebar from '../components/layout/Sidebar.vue'

// Store 和 composables
const store = createStore()
const offlineSync = useOfflineSync()

/** 当前激活的模块 Tab ID */
const activeTab = ref('A')

/** 各模块组件映射表 */
const componentMap = {
  A: () => markRaw(ModuleA_PulseDistance),
  B: () => markRaw(ModuleB_FreqSpeed),
  C: () => markRaw(ModuleC_GearRatio),
  D: () => markRaw(ModuleD_VFDLineSpeed),
  E: () => markRaw(ModuleE_RollerSync),
  F: () => markRaw(ModuleF_AccelModbus)
}

/** 当前要渲染的模块组件 */
const currentComponent = computed(() => componentMap[activeTab.value]?.())

/** 当前模块的 ref 引用（用于获取结果） */
const moduleRef = ref(null)

/** 备注文本 */
const noteText = ref('')

/**
 * 收集所有模块的计算结果数据（用于打印总表）
 * 遍历所有模块组件的 defineExpose().getResult()
 */
const allModulesData = computed(() => {
  const data = []
  for (const id of Object.keys(MODULES)) {
    data.push({
      moduleName: MODULES[id].name,
      inputs: store.state.moduleInputs[id],
      outputs: store.state.moduleResults[id]
    })
  }
  return data
})

/**
 * 打开公式弹窗
 * @param {string} moduleId
 */
function openFormulaModal(moduleId) {
  store.openFormulaModal(moduleId)
}

/**
 * 将当前模块的计算结果保存到历史记录
 * 同时写入 IndexedDB 本地存储
 */
async function saveCurrentToHistory() {
  try {
    // 通过 moduleRef 获取当前组件暴露的结果
    const currentResult = moduleRef.value?.getResult?.()
    if (!currentResult) {
      alert('请先完成一次计算再保存！')
      return
    }

    const record = {
      ...currentResult,
      note: noteText.value,
      timestamp: new Date().toISOString()
    }

    // 写入全局历史记录（内存）
    store.addHistoryRecord(record)

    // 写入 IndexedDB（离线持久化）
    await offlineSync.saveToLocal(record)

    // 如果在线，尝试同步到远程
    await offlineSync.queueForSync(record)

    alert(`✅ 已保存「${record.moduleName}」的计算记录！\n\n本地已缓存 ${store.state.historyRecords.length} 条。`)
  } catch (err) {
    console.error('[Home] 保存失败:', err)
    alert('❌ 保存失败：' + err.message)
  }
}

/** 文件上传回调 */
function onFilesChanged(files) {
  console.log('[Home] 已选择文件:', files.length, '个')
}
</script>
