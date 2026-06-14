/**
 * 全局计算状态 Store（基于 Vue 3 reactive）
 *
 * 管理当前选中的模块、各模块的输入参数、计算结果、备注信息等。
 * 使用 reactive 实现响应式状态管理，替代 Pinia 以减少依赖。
 */

import { reactive, ref } from 'vue'

// 模块标识常量
export const MODULES = {
  A: { id: 'A', name: '脉冲与距离互算', icon: '📏' },
  B: { id: 'B', name: '频率与速度互算', icon: '🔄' },
  C: { id: 'C', name: '电子齿轮比计算', icon: '⚙️' },
  D: { id: 'D', name: '变频器线速度', icon: '🌀' },
  E: { id: 'E', name: '大小滚轴同步', icon: '🔗' },
  F: { id: 'F', name: '加减速与Modbus', icon: '📡' }
}

// 全局状态（单例响应式对象）
const state = reactive({
  /** 当前激活的模块 ID，如 'A', 'B', ... */
  activeModule: 'A',

  /** 各模块的输入参数（keyed by moduleId） */
  moduleInputs: {
    A: {},
    B: {},
    C: {},
    D: {},
    E: {},
    F: {}
  },

  /** 各模块的计算结果（keyed by moduleId）— 点击"开始计算"后才写入 */
  moduleResults: {
    A: null,
    B: null,
    C: null,
    D: null,
    E: null,
    F: null
  },

  /** 是否已显示过结果（用于控制 UI 显示逻辑） */
  hasCalculated: {
    A: false,
    B: false,
    C: false,
    D: false,
    E: false,
    F: false
  },

  /** 当前模块的备注文本（Markdown） */
  currentNote: '',

  /** 备注是否加密存储 */
  noteEncrypted: false,

  /** 计算历史记录 */
  historyRecords: [],

  /** 侧边栏是否展开 */
  sidebarOpen: false,

  /** 公式弹窗是否展开 */
  formulaModalOpen: false,

  /** 公式弹窗当前显示的模块 ID */
  formulaModalModule: ''
})

/** 全局加载状态 */
const globalLoading = ref(false)

/**
 * 计算 Store composable
 * @returns {{
 *   state: object,
 *   globalLoading: import('vue').Ref<boolean>,
 *   setActiveModule: (moduleId: string) => void,
 *   updateModuleInputs: (moduleId: string, inputs: Object) => void,
 *   setModuleResult: (moduleId: string, result: Object|null) => void,
 *   clearResult: (moduleId?: string) => void,
 *   setCurrentNote: (note: string) => void,
 *   addHistoryRecord: (record: Object) => void,
 *   clearHistory: () => void,
 *   toggleSidebar: () => void,
 *   openFormulaModal: (moduleId: string) => void,
 *   closeFormulaModal: () => void
 * }}
 */
export function calcStore() {
  /**
   * 切换当前激活的模块
   * @param {string} moduleId - 模块ID ('A' ~ 'F')
   */
  function setActiveModule(moduleId) {
    if (MODULES[moduleId]) {
      state.activeModule = moduleId
    }
  }

  /**
   * 更新指定模块的输入参数
   * @param {string} moduleId
   * @param {Object} inputs - 输入参数对象（会合并覆盖）
   */
  function updateModuleInputs(moduleId, inputs) {
    if (!state.moduleInputs[moduleId]) {
      state.moduleInputs[moduleId] = {}
    }
    Object.assign(state.moduleInputs[moduleId], inputs)
  }

  /**
   * 设置模块的计算结果（点击"开始计算"时调用）
   * @param {string} moduleId
   * @param {Object|null} result - 计算结果或null表示清除
   */
  function setModuleResult(moduleId, result) {
    if (result != null) {
      state.moduleResults[moduleId] = result
      state.hasCalculated[moduleId] = true
    } else {
      state.moduleResults[moduleId] = null
      state.hasCalculated[moduleId] = false
    }
  }

  /**
   * 清除指定模块或全部模块的结果
   * @param {string} [moduleId] - 不传则清空全部
   */
  function clearResult(moduleId) {
    if (moduleId) {
      state.moduleResults[moduleId] = null
      state.hasCalculated[moduleId] = false
    } else {
      for (const key of Object.keys(MODULES)) {
        state.moduleResults[key] = null
        state.hasCalculated[key] = false
      }
    }
  }

  /**
   * 设置当前备注内容
   * @param {string} note
   */
  function setCurrentNote(note) {
    state.currentNote = note
  }

  /**
   * 追加一条历史记录
   * @param {Object} record
   */
  function addHistoryRecord(record) {
    state.historyRecords.unshift({
      ...record,
      id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      timestamp: new Date().toISOString()
    })

    // 限制最大保存条数
    if (state.historyRecords.length > 500) {
      state.historyRecords = state.historyRecords.slice(0, 500)
    }
  }

  /**
   * 清空历史记录
   */
  function clearHistory() {
    state.historyRecords = []
  }

  /**
   * 切换侧边栏展开状态
   */
  function toggleSidebar() {
    state.sidebarOpen = !state.sidebarOpen
  }

  /**
   * 打开公式悬浮窗
   * @param {string} moduleId
   */
  function openFormulaModal(moduleId) {
    state.formulaModalOpen = true
    state.formulaModalModule = moduleId
  }

  /**
   * 关闭公式悬浮窗
   */
  function closeFormulaModal() {
    state.formulaModalOpen = false
    state.formulaModalModule = ''
  }

  return {
    state,
    globalLoading,
    setActiveModule,
    updateModuleInputs,
    setModuleResult,
    clearResult,
    setCurrentNote,
    addHistoryRecord,
    clearHistory,
    toggleSidebar,
    openFormulaModal,
    closeFormulaModal
  }
}

// 导出单例 store 实例（全局共享）
const storeInstance = calcStore()
export default storeInstance
