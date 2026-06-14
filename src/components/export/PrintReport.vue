<!--
  参数总表打印 / PDF 导出组件

  汇总当前所有模块的输入参数和计算结果，
  提供打印和 CSV 导出功能。

  Props:
    allModulesData - 所有模块数据数组 [{ moduleName, inputs, outputs }, ...]
-->

<template>
  <div class="card-panel space-y-4 no-print">
    <div class="flex items-center justify-between">
      <h3 class="text-base font-bold text-[#e5e7eb] flex items-center gap-2">
        <svg class="w-5 h-5 text-[#3b82f6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z" />
        </svg>
        参数总表导出
      </h3>
      <span class="text-xs text-[#4b5563]">
        {{ allModulesData.filter(m => m && m.outputs).length }}/{{ allModulesData.length }} 模块有结果
      </span>
    </div>

    <!-- 数据预览摘要 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
      <div
        v-for="(mod, idx) in allModulesData"
        :key="idx"
        v-if="mod"
        class="p-2.5 rounded-lg bg-[#0d1321] border border-[#1f2937]"
      >
        <p class="font-medium text-[#3b82f6] mb-1">{{ mod.moduleName || `模块${idx}` }}</p>
        <p class="text-[#4b5563]">
          输入: {{ mod.inputs ? Object.keys(mod.inputs).length : 0 }} 项
          <span class="mx-1">|</span>
          结果: {{ mod.outputs ? Object.keys(mod.outputs).length : 0 }} 项
        </p>
      </div>
    </div>

    <!-- 操作按钮组 -->
    <div class="flex gap-3 pt-2">
      <!-- 打印报表 -->
      <button
        @click="handlePrint"
        :disabled="!hasAnyResult"
        class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer border-none disabled:opacity-40 disabled:cursor-not-allowed"
        :class="hasAnyResult
          ? 'bg-[#3b82f6]/20 text-[#3b82f6] hover:bg-[#3b82f6]/30 border border-[#3b82f6]/40'
          : 'bg-[#1f2937] text-[#4b5563] border border-[#1f2937]'"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z" />
        </svg>
        打印参数总表
      </button>

      <!-- CSV 导出 -->
      <button
        @click="handleExportCSV"
        :disabled="!historyRecords.length"
        class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer border-none disabled:opacity-40 disabled:cursor-not-allowed"
        :class="historyRecords.length
          ? 'bg-[#00FF00]/10 text-[#00FF00] hover:bg-[#00FF00]/20 border border-[#00FF00]/25'
          : 'bg-[#1f2937] text-[#4b5563] border border-[#1f2937]'"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        导出历史 CSV
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { generatePrintReport, exportToCSV } from '../../utils/exportUtils.js'

const props = defineProps({
  /** 所有模块的数据汇总 */
  allModulesData: {
    type: Array,
    default: () => []
  },
  /** 历史记录列表（用于CSV导出） */
  historyRecords: {
    type: Array,
    default: () => []
  }
})

/** 是否至少有一个模块有结果 */
const hasAnyResult = computed(() =>
  props.allModulesData.some(m => m != null && m.outputs != null && Object.keys(m.outputs).length > 0)
)

/** 触发打印参数总表 */
function handlePrint() {
  generatePrintReport(props.allModulesData)
}

/** 触发 CSV 导出 */
function handleExportCSV() {
  exportToCSV(props.historyRecords)
}
</script>
