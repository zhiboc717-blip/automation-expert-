/**
 * Vue Router 路由配置
 * 包含：首页（计算器）、登录页、历史记录页
 */

import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: '自动化调试专家' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录 / 注册' }
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('../views/History.vue'),
    meta: { title: '历史记录' }
  },
  {
    // 兜底：未匹配的路由重定向到首页
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // 页面切换时滚动到顶部
  scrollBehavior() {
    return { top: 0 }
  }
})

// 路由守卫 — 自动更新页面标题
router.beforeEach((to) => {
  const title = to.meta?.title || '自动化调试专家'
  document.title = `${title} · 综合云平台`
})

export default router
