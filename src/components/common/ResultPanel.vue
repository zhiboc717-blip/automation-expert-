<!--
  结果展示面板

  在用户点击"开始计算"后显示计算结果。
  使用荧光绿高亮结果数值，工业风表格布局。

  Props:
    result     - 计算结果对象（null 时隐藏面板）
    error      - 错误信息字符串（如有错误则显示红色警告）
    moduleName - 当前模块名称（用于标题）
-->

<template>
  <Transition name="result-fade">
    <div v-if="error || (result && hasCalculated)" class="mt-5 space-y-3 animate-fade-in-up">
      <!-- 错误提示面板 -->
      <div
        v-if="error"
        class="p-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 flex items-start gap-3"
      >
        <svg class="w-5 h-5 text-[#ef4444] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p class="text-sm font-semibold text-[#ef4444]">计算出错</p>
          <p class="text-xs text-[#fca5a5] mt-1">{{ error }}</p>
        </div>
      </div>

      <!-- 成功结果面板 -->
      <div
        v-if="!error && result"
        class="rounded-xl bg-[#0d1321] border border-[#1f2937] overflow-hidden"
      >
        <!-- 结果头部 -->
        <div class="flex items-center gap-2 px-4 py-3 bg-[#111827] border-b border-[#1f2937]">
          <span class="w-2 h-2 rounded-full bg-[#00FF00] animate-pulse"></span>
          <h4 class="text-sm font-bold text-[#e5e7eb]">
            {{ moduleName || '计算结果' }}
          </h4>
          <span class="ml-auto text-xs text-[#4b5563] font-mono">
            {{ new Date().toLocaleTimeString('zh-CN') }}
          </span>
        </div>

        <!-- 结果键值对表格 -->
        <div class="divide-y divide-[#1f2937]">
          <div
            v-for="(value, key) in displayResults"
            :key="key"
            class="grid grid-cols-[140px_1fr] gap-x-4 gap-y-0.5 px-4 py-2.5 items-baseline hover:bg-[#1a2332]/50 transition-colors"
          >
            <!-- 参数名 -->
            <label
              class="text-xs text-[#9ca3af] truncate select-none"
              :title="key"
            >{{ formatKey(key) }}</label>

            <!-- 数值 -->
            <span
              class="text-sm font-mono break-all"
              :class="isResultKey(key) ? 'result-glow' : 'text-[#e5e7eb]'"
            >{{ formatValue(value) }}</span>
          </div>
        </div>

        <!-- 备注/说明区域（如果有 note 字段） -->
        <div
          v-if="result.note || result.formulaNote || result.modbusNote || result.inputsSummary"
          class="px-4 py-3 bg-[#111827]/50 border-t border-[#1f2937]"
        >
          <p
            v-if="result.note"
            class="text-xs text-[#FFD700] flex items-start gap-1.5"
          >
            <span>💡</span><span>{{ result.note }}</span>
          </p>
          <p
            v-if="result.formulaNote"
            class="text-xs text-[#9ca3af] mt-1.5 font-mono"
          >📐 {{ result.formulaNote }}</p>
          <p
            v-if="result.modbusNote"
            class="text-xs text-[#3b82f6] mt-1.5"
          >🔗 {{ result.modbusNote }}</p>
          <p
            v-if="result.inputsSummary"
            class="text-xs text-[#4b5563] mt-1.5"
          >📋 {{ result.inputsSummary }}</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** 计算成功时的结果对象 */
  result: {
    type: Object,
    default: null
  },
  /** 计算失败时的错误信息 */
  error: {
    type: String,
    default: ''
  },
  /** 当前模块名称 */
  moduleName: {
    type: String,
    default: ''
  },
  /** 是否已经执行过计算（控制面板显示） */
  hasCalculated: {
    type: Boolean,
    default: false
  }
})

/**
 * 过滤掉内部元数据字段，仅显示用户关心的结果
 */
const displayResults = computed(() => {
  if (!props.result) return {}

  const excludeKeys = ['note', 'formulaNote', 'modbusNote', 'inputsSummary', 'calcModeLabel']
  const filtered = {}

  for (const [key, value] of Object.entries(props.result)) {
    if (!excludeKeys.includes(key)) {
      filtered[key] = value
    }
  }

  return filtered
})

/**
 * 判断某个 key 是否属于核心计算结果（用荧光绿高亮）
 * @param {string} key
 * @returns {boolean}
 */
function isResultKey(key) {
  const highlightPatterns = [
    /targetTotal/i, /actualDist/i, /sendFreq/i, /actualSpeed/i,
    /lineSpeed/i, /syncRatio|slaveTarget/, /accelSlope|decelSlope/,
    /hexAddress|physicalAddr/, /simplified_[AB]|gearRatioDisplay/,
    /rollerRpm/i, /requiredMotor/
  ]
  return highlightPatterns.some(pattern => pattern.test(key))
}

/**
 * 格式化键名：下划线转中文友好显示
 * @param {string} key
 * @returns {string}
 */
function formatKey(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^\w/, c => c.toUpperCase())
    .trim()
}

/**
 * 格式化数值输出
 * @param {*} value
 * @returns {string}
 */
function formatValue(value) {
  if (value == null) return '-'
  if (typeof value === 'number') {
    // 大数值用千分位逗号分隔
    if (Math.abs(value) >= 10000) {
      return value.toLocaleString('zh-CN')
    }
    return String(value)
  }
  return String(value)
}
</script>

<style scoped>
/* 结果面板淡入动画 */
.result-fade-enter-active {
  transition: all 0.35s ease-out;
}
.result-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
</style>
