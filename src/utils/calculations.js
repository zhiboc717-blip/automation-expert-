/**
 * 核心 A-F 算法函数库（纯函数，无副作用）
 *
 * 每个模块导出一个计算函数，接收参数对象，返回结果对象。
 * 所有分母变量在除法前进行防零校验（使用 validators.js 的 guardZero）。
 */

import { guardZero, safeDivide, isValidNumber } from './validators.js'
import { simplifyRatio } from './gcd.js'

// ============================================================================
// 模块A：脉冲与距离互算
// ============================================================================

/**
 * 模块A - 脉冲与距离互算
 *
 * 公式来源：
 *   进给常数 L = 3.14 × 滚筒直径（若是丝杆，L = 导程）
 *   每当量脉冲 (Pulse/mm) = (电机单圈脉冲数 × 减速比) / L
 *   脉冲当量 (mm/Pulse) = L / (电机单圈脉冲数 × 减速比)
 *   目标脉冲总数 = round(目标移动距离(mm) × 每当量脉冲)    // 四舍五入取整
 *   实际距离 (mm) = 累计脉冲量 / 每当量脉冲
 *
 * @param {Object} params
 * @param {number} params.rollerDiameter - 滚筒直径 (mm)，丝杆时填导程
 * @param {number} params.motorPulsesPerRev - 电机单圈脉冲数
 * @param {number} params.gearRatio - 减速比（如 10 表示 10:1）
 * @param {boolean} params.isLeadScrew - 是否为丝杆模式（true 时 L 直接用滚筒直径值作为导程）
 * @param {'distance'|'pulses'} params.calcMode - 计算模式：'distance'=已知距离求脉冲, 'pulses'=已知脉冲求距离
 * @param {number} [params.targetDistance] - 目标移动距离 (mm)，calcMode='distance' 时必填
 * @param {number} [params.totalPulses] - 累计脉冲量，calcMode='pulses' 时必填
 * @returns {{ success: boolean, results?: Object, error?: string }}
 */
