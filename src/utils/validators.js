/**
 * 数值校验工具集
 * 提供防零校验、范围检查、类型验证等通用校验函数
 */

/** 极小的正数阈值，用于判断"接近零" */
const EPSILON = 1e-10

/**
 * 检查数值是否有效（有限、非NaN）
 * @param {*} value - 待检查的值
 * @returns {boolean} 是否为有效数值
 */
export function isValidNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && !isNaN(value)
}

/**
 * 防零校验 — 检查分母是否为零或接近零
 * @param {number} value - 分母值（通常是除法中的除数）
 * @param {string} [fieldName=''] - 字段名（用于错误提示）
 * @throws {Error} 当值为零或接近零时抛出错误
 * @returns {number} 通过校验的原始值
 */
export function guardZero(value, fieldName = '') {
  if (!isValidNumber(value) || Math.abs(value) < EPSILON) {
    throw new Error(
      `${fieldName ? `[${fieldName}] ` : ''}分母不能为零或接近零（当前值: ${value}）。请检查输入参数。`
    )
  }
  return value
}

/**
 * 安全除法 — 自动处理分母为零情况，返回null而不是抛异常
 * @param {number} dividend - 被除数
 * @param {number} divisor - 除数
 * @param {number|null} [fallback=null] - 除数为零时的返回默认值
 * @returns {number|null} 商或 fallback 值
 */
export function safeDivide(dividend, divisor, fallback = null) {
  if (!isValidNumber(dividend) || !isValidNumber(divisor)) return fallback
  if (Math.abs(divisor) < EPSILON) return fallback
  return dividend / divisor
}

/**
 * 校验正数（大于0）
 * @param {number} value - 待校验值
 * @param {string} [fieldName=''] - 字段名
 * @returns {boolean} 是否为正数
 */
export function isPositive(value) {
  return isValidNumber(value) && value > EPSILON
}

/**
 * 校验非负数（≥0）
 * @param {number} value - 待校验值
 * @returns {boolean} 是否为非负数
 */
export function isNonNegative(value) {
  return isValidNumber(value) && value >= 0
}

/**
 * 将输入值限制在指定范围内
 * @param {number} value - 输入值
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 钳制后的值
 */
export function clamp(value, min, max) {
  if (!isValidNumber(value)) return min
  return Math.min(Math.max(value, min), max)
}
