/**
 * Supabase 连接 Composable
 *
 * 使用环境变量 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY。
 * 如果未配置环境变量则进入"离线模式"，功能降级但前端计算器完全可用。
 *
 * 提供：signIn, signOut, getUser, saveCalcHistory, getCalcHistory, uploadFile, downloadFile
 */

import { ref, computed } from 'vue'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

/** 是否处于离线模式（未配置Supabase凭据） */
const isOfflineMode = !supabaseUrl || !supabaseAnonKey

let client = null

// 延迟导入 Supabase 客户端（避免在离线模式下报错）
if (!isOfflineMode) {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    client = createClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.warn('[Supabase] 初始化失败，进入离线模式:', error.message)
    client = null
  }
}

/** 当前登录用户信息 */
const currentUser = ref(null)
const isLoading = ref(false)

/**
 * Supabase composable
 * @returns {{
 *   client: object|null,
 *   isOfflineMode: boolean,
 *   currentUser: import('vue').Ref<object|null>,
 *   isLoggedIn: import('vue').ComputedRef<boolean>,
 *   isLoading: import('vue').Ref<boolean>,
 *   signIn: (email: string, password: string) => Promise<{success:boolean,error?:string}>,
 *   signOut: () => Promise<void>,
 *   getUser: () => Promise<object|null>,
 *   saveCalcHistory: (record: Object) => Promise<{success:boolean,error?:string,data?:object}>,
 *   getCalcHistory: (limit?: number) => Promise<Array<Object>>,
 *   uploadFile: (bucket: string, path: string, file: File|Blob, contentType?: string) => Promise<string|undefined>,
 *   downloadFile: (bucket: string, path: string) => Promise<Blob|undefined>
 * }}
 */
export function useSupabase() {
  const isLoggedIn = computed(() => currentUser.value != null && !isOfflineMode)

  /**
   * 邮箱+密码登录
   */
  async function signIn(email, password) {
    if (isOfflineMode || !client) {
      return { success: false, error: '当前为离线模式，请先在 .env 文件中配置 Supabase 凭据' }
    }

    try {
      isLoading.value = true
      const { data, error } = await client.auth.signInWithPassword({ email, password })

      if (error) {
        return { success: false, error: error.message }
      }

      currentUser.value = data.user
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message || '登录失败' }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 登出
   */
  async function signOut() {
    if (client) {
      try {
        await client.auth.signOut()
      } catch (e) { /* ignore */ }
    }
    currentUser.value = null
  }

  /**
   * 获取当前已认证的用户信息
   */
  async function getUser() {
    if (isOfflineMode || !client) return null

    try {
      const { data: { user } } = await client.auth.getUser()
      currentUser.value = user
      return user
    } catch (e) {
      return null
    }
  }

  /**
   * 保存计算历史记录到 Supabase 数据库
   * @param {Object} record - 记录数据，包含 moduleName, inputs, outputs, note 等
   */
  async function saveCalcHistory(record) {
    if (isOfflineMode || !client) {
      return {
        success: false,
        error: '离线模式 — 已自动保存到本地 IndexedDB',
        data: record
      }
    }

    try {
      const { data, error } = await client.from('calc_history').insert({
        user_id: currentUser.value?.id,
        module_name: record.moduleName,
        inputs: record.inputs,
        outputs: record.outputs,
        note: record.note || '',
        created_at: new Date().toISOString()
      }).select()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data: data?.[0] || record }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  /**
   * 从 Supabase 获取历史记录
   * @param {number} [limit=50] - 最大返回条数
   * @returns {Array<Object>} 历史记录数组
   */
  async function getCalcHistory(limit = 50) {
    if (isOfflineMode || !client) {
      return []
    }

    try {
      const userId = currentUser.value?.id
      let query = client
        .from('calc_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query
      if (error) {
        console.error('[Supabase] 获取历史失败:', error.message)
        return []
      }

      return data || []
    } catch (e) {
      console.error('[Supabase] 获取历史异常:', e)
      return []
    }
  }

  /**
   * 上传文件到 Supabase Storage
   * @param {string} bucket - 存储桶名
   * @param {string} path - 存储路径
   * @param {File|Blob} file - 文件对象
   * @param {string} [contentType] - MIME 类型
   * @returns {string|undefined} 公开访问 URL 或 undefined 表示失败
   */
  async function uploadFile(bucket, path, file, contentType) {
    if (isOfflineMode || !client) return undefined

    try {
      const { error } = client.storage
        .from(bucket)
        .upload(path, file, { contentType, upsert: true })

      if (error) {
        console.error('[Supabase] 上传文件失败:', error.message)
        return undefined
      }

      const { data: urlData } = client.storage
        .from(bucket)
        .getPublicUrl(path)

      return urlData?.publicUrl
    } catch (e) {
      console.error('[Supabase] 上传文件异常:', e)
      return undefined
    }
  }

  /**
   * 从 Supabase Storage 下载文件
   * @param {string} bucket - 存储桶名
   * @param {string} path - 存储路径
   * @returns {Promise<Blob|undefined>} 文件 Blob
   */
  async function downloadFile(bucket, path) {
    if (isOfflineMode || !client) return undefined

    try {
      const { data, error } = client.storage
        .from(bucket)
        .download(path)

      if (error) {
        console.error('[Supabase] 下载文件失败:', error.message)
        return undefined
      }

      return data
    } catch (e) {
      console.error('[Supabase] 下载文件异常:', e)
      return undefined
    }
  }

  return {
    client,
    isOfflineMode,
    currentUser,
    isLoggedIn,
    isLoading,
    signIn,
    signOut,
    getUser,
    saveCalcHistory,
    getCalcHistory,
    uploadFile,
    downloadFile
  }
}
