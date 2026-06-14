<!--
  导航栏组件（固定顶部）

  包含：
    - 应用 Logo + 标题
    - UnitToggle 单位切换开关
    - 登录/用户状态
    - 打印总表按钮
-->

<template>
  <header class="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 bg-[#111827] border-b border-[#1f2937] no-print">
    <!-- 左侧：Logo + 标题 -->
    <div class="flex items-center gap-3">
      <router-link to="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <span class="text-2xl">⚙️</span>
        <h1 class="text-lg font-bold text-[#e5e7eb] whitespace-nowrap">
          自动化调试专家
        </h1>
      </router-link>
      <span class="hidden sm:inline-block text-xs text-[#4b5563] ml-2 px-2 py-0.5 rounded bg-[#1f2937]">v1.0</span>
    </div>

    <!-- 中间：单位切换 -->
    <div class="flex-1 flex justify-center max-w-md mx-4">
      <UnitToggle />
    </div>

    <!-- 右侧：功能按钮组 -->
    <nav class="flex items-center gap-3">
      <!-- 打印总表 -->
      <button
        @click="$emit('print')"
        title="打印参数总表"
        class="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-[#1f2937] hover:bg-[#374151] text-[#9ca3af] hover:text-[#e5e7eb] transition-colors cursor-pointer border border-transparent hover:border-[#3b82f6]"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        <span class="hidden md:inline">总表</span>
      </button>

      <!-- 历史记录 -->
      <router-link
        to="/history"
        class="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-[#1f2937] hover:bg-[#374151] text-[#9ca3af] hover:text-[#e5e7eb] transition-colors border border-transparent hover:border-[#3b82f6]"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="hidden md:inline">历史</span>
      </router-link>

      <!-- 用户登录/状态 -->
      <template v-if="supabase.isLoggedIn">
        <div class="flex items-center gap-2 pl-3 border-l border-[#1f2937]">
          <span class="text-sm text-[#00FF00]">{{ supabase.currentUser?.email?.slice(0, 12) }}...</span>
          <button
            @click="handleLogout"
            class="text-sm text-[#ef4444] hover:text-[#f87171] transition-colors cursor-pointer bg-transparent border-none"
          >
            退出
          </button>
        </div>
      </template>
      <template v-else>
        <router-link
          to="/login"
          class="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-[#3b82f6]/20 hover:bg-[#3b82f6]/30 text-[#3b82f6] transition-colors border border-[#3b82f6]/40"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span class="hidden md:inline">登录</span>
        </router-link>
      </template>
    </nav>
  </header>
</template>

<script setup>
import { defineEmits } from 'vue'
import UnitToggle from './UnitToggle.vue'
import { useSupabase } from '../../composables/useSupabase.js'

const supabase = useSupabase()
defineEmits(['print'])

/** 处理退出登录 */
async function handleLogout() {
  await supabase.signOut()
}
</script>
