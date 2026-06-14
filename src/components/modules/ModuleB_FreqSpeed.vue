<!--
  模块B：频率与速度互算

  功能：
    - 输入：每当量脉冲、速度值或频率值
    - 单位选择：mm/s 或 m/min
    - 计算方向：速度→频率 / 频率→速度
-->

<template>
  <div class="card-panel space-y-5">
    <!-- 模块标题栏 -->
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-bold text-[#e5e7eb] flex items-center gap-2.5">
        <span class="text-xl">🔄</span> 频率与速度互算
        <span class="text-xs px-2 py-0.5 rounded-full bg-[#3b82f6]/15 text-[#3b82f6] border border-[#3b82f6]/25">Module B</span>
      </h2>
      <button
        @click="$emit('open-formula', 'B')"
        class="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-[#1f2937] hover:bg-[#374151] text-[#FFD700] transition-colors cursor-pointer border-none"
        title="查看原理与公式"
      >📖 原理与公式</button>
    </div>

    <!-- 基础参数 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- 每当量脉冲 -->
      <div class="space-y-1">
        <label class="text-xs text-[#9ca3af] font-medium select-none">每当量脉冲 (Pulse/mm)</label>
        <NumberInput v-model="params.pulsesPerMm" :placeholder="'来自模块A的计算结果'" />
        <p class="text-[10px] text-[#4b5563] mt-0.5">💡 通常由模块A计算得出，也可手动输入</p>
      </div>

      <!-- 计算方向 & 速度单位 -->
      <div class="space-y-1">
        <label class="text-xs text-[#9ca3af] font-medium select-none">计算方向</label>
        <div class="flex gap-2">
          <select v-model="calcMode" class="flex-1 h-[42px] bg-[#0d1321] border border-[#1f2937] rounded-md text-sm text-[#e5e7eb] outline-none focus:border-[#3b82f6] cursor-pointer appearance-none pl-3 pr-8"
            style="background-image: url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2710%27 height=%2710%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%239ca3af%27 stroke-width=%272%27%3E%3Cpolyline points=%276,9 12,15 18,9%27/%3E%3C/svg%3E'); background-repeat: no-repeat; background-position: right 6px center;">
            <option value="speedToFreq">速度 → 频率</option>
            <option value="freqToSpeed">频率 → 速度</option>
          </select>
          <select v-model="speedUnit" class="w-28 h-[42px] bg-[#0d1321] border border-[#1f2937] rounded-md text-sm text-[#e5e7eb] outline-none focus:border-[#3b82f6] cursor-pointer appearance-none pl-3 pr-8"
            style="background-image: url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2710%27 height=%2710%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%239ca3af%27 stroke-width=%272%27%3E%3Cpolyline points=%276,9 12,15 18,9%27/%3E%3C/svg%3E'); background-repeat: no-repeat; background-position: right 6px center;">
            <option value="mm_s">mm/s</option>
            <option value="m_min">m/min</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 条件输入 -->
    <div v-if="calcMode === 'speedToFreq'" class="space-y-1">
      <label class="text-xs text-[#9ca3af] font-medium select-none">目标速度 ({{ speedUnit === 'm_min' ? 'm/min' : 'mm/s' }})</label>
      <NumberInput v-model="params.targetSpeed" :placeholder="'请输入目标速度'" :unit-label="speedUnit === 'm_min' ? 'm/min' : 'mm/s'" />
    </div>
    <div v-if="calcMode === 'freqToSpeed'" class="space-y-1">
      <label class="text-xs text-[#9ca3af] font-medium select-none">当前频率 (Hz)</label>
      <NumberInput v-model="params.currentFreq" :placeholder="'请输入当前频率'" unit-label="Hz" />
    </div>

    <!-- 开始计算按钮 -->
    <CalcButton @calculate="handleCalculate" :loading="calculating" />

    <!-- 结果面板 -->
    <ResultPanel
      :result="resultData?.results || null"
      :error="resultData?.error || ''"
      module-name="模块B · 频率与速度互算"
      :has-calculated="hasCalculated"
    />
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import NumberInput from '../common/NumberInput.vue'
import CalcButton from '../common/CalcButton.vue'
import ResultPanel from '../common/ResultPanel.vue'
import { calcModuleB } from '../../utils/calculations.js'

defineEmits(['open-formula'])

const params = reactive({
  pulsesPerMm: undefined,
  targetSpeed: undefined,
  currentFreq: undefined
})

const calcMode = ref('speedToFreq')
const speedUnit = ref('mm_s')
const calculating = ref(false)
const resultData = ref(null)
const hasCalculated = ref(false)

function handleCalculate() {
  calculating.value = true

  setTimeout(() => {
    resultData.value = calcModuleB({
      pulsesPerMm: params.pulsesPerMm,
      calcMode: calcMode.value,
      speedUnit: speedUnit.value,
      targetSpeed: params.targetSpeed,
      currentFreq: params.currentFreq
    })

    hasCalculated.value = true
    calculating.value = false
  }, 80)
}

function getResult() {
  return {
    moduleName: '模块B·频率与速度互算',
    inputs: { ...params, calcMode: calcMode.value, speedUnit: speedUnit.value },
    outputs: resultData.value?.success ? { ...resultData.value.results } : null,
    success: resultData.value?.success || false
  }
}

defineExpose({ getResult })
</script>
