<!--
  模块F：加减速与 Modbus 地址换算

  功能：
    - 加减速斜率计算：Fmax / T_acc
    - Modbus 十六进制地址换算（4xxxxx / 3xxxxx 格式）
-->

<template>
  <div class="card-panel space-y-5">
    <!-- 标题栏 -->
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-bold text-[#e5e7eb] flex items-center gap-2.5">
        <span class="text-xl">📡</span> 加减速 & Modbus 地址
        <span class="text-xs px-2 py-0.5 rounded-full bg-[#3b82f6]/15 text-[#3b82f6] border border-[#3b82f6]/25">Module F</span>
      </h2>
      <button
        @click="$emit('open-formula', 'F')"
        class="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-[#1f2937] hover:bg-[#374151] text-[#FFD700] transition-colors cursor-pointer border-none"
        title="查看原理与公式"
      >📖 原理与公式</button>
    </div>

    <!-- 分区标题：加减速参数 -->
    <div class="pt-2 pb-1 border-b border-[#1f2937]">
      <h3 class="text-sm font-semibold text-[#FFD700] flex items-center gap-1.5">
        📐 加减速斜率计算
      </h3>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="space-y-1">
        <label class="text-xs text-[#9ca3af] font-medium select-none">目标最高频率 (Hz)</label>
        <NumberInput v-model="params.targetMaxFreq" :placeholder="'如 5000'" unit-label="Hz" />
      </div>
      <div class="space-y-1">
        <label class="text-xs text-[#9ca3af] font-medium select-none">加速时间 (秒)</label>
        <NumberInput v-model="params.accelTime" :placeholder="'如 0.5'" unit-label="s" />
      </div>
      <div class="space-y-1">
        <label class="text-xs text-[#9ca3af] font-medium select-none">减速时间 (秒，可选)</label>
        <NumberInput
          v-model="params.decelTime"
          :placeholder="'不填则同加速时间'"
          unit-label="s"
        />
        <p class="text-[10px] text-[#4b5563] mt-0.5">留空时自动使用加速时间值</p>
      </div>
    </div>

    <!-- 分区标题：Modbus地址 -->
    <div class="pt-4 pb-1 border-b border-[#1f2937] mt-2">
      <h3 class="text-sm font-semibold text-[#3b82f6] flex items-center gap-1.5">
        🔗 Modbus 十六进制地址换算
      </h3>
    </div>

    <div class="space-y-1 max-w-md">
      <label class="text-xs text-[#9ca3af] font-medium select-none">Modbus 地址（3xxxxx 或 4xxxxx）</label>
      <input
        type="text"
        v-model="modbusAddressStr"
        placeholder="例如：40001、40100、30002"
        class="h-[42px] px-3 bg-[#0d1321] border border-[#1f2937] rounded-lg text-sm text-[#e5e7eb] font-mono outline-none focus:border-[#3b82f6] focus:shadow-[0_0_0_2px_rgba(59,130,246,0.15)] placeholder-[#4b5563]"
      />
      <p class="text-[10px] text-[#4b5563]">
        💡 输入格式：4xxxxx（保持寄存器）或 3xxxxx（输入寄存器），自动转为物理地址和十六进制
      </p>
    </div>

    <!-- 开始计算 -->
    <CalcButton @calculate="handleCalculate" :loading="calculating" />

    <!-- 结果面板 -->
    <ResultPanel
      :result="resultData?.results || null"
      :error="resultData?.error || ''"
      module-name="模块F · 加减速与Modbus地址"
      :has-calculated="hasCalculated"
    />
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import NumberInput from '../common/NumberInput.vue'
import CalcButton from '../common/CalcButton.vue'
import ResultPanel from '../common/ResultPanel.vue'
import { calcModuleF } from '../../utils/calculations.js'

defineEmits(['open-formula'])

const params = reactive({
  targetMaxFreq: undefined,
  accelTime: undefined,
  decelTime: undefined
})

/** Modbus 地址字符串（文本输入） */
const modbusAddressStr = ref('')
const calculating = ref(false)
const resultData = ref(null)
const hasCalculated = ref(false)

function handleCalculate() {
  calculating.value = true

  // 解析 Modbus 地址：如果是纯数字则保留原样，否则传字符串
  let modbusAddr = modbusAddressStr.value.trim()
  if (modbusAddr === '') modbusAddr = undefined

  setTimeout(() => {
    resultData.value = calcModuleF({
      targetMaxFreq: params.targetMaxFreq,
      accelTime: params.accelTime,
      decelTime: params.decelTime,
      modbusAddress: modbusAddr
    })

    hasCalculated.value = true
    calculating.value = false
  }, 80)
}

function getResult() {
  return {
    moduleName: '模块F·加减速与Modbus',
    inputs: { ...params, modbusAddress: modbusAddressStr.value.trim() || undefined },
    outputs: resultData.value?.success ? { ...resultData.value.results } : null,
    success: resultData.value?.success || false
  }
}

defineExpose({ getResult })
</script>
