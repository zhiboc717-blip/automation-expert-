/**
 * 离线同步 Composable (IndexedDB)
 *
 * 使用 idb-keyval 管理 IndexedDB：
 * - 写入操作优先写本地 IndexedDB
 * - 在线时直接写入 Supabase + 本地缓存
 * - 离线时写入本地队列，恢复网络后自动后台同步
 * - 提供 syncPendingItems() 方法手动触发同步
 */

import { get, set, del, keys } from 'idb-keyval'
import { useSupabase } from './useSupabase.js'

/** IndexedDB 键前缀常量 */
const PREFIX_HISTORY = 'history_'
const PREFIX_QUEUE = 'sync_queue_'

/**
 * 离线同步 composable
 */
export function useOfflineSync() {
  const { isOfflineMode, saveCalcHistory: remoteSave } = useSupabase()

  /**
   * 保存一条记录到本地 IndexedDB
   * @param {Object} record - 计算记录数据
   */
  async function saveToLocal(record) {
    try {
      const id = `${PREFIX_HISTORY}${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      const storedRecord = {
        ...record,
        _localId: id,
        synced: false,
        timestamp: record.timestamp || new Date().toISOString()
      }
      await set(id, storedRecord)
    } catch (error) {
      console.error('[OfflineSync] 本地保存失败:', error)
    }
  }

  /**
   * 获取本地存储的历史记录
   * @param {number} [limit=100] - 返回条数上限
   * @returns {Promise<Array<Object>>}
   */
  async function getLocalHistory(limit = 100) {
    try {
      const allKeys = await keys()
      const historyKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith(PREFIX_HISTORY))
      const records = []

      // 取最近的 N 条（按 key 排序）
      const sortedKeys = historyKeys.slice(-limit).reverse()
      for (const k of sortedKeys) {
        const val = await get(k)
        if (val) records.push(val)
      }

      return records
    } catch (error) {
      console.error('[OfflineSync] 获取本地历史失败:', error)
      return []
    }
  }

  /**
   * 清空本地所有历史记录
   */
  async function clearLocalHistory() {
    try {
      const allKeys = await keys()
      const historyKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith(PREFIX_HISTORY))

      for (const key of historyKeys) {
        await del(key)
      }
    } catch (error) {
      console.error('[OfflineSync] 清空本地历史失败:', error)
    }
  }

  /**
   * 将记录加入待同步队列（离线时使用）
   * @param {Object} record - 待同步的计算记录
   */
  async function queueForSync(record) {
    try {
      const queueId = `${PREFIX_QUEUE}${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      await set(queueId, {
        ...record,
        _queueId: queueId,
        queuedAt: new Date().toISOString(),
        retryCount: 0
      })
    } catch (error) {
      console.error('[OfflineSync] 入队失败:', error)
    }
  }

  /**
   * 获取待同步队列中的所有条目
   * @returns {Promise<Array<Object>>}
   */
  async function getPendingQueue() {
    try {
      const allKeys = await keys()
      const queueKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith(PREFIX_QUEUE))
      const items = []

      for (const k of queueKeys) {
        const val = await get(k)
        if (val) items.push(val)
      }

      return items
    } catch (error) {
      console.error('[OfflineSync] 获取队列失败:', error)
      return []
    }
  }

  /**
   * 同步所有待处理条目到远程服务器
   * 在线模式下逐条尝试上传，成功后从队列移除
   * @returns {{ synced: number, failed: number }}
   */
  async function syncPendingItems() {
    if (isOfflineMode) {
      console.log('[OfflineSync] 当前离线模式，跳过同步')
      return { synced: 0, failed: 0 }
    }

    let synced = 0
    let failed = 0

    let queueItems = []
    try {
      queueItems = await getPendingQueue()
    } catch (e) {
      console.error('[OfflineSync] 同步失败：读取队列出错', e)
      return { synced: 0, failed: 0 }
    }

    for (const item of queueItems) {
      try {
        const result = await remoteSave(item)
        if (result.success) {
          // 成功后从队列中删除
          await del(item._queueId)
          synced++
        } else {
          item.retryCount = (item.retryCount || 0) + 1
          await set(item._queueId, item)
          failed++
        }
      } catch (e) {
        item.retryCount = (item.retryCount || 0) + 1
        await set(item._queueId, item)
        failed++
      }
    }

    return { synced, failed }
  }

  /**
   * 清空待同步队列
   */
  async function clearPendingQueue() {
    try {
      const allKeys = await keys()
      const queueKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith(PREFIX_QUEUE))

      for (const key of queueKeys) {
        await del(key)
      }
    } catch (error) {
      console.error('[OfflineSync] 清空队列失败:', error)
    }
  }

  return {
    saveToLocal,
    getLocalHistory,
    clearLocalHistory,
    queueForSync,
    getPendingQueue,
    syncPendingItems,
    clearPendingQueue
  }
}
