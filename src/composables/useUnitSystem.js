/**
 * 单位系统 Composable
 * 管理公制(mm/m) / 英制(inch) 全局单位切换
 * 提供 mm↔inch 转换工具函数
 */

import { ref, computed } from 'vue'

// 全局响应式单位状态（单例）
const currentUnit = ref('metric') // 'metric' | 'imperial'
const conversionListeners = []

/** 1 inch = 25.4 mm */
const MM_PER_INCH = 25.4

/**
 * 单位系统 composable
 * @returns {{
 *   unitSystem: import('vue').Ref<string>,
 *   isMetric: import('vue').ComputedRef<boolean>,
 *   isImperial: import('vue').ComputedRef<boolean>,
 *   toggleUnit: () => void,
 *   setUnit: (unit: string) => void,
 *   toImperial: (mmValue: number) => number,
 *   toMetric: (inchValue: number) => number,
 *   formatLength: (value: number, decimals?: number) => string,
 *   unitLabel: import('vue').ComputedRef<string>
 * }}
 */
export function useUnitSystem() {
  const isMetric = computed(() => currentUnit.value === 'metric')
  const isImperial = computed(() => currentUnit.value === 'imperial')

  /** 当前单位的显示标签 */
  const unitLabel = computed(() =>
    currentUnit.value === 'metric' ? '公制 (mm/m)' : '英制 (inch)'
  )

  /**
   * 切换单位系统
   */
  function toggleUnit() {
    currentUnit.value = currentUnit.value === 'metric' ? 'imperial' : 'metric'
    // 通知所有监听器
    conversionListeners.forEach(fn => {
      try { fn(currentUnit.value) } catch (e) { /* ignore */ }
    })
    // 持久化到 localStorage
    try {
      localStorage.setItem('unit-system', currentUnit.value)
    } catch (e) { /* ignore */ }
  }

  /**
   * 设置指定单位系统
   * @param {'metric'|'imperial'} unit
   */
  function setUnit(unit) {
    if (unit === 'metric' || unit === 'imperial') {
      currentUnit.value = unit
      try {
        localStorage.setItem('unit-system', unit)
      } catch (e) { /* ignore */ }
    }
  }

  /**
   * 将毫米值转换为英寸值
   * @param {number} mmValue - 毫米值
   * @returns {number} 英寸值
   */
  function toImperial(mmValue) {
    if (!Number.isFinite(mmValue)) return mmValue
    return mmValue / MM_PER_INCH
  }

  /**
   * 将英寸值转换为毫米值
   * @param {number} inchValue - 英寸值
   * @returns {number} 毫米值
   */
  function toMetric(inchValue) {
    if (!Number.isFinite(inchValue)) return inchValue
    return inchValue * MM_PER_INCH
  }

  /**
   * 根据当前单位格式化长度数值并附带单位标签
   * @param {number} value - 数值（内部统一使用 mm）
   * @param {number} [decimals=3] - 小数位数
   * @returns {string} 格式化字符串，如 "100.000 mm" 或 "3.937 inch"
   */
  function formatLength(value, decimals = 3) {
    if (!Number.isFinite(value)) return '-'
    if (currentUnit.value === 'imperial') {
      const inches = toImperial(value)
      return `${inches.toFixed(decimals)} in`
    }
    return `${value.toFixed(decimals)} mm`
  }

  return {
    unitSystem: currentUnit,
    isMetric,
    isImperial,
    toggleUnit,
    setUnit,
    toImperial,
    toMetric,
    formatLength,
    unitLabel
  }
}

/**
 * 初始化：从 localStorage 恢复上次选择的单位
 */
export function initUnitSystem() {
  try {
    const saved = localStorage.getItem('unit-system')
    if (saved === 'metric' || saved === 'imperial') {
      currentUnit.value = saved
    }
  } catch (e) { /* ignore */ }
}