export function calcModuleA(params) {
  try {
    const {
      rollerDiameter,
      motorPulsesPerRev,
      gearRatio,
      isLeadScrew = false,
      calcMode = 'distance',
      targetDistance,
      totalPulses
    } = params

    // 校验必要输入参数
    guardZero(rollerDiameter, '滚筒直径/导程')
    guardZero(motorPulsesPerRev, '电机单圈脉冲数')
    guardZero(gearRatio, '减速比')

    // 计算进给常数 L
    // 丝杆模式下，用户输入的"滚筒直径"实际是导程；非丝杆模式用 π × D
    const feedConstantL = isLeadScrew ? rollerDiameter : 3.14 * rollerDiameter

    guardZero(feedConstantL, '进给常数 L')

    // 核心公式：每当量脉冲 (Pulse/mm)
    const pulsesPerMm = (motorPulsesPerRev * gearRatio) / feedConstantL

    // 脉冲当量 (mm/Pulse)
    const mmPerPulse = safeDivide(1, pulsesPerMm, 0)

    const baseResults = {
      feedConstantL: toPrecision(feedConstantL, 6),
      pulsesPerMm: toPrecision(pulsesPerMm, 4),
      mmPerPulse: toPrecision(mmPerPulse, 8),
      formulaNote: isLeadScrew ? '丝杆模式：L = 导程' : `滚筒模式：L = π × D = ${toPrecision(feedConstantL, 4)}`
    }

    let specificResults = {}

    if (calcMode === 'distance') {
      // 已知距离 → 求脉冲
      if (!isValidNumber(targetDistance)) {
        throw new Error('请输入目标移动距离')
      }
      // 目标脉冲总数 = 四舍五入取整
      const targetTotalPulses = Math.round(targetDistance * pulsesPerMm)
      specificResults = {
        targetDistance_mm: targetDistance,
        targetTotalPulses: targetTotalPulses,
        calcModeLabel: '距离 → 脉冲'
      }
    } else if (calcMode === 'pulses') {
      // 已知脉冲 → 求距离
      if (!isValidNumber(totalPulses)) {
        throw new Error('请输入累计脉冲量')
      }
      const actualDistance = safeDivide(totalPulses, pulsesPerMm, 0)
      specificResults = {
        totalPulses_input: totalPulses,
        actualDistance_mm: toPrecision(actualDistance, 6),
        calcModeLabel: '脉冲 → 距离'
      }
    }

    return {
      success: true,
      results: { ...baseResults, ...specificResults }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ============================================================================
// 模块B：频率与速度互算
// ============================================================================

/**
 * 模块B - 频率与速度互算
 *
 * 公式来源：
 *   发送频率(Hz) = 目标速度(mm/s) × 每当量脉冲
 *   若 UI 输入为 m/min：目标速度(mm/s) = (m/min × 1000) / 60
 *   实际速度(mm/s) = 当前频率(Hz) / 每当量脉冲
 *
 * @param {Object} params
 * @param {number} params.pulsesPerMm - 每当量脉冲 (Pulse/mm) — 来自模块A或手动输入
 * @param {'speedToFreq'|'freqToSpeed'} params.calcMode - 计算方向
 * @param {string} params.speedUnit - 速度单位：'mm_s' | 'm_min'
 * @param {number} [params.targetSpeed] - 目标速度值
 * @param {number} [params.currentFreq] - 当前频率 (Hz)
 * @returns {{ success: boolean, results?: Object, error?: string }}
 */
export function calcModuleB(params) {
  try {
    const { pulsesPerMm, calcMode = 'speedToFreq', speedUnit = 'mm_s', targetSpeed, currentFreq } = params

    guardZero(pulsesPerMm, '每当量脉冲')

    const baseResults = {
      pulsesPerMm_input: pulsesPerMm,
      speedUnit: speedUnit === 'm_min' ? 'm/min' : 'mm/s'
    }

    let specificResults = {}

    if (calcMode === 'speedToFreq') {
      // 已知速度 → 求发送频率
      if (!isValidNumber(targetSpeed)) {
        throw new Error('请输入目标速度')
      }

      // 统一转为 mm/s
      let speedInMmPerSec = targetSpeed
      if (speedUnit === 'm_min') {
        speedInMmPerSec = (targetSpeed * 1000) / 60
      }

      // 发送频率 = 速度(mm/s) × 每当量脉冲(Pulse/mm)
      const sendFrequencyHz = speedInMmPerSec * pulsesPerMm

      specificResults = {
        targetSpeed_input: targetSpeed,
        speedInMmPerSec: toPrecision(speedInMmPerSec, 6),
        sendFrequency_Hz: toPrecision(sendFrequencyHz, 2),
        calcModeLabel: '速度 → 频率',
        formulaNote: `F = V(${speedUnit}) × Pulses/mm`
      }
    } else if (calcMode === 'freqToSpeed') {
      // 已知频率 → 求实际速度
      if (!isValidNumber(currentFreq)) {
        throw new Error('请输入当前频率')
      }

      const actualSpeedMmPerSec = safeDivide(currentFreq, pulsesPerMm, 0)

      // 同时输出两种单位的结果
      const actualSpeedMMin = actualSpeedMmPerSec !== null ? (actualSpeedMmPerSec * 60) / 1000 : null

      specificResults = {
        inputFreq_Hz: currentFreq,
        actualSpeed_mm_s: actualSpeedMmPerSec != null ? toPrecision(actualSpeedMmPerSec, 6) : '-',
        actualSpeed_m_min: actualSpeedMMin != null ? toPrecision(actualSpeedMMin, 4) : '-',
        calcModeLabel: '频率 → 速度',
        formulaNote: `V = F / Pulses/mm`
      }
    }

    return {
      success: true,
      results: { ...baseResults, ...specificResults }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ============================================================================
// 模块C：电子齿轮比计算（核心 — GCD化简）
// ============================================================================

/**
 * 模块C - 电子齿轮比计算
 *
 * 公式来源：
 *   直线模式：B/A = (伺服设定脉冲数 × 减速比) / 用户期望发的一圈脉冲数
 *   旋转模式：B/A = (编码器原生分辨率 × 减速比) / 3600
 *   ⚠️ B 和 A 必须通过 GCD 化简为最简整数比！
 *
 * @param {Object} params
 * @param {'linear'|'rotation'} params.mode - 齿轮比模式
 * @param {number} params.servoSetPulses - 伺服设定脉冲数
 * @param {number} params.gearRatio - 减速比
 * @param {number} [params.expectedPulsesPerRev] - 用户期望发的一圈脉冲数（直线模式）
 * @param {number} [params.encoderResolution] - 编码器原生分辨率（旋转模式）
 * @returns {{ success: boolean, results?: Object, error?: string }}
 */
export function calcModuleC(params) {
  try {
    const {
      mode = 'linear',
      servoSetPulses,
      gearRatio,
      expectedPulsesPerRev,
      encoderResolution
    } = params

    guardZero(servoSetPulses, '伺服设定脉冲数')
    guardZero(gearRatio, '减速比')

    let numerator = 0   // B 值
    let denominator = 0 // A 值
    let rawFormula = ''

    if (mode === 'linear') {
      // 直线模式：B/A = (伺服设定脉冲数 × 减速比) / 期望一圈脉冲数
      guardZero(expectedPulsesPerRev, '期望每圈脉冲数')

      numerator = servoSetPulses * gearRatio
      denominator = expectedPulsesPerRev
      rawFormula = `B/A = (${servoSetPulses} × ${gearRatio}) / ${expectedPulsesPerRev}`
    } else if (mode === 'rotation') {
      // 旋转模式：B/A = (编码器分辨率 × 减速比) / 3600
      guardZero(encoderResolution, '编码器分辨率')

      numerator = encoderResolution * gearRatio
      denominator = 3600
      rawFormula = `B/A = (${encoderResolution} × ${gearRatio}) / 3600`
    }

    guardZero(numerator, '分子(B)')
    guardZero(denominator, '分母(A)')

    // ⚠️ 核心：通过 GCD 化简为最简整数比
    const simplified = simplifyRatio(numerator, denominator)

    return {
      success: true,
      results: {
        mode: mode === 'linear' ? '直线模式' : '旋转模式',
        rawNumerator_B: numerator,
        rawDenominator_A: denominator,
        rawFormula: rawFormula,
        gcdDivisor: simplified.divisor,
        simplified_B: simplified.simplifiedNum,
        simplified_A: simplified.simplifiedDen,
        gearRatioDisplay: `${simplified.simplifiedNum}:${simplified.simplifiedDen}`,
        note: `已通过GCD=${simplified.divisor}化简为最简整数比`,
        inputsSummary:
          mode === 'linear'
            ? `伺服脉冲=${servoSetPulses}, 减速比=${gearRatio}, 期望脉冲=${expectedPulsesPerRev}`
            : `编码器分辨率=${encoderResolution}, 减速比=${gearRatio}`
      }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ============================================================================
// 模块D：变频器线速度计算
// ============================================================================

/**
 * 模块D - 变频器线速度计算
 *
 * 公式来源：
 *   滚筒转速_基于电机(RPM) = 电机转速 / 减速比
 *   滚筒转速_基于频率(RPM) = ((60 × 变频器频率Hz) / 电机极对数) / 减速比
 *   实际线速度(m/min) = (3.14 × 滚筒直径 × 滚筒转速(RPM)) / 1000
 *   目标电机转速(RPM) = (目标线速度 × 减速比 × 1000) / (3.14 × 滚筒直径)
 *
 * @param {Object} params
 * @param {number} params.rollerDiameter - 滚筒直径 (mm)
 * @param {number} params.gearRatio - 减速比
 * @param {number} [params.motorRpm] - 电机转速 (RPM) — 从电机端推算
 * @param {number} [params.vfdFrequency] - 变频器频率 (Hz) — 从频率端推算
 * @param {number} [params.polePairs] - 电机极对数（默认2极=1对）
 * @param {number} [params.targetLineSpeed] - 目标线速度 (m/min) — 反向求解
 * @param {'motor'|'frequency'|'reverse'} params.calcMode - 计算方向
 * @returns {{ success: boolean, results?: Object, error?: string }}
 */
export function calcModuleD(params) {
  try {
    const {
      rollerDiameter,
      gearRatio,
      motorRpm,
      vfdFrequency,
      polePairs = 1,
      targetLineSpeed,
      calcMode = 'motor'
    } = params

    guardZero(rollerDiameter, '滚筒直径')
    guardZero(gearRatio, '减速比')

    const PI = 3.14
    const baseResults = {
      rollerDiameter_mm: rollerDiameter,
      gearRatio: gearRatio
    }

    let specificResults = {}

    if (calcMode === 'motor') {
      // 从电机转速推算
      guardZero(motorRpm, '电机转速')

      const rollerRpmFromMotor = motorRpm / gearRatio
      const lineSpeed = (PI * rollerDiameter * rollerRpmFromMotor) / 1000

      specificResults = {
        motorRpm_input: motorRpm,
        rollerRpm_fromMotor: toPrecision(rollerRpmFromMotor, 4),
        lineSpeed_m_per_min: toPrecision(lineSpeed, 4),
        calcModeLabel: '电机转速 → 线速度',
        formulaNote: `V = (π×D×(电机RPM/减速比))/1000`
      }
    } else if (calcMode === 'frequency') {
      // 从变频器频率推算
      guardZero(vfdFrequency, '变频器频率')
      guardZero(polePairs, '电机极对数')

      // 同步转速公式：(60 × f) / p 得到电机 RPM，再除以减速比得滚筒 RPM
      const rollerRpmFromFreq = ((60 * vfdFrequency) / polePairs) / gearRatio
      const lineSpeed = (PI * rollerDiameter * rollerRpmFromFreq) / 1000

      specificResults = {
        vfdFreq_Hz: vfdFrequency,
        polePairs: polePairs,
        rollerRpm_fromFreq: toPrecision(rollerRpmFromFreq, 4),
        lineSpeed_m_per_min: toPrecision(lineSpeed, 4),
        calcModeLabel: '变频器频率 → 线速度',
        formulaNote: `n = (60×f/p)/减速比; V = π×D×n/1000`
      }
    } else if (calcMode === 'reverse') {
      // 反向：已知目标线速度 → 求所需电机转速
      if (!isValidNumber(targetLineSpeed)) {
        throw new Error('请输入目标线速度')
      }

      guardZero(targetLineSpeed, '目标线速度')

      const requiredMotorRpm = (targetLineSpeed * gearRatio * 1000) / (PI * rollerDiameter)
      const rollerRpm = safeDivide(requiredMotorRpm, gearRatio, 0)

      specificResults = {
        targetLineSpeed_input: targetLineSpeed,
        requiredMotorRpm: toPrecision(requiredMotorRpm, 2),
        rollerRpm_result: rollerRpm != null ? toPrecision(rollerRpm, 4) : '-',
        calcModeLabel: '目标线速度 → 所需电机转速',
        formulaNote: `电机RPM = (V×减速比×1000)/(π×D)`
      }
    }

    return {
      success: true,
      results: { ...baseResults, ...specificResults }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ============================================================================
// 模块E：大小滚轴同步跟随
// ============================================================================

/**
 * 模块E - 大小滚轴同步跟随
 *
 * 公式来源：
 *   同步倍率 = 主机滚轴直径 / 从机滚轴直径
 *   从机目标频率 = 主机实时读取频率 × 同步倍率
 *
 * @param {Object} params
 * @param {number} params.masterRollerDiameter - 主机滚轴直径 (mm)
 * @param {number} params.slaveRollerDiameter - 从机滚轴直径 (mm)
 * @param {number} [params.masterCurrentFreq] - 主机当前频率 (Hz)
 * @returns {{ success: boolean, results?: Object, error?: string }}
 */
export function calcModuleE(params) {
  try {
    const { masterRollerDiameter, slaveRollerDiameter, masterCurrentFreq } = params

    guardZero(masterRollerDiameter, '主机滚轴直径')
    guardZero(slaveRollerDiameter, '从机滚轴直径')

    // 同步倍率 = 主机直径 / 从机直径
    const syncRatio = masterRollerDiameter / slaveRollerDiameter

    const baseResults = {
      masterRollerDiameter_mm: masterRollerDiameter,
      slaveRollerDiameter_mm: slaveRollerDiameter,
      syncRatio: toPrecision(syncRatio, 6)
    }

    let specificResults = {}

    // 如果提供了主机当前频率，则计算从机目标频率
    if (isValidNumber(masterCurrentFreq)) {
      const slaveTargetFreq = masterCurrentFreq * syncRatio
      specificResults = {
        masterCurrentFreq_Hz: masterCurrentFreq,
        slaveTargetFreq_Hz: toPrecision(slaveTargetFreq, 2),
        calcModeLabel: '同步倍率 + 从机频率'
      }
    } else {
      specificResults = {
        calcModeLabel: '同步倍率计算'
      }
    }

    return {
      success: true,
      results: {
        ...baseResults,
        ...specificResults,
        formulaNote: `K = D主机/D从机 = ${masterRollerDiameter}/${slaveRollerDiameter}`
      }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ============================================================================
// 模块F：加减速与 Modbus 地址换算
// ============================================================================

/**
 * 模块F - 加减速与 Modbus 地址换算
 *
 * 公式来源：
 *   脉冲加减速斜率 (Hz/s) = 目标最高频率(Hz) / 加速时间(秒)
 *   Modbus Hex 换算：
 *     物理十进制地址 = (用户输入的 4xxxxx/3xxxxx 剔除首位) - 1 → 转十六进制 0xXXXX
 *     例：40001 → (0001-1)=0 → 0x0000
 *         40100 → (0100-1)=99 → 0x0063
 *
 * @param {Object} params
 * @param {number} params.targetMaxFreq - 目标最高频率 (Hz)
 * @param {number} params.accelTime - 加速时间 (秒)
 * @param {number} [params.decelTime] - 减速时间 (秒，可选，不填则同加速时间)
 * @param {string|number} [params.modbusAddress] - Modbus 地址（如 "40001" 或 40100）
 * @returns {{ success: boolean, results?: Object, error?: string }}
 */
export function calcModuleF(params) {
  try {
    const {
      targetMaxFreq,
      accelTime,
      decelTime,
      modbusAddress
    } = params

    guardZero(targetMaxFreq, '目标最高频率')
    guardZero(accelTime, '加速时间')

    // 脉冲加减速斜率 (Hz/s)
    const accelSlope = targetMaxFreq / accelTime
    const effectiveDecelTime = isValidNumber(decelTime) && decelTime > 0 ? decelTime : accelTime
    const decelSlope = targetMaxFreq / effectiveDecelTime

    const baseResults = {
      targetMaxFreq_Hz: targetMaxFreq,
      accelTime_sec: accelTime,
      decelTime_sec: effectiveDecelTime,
      accelSlope_Hz_per_s: toPrecision(accelSlope, 4),
      decelSlope_Hz_per_s: toPrecision(decelSlope, 4),
      formulaNote_acc: `斜率 = Fmax/T = ${targetMaxFreq}/${accelTime}`
    }

    let modbusResult = {}
    if (modbusAddress != null && String(modbusAddress).trim() !== '') {
      const addrStr = String(modbusAddress).trim()
      // 提取数字部分
      const match = addrStr.match(/^[34](\d+)$/)
      if (match) {
        const physicalAddr = parseInt(match[1], 10) - 1
        const hexAddr = '0x' + physicalAddr.toString(16).toUpperCase().padStart(4, '0')

        modbusResult = {
          modbusInput: addrStr,
          strippedNumber: match[1],
          physicalDecimalAddr: physicalAddr,
          hexAddress: hexAddr,
          modbusNote: `地址 ${addrStr} → 物理十进制:${physicalAddr} → 十六进制:${hexAddr}`
        }
      } else {
        modbusResult = {
          modbusInput: addrStr,
          hexAddress: '格式错误（需为3xxxxx或4xxxxx）',
          modbusNote: 'Modbus地址格式不正确，应为3xxxxx或4xxxxx格式'
        }
      }
    }

    return {
      success: true,
      results: { ...baseResults, ...modbusResult }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 数值保留指定位有效精度（避免浮点误差显示问题）
 * @param {number} value
 * @param {number} precision - 小数位数
 * @returns {number}
 */
function toPrecision(value, precision) {
  if (value == null || !isFinite(value)) return value
  return Number(value.toFixed(precision))
}
