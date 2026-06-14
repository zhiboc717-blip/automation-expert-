<!--
  模块D：变频器线速度计算

  功能：
    - 三种计算方向：电机转速→线速度 / 频率→线速度 / 反向求解
    - 输入滚筒直径、减速比、极对数等
    - 自动换算 RPM 和 m/min 单位
-->

<template>
  <div class="card-panel space-y-5">
    <!-- 标题栏 -->
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-bold text-[#e5e7eb] flex items-center gap-2.5">
        <span class="text-xl">🌀</span> 变频器线速度
        <span class="text-xs px-2 py-0.5 rounded-full bg-[#3b82f6]/15 text-[#3b82f6] border border-[#3b82f6]/25">Module D</span>
      </h2>
      <button
        @click="$emit('open-formula', 'D')"
        class="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-[#1f2937] hover:bg-[#374151] text-[#FFD700] transition-colors cursor-pointer border-none"
        title="查看原理与公式"
      >📖 原理与公式</button>
    </div>

    <!-- 公共参数 -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="space-y-1">
        <label class="text-xs text-[#9ca3af] font-medium select-none">滚筒直径 (mm)</label>
        <NumberInput v-model="params.rollerDiameter" :placeholder="'如 120'" unit-label="mm" />
      </div>
      <div class="space-y-1">
        <label class="text-xs text-[#9ca3af] font-medium select-none">减速比</label>
        <NumberInput v-model="params.gearRatio" :placeholder="'如 10'" />
      </div>
      <div class="space-y-1">
        <label class="text-xs text-[#9ca3af] font-medium select-none">电机极对数</label>
        <NumberInput v-model="params.polePairs" :placeholder="'默认1对=2极'" />
      </div>
    </div>

    <!-- 计算方向选择 -->
    <div class="flex items-center gap-3 flex-wrap">
      <span class="text-xs text-[#4b5563] font-medium">推算方式：</span>
      <label class="inline-flex items-center gap-1.5 cursor-pointer">
        <input type="radio" value="motor" v-model="calcMode" class="accent-[#3b82f6]" checked />
        <span class="text-sm text-[#e5e7eb]">电机转速 → 线速度</span>
      </label>
      <label class="inline-flex items-center gap-1.5 cursor-pointer">
        <input type="radio" value="frequency" v-model="calcMode" class="accent-[#3b82f6]" />
        <span class="text-sm text-[#e5e7eb]">变频器频率 → 线速度</span>
      </label>
      <label class="inline-flex items-center gap-1.5 cursor-pointer">
        <input type="radio" value="reverse" v-model="calcMode" class="accent-[#3b82f6]" />
        <span class="text-sm text-[#e5e7eb]">反向：线速度 → 电机转速</span>
      </label>
    </div>

    <!-- 条件输入 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- 电机转速（motor模式） -->
      <div v-if="calcMode === 'motor'" class="space-y-1">
        <label class="text-xs text-[#9ca3af] font-medium select-none">电机转速 (RPM)</label>
        <NumberInput v-model="params.motorRpm" :placeholder="'如 1440'" unit-label="RPM" />
      </div>
      <!-- 变频器频率（frequency模式） -->
      <div v-if="calcMode === 'frequency'" class="space-y-1">
        <label class="text-xs text-[#9ca3af] font-medium select-none">变频器频率 (Hz)</label>
        <NumberInput v-model="params.vfdFrequency" :placeholder="'如 50'" unit-label="Hz" />
      </div>
      <!-- 目标线速度（reverse模式） -->
      <div v-if="calcMode === 'reverse'" class="space-y-1">
        <label class="text-xs text-[#9ca3af] font-medium select-none">目标线速度 (m/min)</label>
        <NumberInput v-model="params.targetLineSpeed" :placeholder="'如 50'" unit-label="m/min" />
      </div>
    </div>

    <!-- 开始计算 -->
    <CalcButton @calculate="handleCalculate" :loading="calculating" />

    <!-- 结果面板 -->
    <ResultPanel
      :result="resultData?.results || null"
      :error="resultData?.error || ''"
      module-name="模块D · 变频器线速度"
      :has-calculated="hasCalculated"
    />
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import NumberInput from '../common/NumberInput.vue'
import CalcButton from '../common/CalcButton.vue'
import ResultPanel from '../common/ResultPanel.vue'
import { calcModuleD } from '../../utils/calculations.js'

defineEmits(['open-formula'])

const params = reactive({
  rollerDiameter: undefined,
  gearRatio: undefined,
  polePairs: 1,
  motorRpm: undefined,
  vfdFrequency: undefined,
  targetLineSpeed: undefined
})

const calcMode = ref('motor')
const calculating = ref(false)
const resultData = ref(null)
const hasCalculated = ref(false)

function handleCalculate() {
  calculating.value = true

  setTimeout(() => {
    resultData.value = calcModuleD({
      rollerDiameter: params.rollerDiameter,
      gearRatio: params.gearRatio,
      polePairs: params.polePairs,
      motorRpm: params.motorRpm,
      vfdFrequency: params.vfdFrequency,
      targetLineSpeed: params.targetLineSpeed,
      calcMode: calcMode.value
    })

    hasCalculated.value = true
    calculating.value = false
  }, 80)
}

function getResult() {
  return {
    moduleName: '模块D·变频器线速度',
    inputs: { ...params, calcMode: calcMode.value },
    outputs: resultData.value?.success ? { ...resultData.value.results } : null,
    success: resultData.value?.success || false
  }
}

defineExpose({ getResult })
</script>
