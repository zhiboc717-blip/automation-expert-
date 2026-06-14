<!--
  模块A：脉冲与距离互算

  功能：
    - 滚筒/丝杆模式切换
    - 输入：滚筒直径(或导程)、电机单圈脉冲数、减速比
    - 计算方向：距离→脉冲 / 脉冲→距离
    - 显示进给常数、每当量脉冲、脉冲当量、目标结果
-->

<template>
  <div class="card-panel space-y-5">
    <!-- 模块标题栏 -->
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-bold text-[#e5e7eb] flex items-center gap-2.5">
        <span class="text-xl">📏</span> 脉冲与距离互算
        <span class="text-xs px-2 py-0.5 rounded-full bg-[#3b82f6]/15 text-[#3b82f6] border border-[#3b82f6]/25">Module A</span>
      </h2>
      <button
        @click="$emit('open-formula', 'A')"
        class="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-[#1f2937] hover:bg-[#374151] text-[#FFD700] transition-colors cursor-pointer border-none"
        title="查看原理与公式"
      >
        📖 原理与公式
      </button>
    </div>

    <!-- 基础参数区 -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <!-- 滚筒直径 / 导程 -->
      <div class="space-y-1">
        <label class="text-xs text-[#9ca3af] font-medium select-none">
          {{ isLeadScrew ? '丝杆导程' : '滚筒直径' }} (mm)
        </label>
        <NumberInput v-model="params.rollerDiameter" :placeholder="'如 60'" unit-label="mm" />
      </div>

      <!-- 电机单圈脉冲数 -->
      <div class="space-y-1">
        <label class="text-xs text-[#9ca3af] font-medium select-none">电机单圈脉冲数</label>
        <NumberInput v-model="params.motorPulsesPerRev" :placeholder="'如 10000'" />
      </div>

      <!-- 减速比 -->
      <div class="space-y-1">
        <label class="text-xs text-[#9ca3af] font-medium select-none">减速比</label>
        <NumberInput v-model="params.gearRatio" :placeholder="'如 10'" />
      </div>
    </div>

    <!-- 模式选择：滚筒 / 丝杆 + 计算方向 -->
    <div class="flex flex-wrap items-center gap-4">
      <!-- 滚筒/丝杆切换 -->
      <label class="flex items-center gap-2 cursor-pointer group">
        <input
          type="checkbox"
          v-model="isLeadScrew"
          class="w-4 h-4 rounded border-[#1f2937] bg-[#0d1321] accent-[#3b82f6]"
        />
        <span class="text-sm text-[#9ca3af] group-hover:text-[#e5e7eb] transition-colors">丝杆模式（L=导程）</span>
      </label>

      <!-- 计算方向选择 -->
      <div class="flex items-center gap-2 ml-auto">
        <span class="text-xs text-[#4b5563] mr-1">计算方向：</span>
        <select v-model="calcMode" class="w-36 h-8 text-sm bg-[#0d1321] border border-[#1f2937] rounded-md text-[#e5e7eb] outline-none focus:border-[#3b82f6] cursor-pointer appearance-none pl-2 pr-6"
          style="background-image: url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2710%27 height=%2710%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%239ca3af%27 stroke-width=%272%27%3E%3Cpolyline points=%276,9 12,15 18,9%27/%3E%3C/svg%3E'); background-repeat: no-repeat; background-position: right 6px center;">
          <option value="distance">已知距离 → 脉冲</option>
          <option value="pulses">已知脉冲 → 距离</option>
        </select>
      </div>
    </div>

    <!-- 条件输入：根据 calcMode 动态显示 -->
    <div v-if="calcMode === 'distance'" class="space-y-1">
      <label class="text-xs text-[#9ca3af] font-medium select-none">目标移动距离 (mm)</label>
      <NumberInput v-model="params.targetDistance" placeholder="请输入目标距离" unit-label="mm" />
    </div>
    <div v-if="calcMode === 'pulses'" class="space-y-1">
      <label class="text-xs text-[#9ca3af] font-medium select-none">累计脉冲量 (Pulse)</label>
      <NumberInput v-model="params.totalPulses" placeholder="请输入累计脉冲量" />
    </div>

    <!-- 开始计算按钮 -->
    <CalcButton @calculate="handleCalculate" :loading="calculating" />

    <!-- 结果面板 -->
    <ResultPanel
      :result="resultData?.results || null"
      :error="resultData?.error || ''"
      module-name="模块A · 脉冲与距离互算"
      :has-calculated="hasCalculated"
    />
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import NumberInput from '../common/NumberInput.vue'
import CalcButton from '../common/CalcButton.vue'
import ResultPanel from '../common/ResultPanel.vue'
import { calcModuleA } from '../../utils/calculations.js'

defineEmits(['open-formula'])

/** 表单参数 */
const params = reactive({
  rollerDiameter: undefined,
  motorPulsesPerRev: undefined,
  gearRatio: undefined,
  targetDistance: undefined,
  totalPulses: undefined
})

/** 是否为丝杆模式 */
const isLeadScrew = ref(false)
/** 计算方向 */
const calcMode = ref('distance')
/** 是否正在计算 */
const calculating = ref(false)
/** 计算结果 */
const resultData = ref(null)
/** 是否已执行过计算 */
const hasCalculated = ref(false)

/**
 * 执行计算 — 点击"开始计算"时触发
 * 核心交互红线：只有点击后才显示结果，不实时抖动！
 */
function handleCalculate() {
  calculating.value = true

  // 短暂延迟让用户看到 loading 状态（体验优化）
  setTimeout(() => {
    resultData.value = calcModuleA({
      rollerDiameter: params.rollerDiameter,
      motorPulsesPerRev: params.motorPulsesPerRev,
      gearRatio: params.gearRatio,
      isLeadScrew: isLeadScrew.value,
      calcMode: calcMode.value,
      targetDistance: params.targetDistance,
      totalPulses: params.totalPulses
    })

    hasCalculated.value = true
    calculating.value = false

    // 将结果传递给父组件（用于历史记录和总表）
    if (resultData.value.success) {
      // 通过自定义事件通知父组件
    }
  }, 80)
}

/**
 * 暴露给外部获取当前计算结果的接口
 */
function getResult() {
  return {
    moduleName: '模块A·脉冲与距离互算',
    inputs: { ...params, isLeadScrew: isLeadScrew.value, calcMode: calcMode.value },
    outputs: resultData.value?.success ? { ...resultData.value.results } : null,
    success: resultData.value?.success || false
  }
}

// 暴露方法供父组件调用
defineExpose({ getResult })
</script>
