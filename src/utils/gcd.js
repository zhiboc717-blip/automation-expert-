/**
 * GCD 最大公约数算法
 * 使用欧几里得辗转相除法，支持负数输入
 * @param {number} a - 第一个整数
 * @param {number} b - 第二个整数
 * @returns {number} a和b的最大公约数
 */
export function gcd(a, b) {
  // 处理非整数或零值的情况
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return 1
  }
  // 取绝对值确保结果为正
  a = Math.abs(Math.round(a))
  b = Math.abs(Math.round(b))

  if (a === 0 && b === 0) return 1
  if (a === 0) return b
  if (b === 0) return a

  // 欧几里得算法：不断取模直到余数为0
  while (b !== 0) {
    const temp = b
    b = a % b
    a = temp
  }
  return a
}

/**
 * 将两个数通过GCD化简为最简整数比
 * @param {number} numerator - 分子
 * @param {number} denominator - 分母
 * @returns {{ simplifiedNum: number, simplifiedDen: number, divisor: number }} 化简后的比值及公约数
 */
export function simplifyRatio(numerator, denominator) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) {
    return { simplifiedNum: numerator, simplifiedDen: denominator, divisor: 1 }
  }

  const divisor = gcd(numerator, denominator)
  return {
    simplifiedNum: Math.round(numerator / divisor),
    simplifiedDen: Math.round(denominator / divisor),
    divisor: divisor
  }
}
