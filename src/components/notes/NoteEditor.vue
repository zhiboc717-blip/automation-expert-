<!--
  Markdown 备注编辑器

  功能：
    - 使用 marked + DOMPurify 渲染 Markdown
    - 支持实时预览
    - 可选 AES-256 加密存储
-->

<template>
  <div class="space-y-3">
    <!-- 工具栏 -->
    <div class="flex items-center justify-between">
      <h4 class="text-sm font-semibold text-[#e5e7eb] flex items-center gap-1.5">
        <svg class="w-4 h-4 text-[#FFD700]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        备注
      </h4>
      <EncryptToggle
        v-model:encrypted="isEncrypted"
      />
    </div>

    <!-- 编辑/预览切换标签 -->
    <div class="flex gap-1 bg-[#0d1321] rounded-lg p-1 border border-[#1f2937]">
      <button
        @click="mode = 'edit'"
        :class="mode === 'edit' ? 'bg-[#1f2937] text-[#e5e7eb]' : 'text-[#9ca3af]'"
        class="flex-1 py-1.5 text-xs rounded-md transition-colors cursor-pointer border-none hover:text-[#e5e7eb]"
      >编辑</button>
      <button
        @click="mode = 'preview'"
        :class="mode === 'preview' ? 'bg-[#1f2937] text-[#e5e7eb]' : 'text-[#9ca3af]'"
        class="flex-1 py-1.5 text-xs rounded-md transition-colors cursor-pointer border-none hover:text-[#e5e7eb]"
      >预览</button>
    </div>

    <!-- 编辑区（textarea） -->
    <textarea
      v-if="mode === 'edit'"
      ref="editorRef"
      :value="noteText"
      @input="$emit('update:noteText', $event.target.value)"
      placeholder="在此输入备注信息，支持 Markdown 格式&#10;&#10;例如：&#10;- 项目：XX生产线调试&#10;- 日期：2026-06-09&#10;- **注意**：减速比需确认"
      rows="5"
      class="w-full px-3 py-2.5 bg-[#0d1321] border border-[#1f2937] rounded-lg text-sm text-[#e5e7eb] placeholder-[#4b5563] resize-y outline-none focus:border-[#3b82f6] focus:shadow-[0_0_0_2px_rgba(59,130,246,0.15)] font-mono leading-relaxed"
    ></textarea>

    <!-- 预览区（Markdown渲染） -->
    <div
      v-if="mode === 'preview' && noteText"
      class="min-h-[120px] max-h-[300px] overflow-y-auto p-3 rounded-lg bg-[#0d1321] border border-[#1f2937] prose-invert prose-sm"
      v-html="renderedHtml"
    ></div>
    <div
      v-if="mode === 'preview' && !noteText"
      class="min-h-[80px] flex items-center justify-center rounded-lg bg-[#0d1321] border border-dashed border-[#1f2937] text-xs text-[#4b5563]"
    >
      暂无内容，请先在编辑模式下输入
    </div>

    <!-- 字数统计 -->
    <div class="flex items-center justify-between text-xs text-[#4b5563]">
      <span>{{ noteText.length }} 字符</span>
      <span v-if="isEncrypted" class="text-[#FFD700] flex items-center gap-1">
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/></svg>
        已启用加密
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const props = defineProps({
  /** 备注文本内容 */
  noteText: {
    type: String,
    default: ''
  }
})

defineEmits(['update:noteText'])

/** 当前显示模式 */
const mode = ref('edit')

/** 是否加密存储 */
const isEncrypted = ref(false)

/** 编辑器引用 */
const editorRef = ref(null)

/**
 * 将 Markdown 文本安全地渲染为 HTML
 * 使用 marked 解析 + DOMPurify 清理 XSS 风险
 */
const renderedHtml = computed(() => {
  if (!props.noteText) return ''

  try {
    const rawHtml = marked(props.noteText, { breaks: true })
    return DOMPurify.sanitize(rawHtml)
  } catch (error) {
    console.error('[NoteEditor] Markdown 渲染失败:', error)
    return `<p style="color:#ef4444">⚠️ 渲染出错: ${error.message}</p>`
  }
})
</script>
