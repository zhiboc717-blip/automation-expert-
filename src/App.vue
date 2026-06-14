<!--
  根组件：路由出口 + 全局布局

  结构：
    - Navbar 导航栏（固定顶部）
    - 主内容区（router-view 路由出口）
    - Sidebar 历史侧边栏（可展开/收起）
-->

<template>
  <div class="min-h-screen flex flex-col bg-[#0a0e17]">
    <!-- 固定导航栏 -->
    <Navbar />

    <!-- 主体内容区 -->
    <main class="flex-1 pt-16">
      <router-view v-slot="{ Component, route }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>

    <!-- 公式悬浮窗 -->
    <FormulaModal
      v-if="store.state.formulaModalOpen"
      :module-id="store.state.formulaModalModule"
      @close="store.closeFormulaModal()"
    />
  </div>
</template>

<script setup>
/**
 * App 根组件
 * 作为应用的顶层容器，提供：
 *   - 全局布局框架（Navbar + Content）
 *   - 路由视图切换（含过渡动画）
 *   - 全局公式弹窗
 */
import Navbar from './components/layout/Navbar.vue'
import FormulaModal from './components/common/FormulaModal.vue'
import { calcStore as useCalcStore } from './stores/calcStore.js'

// 使用单例 store（与 Home.vue 共享同一状态）
const store = useCalcStore()
</script>

<style scoped>
/* 页面切换淡入淡出动画 */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.2s ease;
}
.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}
</style>
