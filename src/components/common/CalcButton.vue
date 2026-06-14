<!--
  巨型"开始计算"按钮组件

  视觉上醒目，带有发光效果。
  点击后触发父组件执行计算逻辑。

  Props:
    loading - 是否处于加载/计算状态
    label   - 自定义按钮文案（默认 "▶ 开始计算"）
-->

<template>
  <button
    type="button"
    @click="$emit('calculate')"
    :disabled="loading"
    class="
      group relative w-full py-4 px-8 rounded-xl
      text-lg font-bold tracking-wide
      transition-all duration-200 ease-out
      cursor-pointer border-none
      overflow-hidden
    "
    :class="loading
      ? 'bg-[#1f2937] text-[#4b5563] cursor-not-allowed'
      : 'bg-gradient-to-r from-[#00FF00]/20 via-[#00FF00]/10 to-[#00FF00]/20 text-[#00FF00] hover:from-[#00FF00]/30 hover:via-[#00FF20]/20 hover:to-[#00FF00]/30 active:scale-[0.98]'
    "
    style="border: 1px solid rgba(0, 255, 0, 0.25); box-shadow: 0 0 20px rgba(0, 255, 0, 0.08);"
  >
    <!-- 发光背景效果 -->
    <span
      v-if="!loading"
      class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      style="background: radial-gradient(circle at center, rgba(0,255,0,0.08), transparent 70%);"
    ></span>

    <!-- 按钮内容 -->
    <span class="relative flex items-center justify-center gap-2.5">
      <!-- 加载状态图标 -->
      <svg
        v-if="loading"
        class="animate-spin h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.924 3 8.11l2.98-2.98A7.962 7.962 0 016 17.291z"></path>
      </svg>

      <!-- 正常状态图标 -->
      <svg
        v-else
        class="w-5 h-5"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M8 5v14l11-7z"/>
      </svg>

      <span>{{ loading ? '计算中...' : (label || '开始计算') }}</span>
    </span>
  </button>
</template>

<script setup>
defineProps({
  /** 是否正在加载/计算中 */
  loading: {
    type: Boolean,
    default: false
  },
  /** 自定义按钮文案 */
  label: {
    type: String,
    default: ''
  }
})

defineEmits(['calculate'])
</script>
