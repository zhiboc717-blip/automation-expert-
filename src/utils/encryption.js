/**
 * AES-256 加解密工具
 * 使用 crypto-js 库实现 AES 加密/解密
 * 支持从用户密码派生密钥
 */

import CryptoJS from 'crypto-js'

/** 默认加密密钥（仅用于离线模式下的本地存储） */
const DEFAULT_KEY = 'automation-expert-default-key-2024'

/**
 * 从用户密码派生 AES 密钥（使用 SHA-256 哈希）
 * @param {string} password - 用户密码/口令
 * @returns {string} 派生的256位十六进制密钥
 */
export function deriveKey(password) {
  if (!password || typeof password !== 'string') {
    return DEFAULT_KEY
  }
  return CryptoJS.SHA256(password).toString()
}

/**
 * AES 加密
 * @param {string} text - 明文内容
 * @param {string} [key] - 加密密钥（可选，不传则使用默认密钥）
 * @returns {string} Base64 编码的密文（含 IV 前缀）
 */
export function encrypt(text, key) {
  if (!text || typeof text !== 'string') return ''

  const derivedKey = key || DEFAULT_KEY
  // 每次加密生成随机 IV（初始化向量），增强安全性
  const iv = CryptoJS.lib.WordArray.random(128 / 8)
  const encrypted = CryptoJS.AES.encrypt(text, CryptoJS.enc.Utf8.parse(derivedKey), {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })

  // 将 IV 和密文拼接：IV(32字符hex) + :: + 密文(base64)
  return iv.toString() + '::' + encrypted.toString()
}

/**
 * AES 解密
 * @param {string} ciphertext - 密文（含IV前缀格式）
 * @param {string} [key] - 解密密钥（必须与加密时一致）
 * @returns {string} 解密后的明文；解密失败返回空字符串
 */
export function decrypt(ciphertext, key) {
  if (!ciphertext || typeof ciphertext !== 'string') return ''

  const derivedKey = key || DEFAULT_KEY

  try {
    // 解析 IV 和实际密文
    const separatorIndex = ciphertext.indexOf('::')
    if (separatorIndex === -1) {
      console.warn('[encryption] 无效的密文格式（缺少IV前缀）')
      return ''
    }

    const ivHex = ciphertext.substring(0, separatorIndex)
    const encryptedData = ciphertext.substring(separatorIndex + 2)

    const iv = CryptoJS.enc.Hex.parse(ivHex)
    const decrypted = CryptoJS.AES.decrypt(encryptedData, CryptoJS.enc.Utf8.parse(derivedKey), {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })

    const result = decrypted.toString(CryptoJS.enc.Utf8)
    return result || ''
  } catch (error) {
    console.error('[encryption] 解密失败:', error.message)
    return ''
  }
}
