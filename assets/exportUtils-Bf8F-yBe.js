import{o as e}from"./index-5p1Ip3co.js";function t(e){return new Promise((t,n)=>{e.oncomplete=e.onsuccess=()=>t(e.result),e.onabort=e.onerror=()=>n(e.error)})}function n(e,n){let r,i=()=>{if(r)return r;let i=indexedDB.open(e);return i.onupgradeneeded=()=>i.result.createObjectStore(n),r=t(i),r.then(e=>{e.onclose=()=>r=void 0},()=>{}),r};return(e,t)=>i().then(r=>t(r.transaction(n,e).objectStore(n)))}var r;function i(){return r||=n(`keyval-store`,`keyval`),r}function a(e,n=i()){return n(`readonly`,n=>t(n.get(e)))}function o(e,n,r=i()){return r(`readwrite`,r=>(r.put(n,e),t(r.transaction)))}function s(e,n=i()){return n(`readwrite`,n=>(n.delete(e),t(n.transaction)))}function c(e,n){return e.openCursor().onsuccess=function(){this.result&&(n(this.result),this.result.continue())},t(e.transaction)}function l(e=i()){return e(`readonly`,e=>{if(e.getAllKeys)return t(e.getAllKeys());let n=[];return c(e,e=>n.push(e.key)).then(()=>n)})}var u=`history_`,d=`sync_queue_`;function f(){let{isOfflineMode:t,saveCalcHistory:n}=e();async function r(e){try{let t=`${u}${Date.now()}_${Math.random().toString(36).slice(2,8)}`;await o(t,{...e,_localId:t,synced:!1,timestamp:e.timestamp||new Date().toISOString()})}catch(e){console.error(`[OfflineSync] 本地保存失败:`,e)}}async function i(e=100){try{let t=(await l()).filter(e=>typeof e==`string`&&e.startsWith(u)),n=[],r=t.slice(-e).reverse();for(let e of r){let t=await a(e);t&&n.push(t)}return n}catch(e){return console.error(`[OfflineSync] 获取本地历史失败:`,e),[]}}async function c(){try{let e=(await l()).filter(e=>typeof e==`string`&&e.startsWith(u));for(let t of e)await s(t)}catch(e){console.error(`[OfflineSync] 清空本地历史失败:`,e)}}async function f(e){try{let t=`${d}${Date.now()}_${Math.random().toString(36).slice(2,8)}`;await o(t,{...e,_queueId:t,queuedAt:new Date().toISOString(),retryCount:0})}catch(e){console.error(`[OfflineSync] 入队失败:`,e)}}async function p(){try{let e=(await l()).filter(e=>typeof e==`string`&&e.startsWith(d)),t=[];for(let n of e){let e=await a(n);e&&t.push(e)}return t}catch(e){return console.error(`[OfflineSync] 获取队列失败:`,e),[]}}async function m(){if(t)return console.log(`[OfflineSync] 当前离线模式，跳过同步`),{synced:0,failed:0};let e=0,r=0,i=[];try{i=await p()}catch(e){return console.error(`[OfflineSync] 同步失败：读取队列出错`,e),{synced:0,failed:0}}for(let t of i)try{(await n(t)).success?(await s(t._queueId),e++):(t.retryCount=(t.retryCount||0)+1,await o(t._queueId,t),r++)}catch{t.retryCount=(t.retryCount||0)+1,await o(t._queueId,t),r++}return{synced:e,failed:r}}async function h(){try{let e=(await l()).filter(e=>typeof e==`string`&&e.startsWith(d));for(let t of e)await s(t)}catch(e){console.error(`[OfflineSync] 清空队列失败:`,e)}}return{saveToLocal:r,getLocalHistory:i,clearLocalHistory:c,queueForSync:f,getPendingQueue:p,syncPendingItems:m,clearPendingQueue:h}}var p=1e-10;function m(e){return typeof e==`number`&&Number.isFinite(e)&&!isNaN(e)}function h(e,t=``){if(!m(e)||Math.abs(e)<p)throw Error(`${t?`[${t}] `:``}分母不能为零或接近零（当前值: ${e}）。请检查输入参数。`);return e}function g(e,t,n=null){return!m(e)||!m(t)||Math.abs(t)<p?n:e/t}function _(e){if(!e||e.length===0){alert(`没有可导出的数据！请先进行计算。`);return}let t=``;for(let n=0;n<e.length;n++){let r=e[n];if(!r)continue;let i=r.inputs?Object.entries(r.inputs).map(([e,t])=>`
        <tr class="input-row">
          <td>${x(r.moduleName||``)}</td>
          <td>输入</td>
          <td style="text-align:left">${x(e)}</td>
          <td>${t??`-`}</td>
        </tr>
      `).join(``):``,a=r.outputs?Object.entries(r.outputs).map(([e,t])=>`
        <tr class="output-row">
          <td>${x(r.moduleName||``)}</td>
          <td>结果</td>
          <td style="text-align:left">${x(e)}</td>
          <td style="color:#00FF00;font-weight:bold">${t??`-`}</td>
        </tr>
      `).join(``):``;t+=i+a}let n=`<!DOCTYPE html>
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
  <div class="meta">生成时间：${new Date().toLocaleString(`zh-CN`)}</div>
  <table>
    <thead>
      <tr><th>模块</th><th>类型</th><th>参数名</th><th>数值</th></tr>
    </thead>
    <tbody>${t}</tbody>
  </table>
</body></html>`,r=window.open(``,`_blank`);r?(r.document.write(n),r.document.close(),r.focus(),setTimeout(()=>r.print(),300)):alert(`弹窗被拦截，请允许浏览器弹窗后重试。`)}function v(e){if(!e||e.length===0){alert(`没有可导出的历史记录！`);return}let t=[`时间`,`模块`,`参数摘要`,`结果摘要`],n=e.map(e=>{let t=e.timestamp?new Date(e.timestamp).toLocaleString(`zh-CN`):`-`,n=e.moduleName||`-`,r=e.inputs?Object.entries(e.inputs).map(([e,t])=>`${e}:${t}`).join(`; `):``,i=e.outputs?Object.entries(e.outputs).map(([e,t])=>`${e}:${t}`).join(`; `):``;return[`"${t}"`,`"${n}"`,`"${r}"`,`"${i}"`].join(`,`)});y(`﻿`+t.join(`,`)+`
`+n.join(`
`),`调试专家_历史记录_${b()}.csv`,`text/csv;charset=utf-8`)}function y(e,t,n){let r=typeof e==`string`?new Blob([e],{type:n}):e,i=URL.createObjectURL(r),a=document.createElement(`a`);a.href=i,a.download=t,document.body.appendChild(a),a.click(),document.body.removeChild(a),URL.revokeObjectURL(i)}function b(){let e=new Date,t=e=>String(e).padStart(2,`0`);return`${e.getFullYear()}${t(e.getMonth()+1)}${t(e.getDate())}_${t(e.getHours())}${t(e.getMinutes())}${t(e.getSeconds())}`}function x(e){return e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}export{g as a,m as i,_ as n,f as o,h as r,v as t};