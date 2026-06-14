<!--
  模块E：大小滚轴同步跟随

  功能：
    - 输入主机/从机滚轴直径
    - 计算同步倍率 K = D主机/D从机
    - 可选：输入主机当前频率 → 自动计算从机目标频率
-->

<template>
  <div class="card-panel space-y-5">
    <!-- 标题栏 -->
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-bold text-[#e5e7eb] flex items-center gap-2.5">
        <span class="text-xl">🔗</span> 大小滚轴同步
        <span class="text-xs px-2 py-0.5 rounded-full bg-[#3b82f6]/15 text-[#3b82f6] border border-[#3b82f6]/25">Module E</span>
      </h2>
      <button
        @click="$emit('open-formula', 'E')"
        class="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-[#1f2937] hover:bg-[#374151] text-[#FFD700] transition-colors cursor-pointer border-none"
        title="查看原理与公式"
      >📖 原理与公式</button>
    </div>

    <!-- 滚轴直径输入 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="space-y-1">
        <label class="text-xs text-[#9ca3af] font-medium select-none">主机滚轴直径 (mm)</label>
        <NumberInput v-model="params.masterRollerDiameter" :placeholder="'如 200'" unit-label="mm" />
      </div>
      <div class="space-y-1">
        <label class="text-xs text-[#9ca3af] font-medium select-none">从机滚轴直径 (mm)</label>
        <NumberInput v-model="params.slaveRollerDiameter" :placeholder="'如 100'" unit-label="mm" />
      </div>
    </div>

    <!-- 可选：主机频率 -->
    <div class="p-3 rounded-lg bg-[#0d1321] border border-dashed border-[#1f2937] space-y-2">
      <p class="text-xs text-[#FFD700] font-medium flex items-center gap-1.5">
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        可选 — 输入主机实时频率以计算从机目标频率
      </p>
      <div class="max-w-sm">
        <NumberInput
          v-model="params.masterCurrentFreq"
          :placeholder="'留空则仅计算同步倍率'"
          unit-label="Hz"
        />
      </div>
    </div>

    <!-- 开始计算 -->
    <CalcButton @calculate="handleCalculate" :loading="calculating" />

    <!-- 结果面板 -->
    <ResultPanel
      :result="resultData?.results || null"
      :error="resultData?.error || ''"
      module-name="模块E · 大小滚轴同步"
      :has-calculated="hasCalculated"
    />
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import NumberInput from '../common/NumberInput.vue'
import CalcButton from '../common/CalcButton.vue'
import ResultPanel from '../common/ResultPanel.vue'
import { calcModuleE } from '../../utils/calculations.js'

defineEmits(['open-formula'])

const params = reactive({
  masterRollerDiameter: undefined,
  slaveRollerDiameter: undefined,
  masterCurrentFreq: undefined
})

const calculating = ref(false)
const resultData = ref(null)
const hasCalculated = ref(false)

function handleCalculate() {
  calculating.value = true

  setTimeout(() => {
    resultData.value = calcModuleE({
      masterRollerDiameter: params.masterRollerDiameter,
      slaveRollerDiameter: params.slaveRollerDiameter,
      masterCurrentFreq: params.masterCurrentFreq
    })

    hasCalculated.value = true
    calculating.value = false
  }, 80)
}

function getResult() {
  return {
    moduleName: '模块E·大小滚轴同步',
    inputs: { ...params },
    outputs: resultData.value?.success ? { ...resultData.value.results } : null,
    success: resultData.value?.success || false
  }
}

defineExpose({ getResult })
</script>
