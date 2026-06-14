<!--
  单位系统全局切换开关

  公制(mm/m) ↔ 英制(inch)
  切换时自动保存到 localStorage
-->

<template>
  <button
    @click="unit.toggleUnit()"
    class="flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all duration-200 cursor-pointer"
    :class="unit.isMetric.value
      ? 'border-[#00FF00]/40 bg-[#00FF00]/10 text-[#00FF00] hover:border-[#00FF00]'
      : 'border-[#FFD700]/40 bg-[#FFD700]/10 text-[#FFD700] hover:border-[#FFD700]'"
    :title="'当前：' + unit.unitLabel.value + ' (点击切换)'"
  >
    <!-- 指示灯 -->
    <span
      class="w-2 h-2 rounded-full animate-pulse"
      :class="unit.isMetric.value ? 'bg-[#00FF00]' : 'bg-[#FFD700]'"
    ></span>
    <!-- 单位标签 -->
    <span class="text-sm font-medium select-none">
      {{ unit.isMetric.value ? '公制 mm/m' : '英制 inch' }}
    </span>
    <!-- 切换图标 -->
    <svg class="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  </button>
</template>

<script setup>
/**
 * 单位切换按钮组件
 * 显示当前单位系统，点击可切换公制/英制
 */
import { useUnitSystem } from '../../composables/useUnitSystem.js'

const unit = useUnitSystem()
</script>
