<!--
  模块C：电子齿轮比计算 (GCD化简)

  功能：
    - 直线模式 / 旋转模式 切换
    - 输入伺服设定脉冲数、减速比等参数
    - 核心：自动通过 GCD 化简 B/A 为最简整数比
    - 高亮显示原始比值和化简后比值
-->

<template>
  <div class="card-panel space-y-5">
    <!-- 标题栏 -->
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-bold text-[#e5e7eb] flex items-center gap-2.5">
        <span class="text-xl">⚙️</span> 电子齿轮比计算
        <span class="text-xs px-2 py-0.5 rounded-full bg-[#00FF00]/15 text-[#00FF00] border border-[#00FF00]/25">核心 · Module C</span>
      </h2>
      <button
        @click="$emit('open-formula', 'C')"
        class="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-[#1f2937] hover:bg-[#374151] text-[#FFD700] transition-colors cursor-pointer border-none"
        title="查看原理与公式"
      >📖 原理与公式</button>
    </div>

    <!-- 模式切换 -->
    <div class="flex items-center gap-3 p-3 rounded-lg bg-[#0d1321] border border-[#1f2937]">
      <span class="text-xs text-[#9ca3af] font-medium">齿轮比模式：</span>
      <label class="inline-flex items-center gap-1.5 cursor-pointer">
        <input type="radio" value="linear" v-model="mode" class="accent-[#3b82f6]" checked />
        <span class="text-sm text-[#e5e7eb]">直线模式</span>
      </label>
      <label class="inline-flex items-center gap-1.5 cursor-pointer">
        <input type="radio" value="rotation" v-model="mode" class="accent-[#3b82f6]" />
        <span class="text-sm text-[#e5e7eb]">旋转模式</span>
      </label>
      <span class="ml-auto text-[10px] text-[#4b5563]">{{ mode === 'linear' ? '匹配外部编码器/光栅尺' : '编码器角度映射' }}</span>
    </div>

    <!-- 公共参数 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="space-y-1">
        <label class="text-xs text-[#9ca3af] font-medium select-none">伺服设定脉冲数</label>
        <NumberInput v-model="params.servoSetPulses" :placeholder="'如 10000'" />
      </div>
      <div class="space-y-1">
        <label class="text-xs text-[#9ca3af] font-medium select-none">减速比</label>
        <NumberInput v-model="params.gearRatio" :placeholder="'如 10'" />
      </div>
    </div>

    <!-- 直线模式特有参数 -->
    <div v-if="mode === 'linear'" class="space-y-1">
      <label class="text-xs text-[#9ca3af] font-medium select-none">用户期望发的一圈脉冲数</label>
      <NumberInput v-model="params.expectedPulsesPerRev" :position="'期望每圈的输出脉冲数'" />
      <p class="text-[10px] text-[#4b5563]">💡 例如：光栅尺每毫米1000个信号时，期望一圈发出多少脉冲</p>
    </div>

    <!-- 旋转模式特有参数 -->
    <div v-if="mode === 'rotation'" class="space-y-1">
      <label class="text-xs text-[#9ca3af] font-medium select-none">编码器原生分辨率 (线数)</label>
      <NumberInput v-model="params.encoderResolution" :placeholder="'如 2500 (即10000 ppr)'" />
      <p class="text-[10px] text-[#4b5563]">💡 编码器每转的线数（通常需乘以4得到 ppr）</p>
    </div>

    <!-- 开始计算 -->
    <CalcButton @calculate="handleCalculate" :loading="calculating" label="⚙ 计算 GCD 化简齿轮比" />

    <!-- 结果面板 -->
    <ResultPanel
      :result="resultData?.results || null"
      :error="resultData?.error || ''"
      module-name="模块C · 电子齿轮比(GCD)"
      :has-calculated="hasCalculated"
    />
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import NumberInput from '../common/NumberInput.vue'
import CalcButton from '../common/CalcButton.vue'
import ResultPanel from '../common/ResultPanel.vue'
import { calcModuleC } from '../../utils/calculations.js'

defineEmits(['open-formula'])

const params = reactive({
  servoSetPulses: undefined,
  gearRatio: undefined,
  expectedPulsesPerRev: undefined,
  encoderResolution: undefined
})

const mode = ref('linear')
const calculating = ref(false)
const resultData = ref(null)
const hasCalculated = ref(false)

function handleCalculate() {
  calculating.value = true

  setTimeout(() => {
    resultData.value = calcModuleC({
      mode: mode.value,
      servoSetPulses: params.servoSetPulses,
      gearRatio: params.gearRatio,
      expectedPulsesPerRev: params.expectedPulsesPerRev,
      encoderResolution: params.encoderResolution
    })

    hasCalculated.value = true
    calculating.value = false
  }, 80)
}

function getResult() {
  return {
    moduleName: '模块C·电子齿轮比',
    inputs: { ...params, mode: mode.value },
    outputs: resultData.value?.success ? { ...resultData.value.results } : null,
    success: resultData.value?.success || false
  }
}

defineExpose({ getResult })
</script>
