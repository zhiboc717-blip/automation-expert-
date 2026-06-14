<!--
  登录/注册页面

  使用 Supabase Auth 进行邮箱密码登录。
  未配置 Supabase 时显示"离线模式"提示，引导用户配置 .env。
-->

<template>
  <div class="min-h-screen flex items-center justify-center p-6 bg-[#0a0e17]">
    <div class="w-full max-w-md space-y-8">
      <!-- Logo 和标题 -->
      <div class="text-center space-y-3">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#111827] border border-[#1f2937] text-4xl">
          ⚙️
        </div>
        <h1 class="text-2xl font-bold text-[#e5e7eb]">登录 / 注册</h1>
        <p class="text-sm text-[#9ca3af]">
          登录后可云端同步计算历史和附件<br/>
          <span v-if="supabase.isOfflineMode" class="text-[#FFD700]">当前为离线模式 — 计算器功能完全可用</span>
        </p>
      </div>

      <!-- 登录表单卡片 -->
      <div class="card-panel space-y-5">
        <!-- 离线模式提示 -->
        <div
          v-if="supabase.isOfflineMode"
          class="p-3 rounded-lg bg-[#FFD700]/10 border border-[#FFD700]/25 text-sm text-[#FFD700]"
        >
          <p>📡 未检测到 Supabase 配置</p>
          <p class="mt-1 text-xs opacity-80">请在项目根目录创建 <code class="bg-black/30 px-1.5 py-0.5 rounded">.env</code> 文件并填入 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY 以启用云功能。</p>
        </div>

        <!-- 表单 -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- 邮箱 -->
          <div class="space-y-1.5">
            <label for="email" class="block text-sm font-medium text-[#9ca3af]">邮箱地址</label>
            <input
              id="email"
              type="email"
              v-model="form.email"
              required
              autocomplete="email"
              placeholder="your@email.com"
              class="h-12 px-4 bg-[#0d1321] border border-[#1f2937] rounded-lg text-sm text-[#e5e7eb] outline-none focus:border-[#3b82f6] focus:shadow-[0_0_0_2px_rgba(59,130,246,0.15)] placeholder-[#4b5563] w-full"
            />
          </div>

          <!-- 密码 -->
          <div class="space-y-1.5">
            <label for="password" class="block text-sm font-medium text-[#9ca3af]">密码</label>
            <div class="relative">
              <input
                id="password"
                :type="showPassword ? 'text' : 'password'"
                v-model="form.password"
                required
                autocomplete="current-password"
                placeholder="输入密码"
                class="h-12 px-4 pr-12 bg-[#0d1321] border border-[#1f2937] rounded-lg text-sm text-[#e5e7eb] outline-none focus:border-[#3b82f6] focus:shadow-[0_0_0_2px_rgba(59,130,246,0.15)] placeholder-[#4b5563] w-full"
              />
              <!-- 显示/隐藏密码按钮 -->
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-[#4b5563] hover:text-[#e5e7eb] transition-colors cursor-pointer bg-transparent border-none"
              >
                <svg v-if="!showPassword" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 01.563-2.329m12.706 0A9.97 9.97 0 0012 5c-4.478 0-8.268 2.943-9.543 7M15 12a3 3 0 11-6 0m6 0V9m-6 3v3" />
                </svg>
              </button>
            </div>
          </div>

          <!-- 错误提示 -->
          <div v-if="errorMessage" class="p-3 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/30 text-sm text-[#fca5a5]">
            {{ errorMessage }}
          </div>

          <!-- 提交按钮 -->
          <button
            type="submit"
            :disabled="loading || supabase.isOfflineMode"
            class="w-full h-12 rounded-xl font-semibold text-base transition-all duration-200 cursor-pointer border-none"
            :class="(loading || supabase.isOfflineMode)
              ? 'bg-[#1f2937] text-[#4b5563] cursor-not-allowed'
              : 'bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white hover:opacity-90 active:scale-[0.98]'"
            style="box-shadow: 0 0 20px rgba(59,130,246,0.15);"
          >
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.924 3 8.11l2.98-2.98A7.962 7.962 0 016 17.291z"></path></svg>
              登录中...
            </span>
            <span v-else>登 录</span>
          </button>
        </form>

        <!-- 底部提示 -->
        <p class="text-center text-xs text-[#4b5563]">
          首次使用将自动注册账号 · 密码由 Supabase 安全存储
        </p>
      </div>

      <!-- 返回首页链接 -->
      <router-link
        to="/"
        class="block text-center text-sm text-[#9ca3af] hover:text-[#3b82f6] transition-colors"
      >
        ← 返回计算器首页（无需登录也可使用）
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSupabase } from '../composables/useSupabase.js'

const router = useRouter()
const supabase = useSupabase()

/** 表单数据 */
const form = reactive({
  email: '',
  password: ''
})

/** 是否正在提交 */
const loading = ref(false)
/** 错误消息 */
const errorMessage = ref('')
/** 是否显示密码 */
const showPassword = ref(false)

/**
 * 处理登录/注册
 */
async function handleLogin() {
  errorMessage.value = ''
  loading.value = true

  try {
    const result = await supabase.signIn(form.email, form.password)

    if (result.success) {
      // 登录成功 → 跳转回首页
      router.push('/')
    } else {
      errorMessage.value = result.error || '登录失败，请检查邮箱和密码'
    }
  } catch (err) {
    errorMessage.value = err.message || '网络异常，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>
