<!--
  AES-256 加密开关 Toggle 组件

  显示在备注编辑器旁，控制是否对备注内容进行 AES 加密存储。
-->

<template>
  <button
    @click="toggle"
    class="
      relative inline-flex h-6 w-11 items-center rounded-full
      transition-colors duration-200 ease-out cursor-pointer border-none
    "
    :class="encrypted ? 'bg-[#00FF00]/30' : 'bg-[#1f2937]'"
    :title="encrypted ? '已开启加密 — 点击关闭' : '未加密 — 点击开启 AES-256 加密'"
  >
    <!-- 滑块圆点 -->
    <span
      class="inline-block h-4 w-4 transform rounded-full transition-transform duration-200 ease-out"
      :class="encrypted
        ? 'translate-x-6 bg-[#00FF00]'
        : 'translate-x-1 bg-[#4b5563]'"
    ></span>

    <!-- 标签文字 -->
    <span class="ml-2 text-xs whitespace-nowrap select-none" :class="encrypted ? 'text-[#00FF00]' : 'text-[#4b5563]'">
      {{ encrypted ? '🔒 已加密' : '🔓 未加密' }}
    </span>
  </button>
</template>

<script setup>
import { defineModel, defineEmits } from 'vue'

/**
 * 双向绑定：encrypted 状态
 * 父组件通过 v-model:encrypted 绑定
 */
const encrypted = defineModel('encrypted', { type: Boolean })

const emit = defineEmits(['change'])

/** 切换加密状态 */
function toggle() {
  encrypted.value = !encrypted.value
  emit('change', encrypted.value)
}
</script>
