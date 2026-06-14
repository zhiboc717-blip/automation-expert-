/**
 * 导出与打印工具
 * 支持 CSV 导出、HTML 打印报表生成
 */

import { guardZero } from './validators.js'

/**
 * 生成打印报表 HTML 并触发浏览器打印
 * @param {Array<{moduleName, inputs, outputs, timestamp}>} allModulesData - 所有模块的计算数据
 */
export function generatePrintReport(allModulesData) {
  if (!allModulesData || allModulesData.length === 0) {
    alert('没有可导出的数据！请先进行计算。')
    return
  }

  let tableRows = ''

  for (let i = 0; i < allModulesData.length; i++) {
    const mod = allModulesData[i]
    if (!mod) continue

    // 参数行
    const inputRows = mod.inputs
      ? Object.entries(mod.inputs).map(([key, val]) => `
        <tr class="input-row">
          <td>${escapeHtml(mod.moduleName || '')}</td>
          <td>输入</td>
          <td style="text-align:left">${escapeHtml(key)}</td>
          <td>${val != null ? val : '-'}</td>
        </tr>
      `).join('')
      : ''

    // 结果行
    const outputRows = mod.outputs
      ? Object.entries(mod.outputs).map(([key, val]) => `
        <tr class="output-row">
          <td>${escapeHtml(mod.moduleName || '')}</td>
          <td>结果</td>
          <td style="text-align:left">${escapeHtml(key)}</td>
          <td style="color:#00FF00;font-weight:bold">${val != null ? val : '-'}</td>
        </tr>
      `).join('')
      : ''

    tableRows += inputRows + outputRows
  }

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>自动化调试专家 · 参数总表</title>
  <style>
    body { font-family: "Microsoft YaHei", Arial, sans-serif; background: #fff; color: #111; padding: 24px; }
    h1 { text-align:center; color:#111827; border-bottom:2px solid #00FF00; padding-bottom:12px; margin-bottom:20px;}
    .meta { text-align:center; color:#666; font-size:14px; margin-bottom:16px; }
    table { width:100%; border-collapse:collapse; font-size:13px; }
    th { background:#111827; color:#e5e7eb; padding:10px 16px; text-align:left; }
    td { padding:8px 16px; border-bottom:1px solid #e5e7eb; }
    tr:nth-child(even){ background:#f9fafb; }
    .output-row td:last-child { color:#059669; font-weight:bold; }
    @media print { body{padding:0;} h1{font-size:18px;} table{font-size:11px;} th,td{padding:6px 10px;} }
  </style>
</head>
<body>
  <h1>⚙ 自动化调试专家 — 参数总表</h1>
  <div class="meta">生成时间：${new Date().toLocaleString('zh-CN')}</div>
  <table>
    <thead>
      <tr><th>模块</th><th>类型</th><th>参数名</th><th>数值</th></tr>
    </thead>
    <tbody>${tableRows}</tbody>
  </table>
</body></html>`

  // 创建新窗口并写入 HTML 内容
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    // 等待内容加载完成后自动弹出打印对话框
    setTimeout(() => printWindow.print(), 300)
  } else {
    alert('弹窗被拦截，请允许浏览器弹窗后重试。')
  }
}

/**
 * 导出历史记录为 CSV 文件下载
 * @param {Array<Object>} historyRecords - 历史记录数组
 */
export function exportToCSV(historyRecords) {
  if (!historyRecords || historyRecords.length === 0) {
    alert('没有可导出的历史记录！')
    return
  }

  // CSV 表头
  const headers = ['时间', '模块', '参数摘要', '结果摘要']
  const rows = historyRecords.map((record) => {
    const time = record.timestamp
      ? new Date(record.timestamp).toLocaleString('zh-CN')
      : '-'
    const module = record.moduleName || '-'
    const paramsSummary = record.inputs
      ? Object.entries(record.inputs)
          .map(([k, v]) => `${k}:${v}`)
          .join('; ')
      : ''
    const resultSummary = record.outputs
      ? Object.entries(record.outputs)
          .map(([k, v]) => `${k}:${v}`)
          .join('; ')
      : ''

    return [
      `"${time}"`,
      `"${module}"`,
      `"${paramsSummary}"`,
      `"${resultSummary}"`
    ].join(',')
  })

  const csvContent = '\uFEFF' + headers.join(',') + '\n' + rows.join('\n') // BOM for Excel UTF-8

  downloadFile(csvContent, `调试专家_历史记录_${formatDateForFilename()}.csv`, 'text/csv;charset=utf-8')
}

/**
 * 通用的文件下载辅助函数
 * @param {string|Blob} content - 文件内容或 Blob 对象
 * @param {string} filename - 目标文件名
 * @param {string} mimeType - MIME 类型
 */
function downloadFile(content, filename, mimeType) {
  const blob =
    typeof content === 'string'
      ? new Blob([content], { type: mimeType })
      : content

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 格式化日期用于文件名（如 20260609_131841）
 * @returns {string}
 */
function formatDateForFilename() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
}

/**
 * HTML 特殊字符转义，防止 XSS
 * @param {string} str - 原始字符串
 * @returns {string} 转义后安全字符串
 */
function escapeHtml(str) {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
