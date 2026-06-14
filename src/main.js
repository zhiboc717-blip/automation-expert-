/**
 * 应用入口文件
 *
 * 挂载 Vue 应用实例，注册全局插件：
 *   - Vue Router (路由)
 *   - Tailwind CSS (通过 main.css 引入)
 *   - 初始化单位系统（从 localStorage 恢复）
 */

import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './styles/main.css'

// 初始化单位系统（恢复用户上次选择）
import { initUnitSystem } from './composables/useUnitSystem.js'
initUnitSystem()

const app = createApp(App)

app.use(router)

app.mount('#app')
