<!--
  步长微调数字输入框

  功能：
    - 带有 [-1] [+1] 步进按钮（点击微调数值）
    - 步长下拉选择器：×0.01, ×1, ×10, ×1000
    - 支持直接键盘输入
    - 防零校验提示
    - 响应单位切换显示
-->

<template>
  <div class="flex items-stretch gap-1" :class="wrapperClass">
    <!-- 减号步进按钮 -->
    <button
      type="button"
      @click="adjust(-stepValue)"
      :disabled="disabled || readonly"
      class="step-btn step-btn-minus no-select flex-shrink-0 w-9 h-[42px] rounded-l-md border border-r-0 border-[#1f2937] bg-[#1a2332] hover:bg-[#2d3748] text-[#e5e7eb] hover:text-[#00FF00] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer font-mono text-base font-bold"
      title="减少"
    >
      −
    </button>

    <!-- 数字输入框 -->
    <input
      ref="inputRef"
      type="number"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value === '' ? '' : Number($event.target.value))"
      @focus="$emit('focus')"
      @blur="$emit('blur'); handleBlur()"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :min="min"
      :max="max"
      step="any"
      class="flex-1 h-[42px] px-3 bg-[#0d1321] border-y border-[#1f2937] text-[#e5e7eb] font-mono text-sm outline-none transition-all focus:border-[#3b82f6] focus:shadow-[0_0_0_2px_rgba(59,130,246,0.15)] text-center min-w-0 [appearance:textfield] [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
    />

    <!-- 加号步进按钮 -->
    <button
      type="button"
      @click="adjust(stepValue)"
      :disabled="disabled || readonly"
      class="step-btn step-btn-plus no-select flex-shrink-0 w-9 h-[42px] rounded-r-md border border-l-0 border-[#1f2937] bg-[#1a2332] hover:bg-[#2d3748] text-[#e5e7eb] hover:text-[#00FF00] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer font-mono text-base font-bold"
      title="增加"
    >
      +
    </button>

    <!-- 步长下拉选择器 -->
    <select
      v-model="currentStep"
      :disabled="disabled || readonly"
      class="flex-shrink-0 w-20 h-[42px] rounded-r-lg ml-1 bg-[#0d1321] border border-[#1f2937] text-xs text-[#9ca3af] font-mono outline-none focus:border-[#3b82f6] cursor-pointer appearance-none pl-2 pr-6"
      style="background-image: url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%278%27 height=%278%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%239ca3af%27 stroke-width=%272.5%27%3E%3Cpolyline points=%276,9 12,15 18,9%27/%3E%3C/svg%3E'); background-repeat: no-repeat; background-position: right 6px center;"
    >
      <option v-for="s in stepOptions" :key="s.value" :value="s.value">
        {{ s.label }}
      </option>
    </select>

    <!-- 单位标签（可选） -->
    <span v-if="unitLabel" class="flex-shrink-0 self-center text-xs text-[#4b5563] ml-1 whitespace-nowrap">
      {{ unitLabel }}
    </span>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  /** 当前绑定值 */
  modelValue: {
    type: Number,
    default: undefined
  },
  /** 输入框占位文字 */
  placeholder: {
    type: String,
    default: '请输入'
  },
  /** 是否禁用 */
  disabled: {
    type: Boolean,
    default: false
  },
  /** 是否只读 */
  readonly: {
    type: Boolean,
    default: false
  },
  /** 最小值限制 */
  min: {
    type: Number,
    default: undefined
  },
  /** 最大值限制 */
  max: {
    type: Number,
    default: undefined
  },
  /** 外层容器额外 CSS 类名 */
  wrapperClass: {
    type: String,
    default: ''
  },
  /** 单位标签文本（如 "mm", "RPM", "Hz"） */
  unitLabel: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

/** 输入框 DOM 引用 */
const inputRef = ref(null)

/** 可选的步长列表 */
const stepOptions = [
  { value: 0.01, label: '×0.01' },
  { value: 1, label: '×1' },
  { value: 10, label: '×10' },
  { value: 1000, label: '×1000' }
]

/** 当前选中的步长值 */
const currentStep = ref(1)

/** 当前实际使用的步长数值 */
const stepValue = computed(() => currentStep.value)

/**
 * 按钮步进调整数值
 * @param {number} delta - 调整增量（正数增加，负数减少）
 */
function adjust(delta) {
  let current = props.modelValue

  // 如果当前值为空或非数字，从0开始
  if (current == null || isNaN(current) || !isFinite(current)) {
    current = 0
  }

  const newValue = current + delta

  // 应用 min/max 约束
  let result = newValue
  if (props.min != null) result = Math.max(result, props.min)
  if (props.max != null) result = Math.min(result, props.max)

  emit('update:modelValue', parseFloat(result.toFixed(10)))
}

/** 失去焦点时确保数值格式正确 */
function handleBlur() {
  const val = props.modelValue
  if (val == null || val === '') return
  emit('update:modelValue', parseFloat(Number(val).toFixed(10)))
}
</script>

<style scoped>
/* 防止双击选中文字 */
.no-select {
  user-select: none;
  -webkit-user-select: none;
}
</style>
