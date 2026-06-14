<!--
  公式悬浮窗组件（Modal）

  显示每个模块的计算原理与公式说明。
  点击关闭不丢失当前模块已输入的数据。

  Props:
    moduleId — 要展示公式的模块 ID ('A' ~ 'F')

  Events:
    close — 用户关闭弹窗时触发
-->

<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content animate-fade-in-up w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto rounded-xl bg-[#111827] border border-[#1f2937] shadow-2xl">
        <!-- 弹窗头部 -->
        <div class="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-[#1f2937] bg-[#111827] rounded-t-xl">
          <div class="flex items-center gap-2.5">
            <span class="text-xl">{{ moduleInfo?.icon }}</span>
            <h2 class="text-lg font-bold text-[#e5e7eb]">{{ moduleInfo?.name }}</h2>
            <span class="text-xs px-2 py-0.5 rounded-full bg-[#3b82f6]/15 text-[#3b82f6] border border-[#3b82f6]/30">原理与公式</span>
          </div>
          <button
            @click="$emit('close')"
            class="p-1.5 rounded-lg hover:bg-[#1f2937] text-[#9ca3af] hover:text-[#e5e7eb] transition-colors cursor-pointer bg-transparent border-none"
            title="关闭（数据保留）"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 公式内容区 -->
        <div class="p-5 space-y-5 text-sm leading-relaxed">
          <div v-for="(section, idx) in formulaSections" :key="idx" class="space-y-2">
            <!-- 小节标题 -->
            <h3 class="text-base font-semibold text-[#FFD700] flex items-center gap-1.5">
              {{ section.title }}
            </h3>

            <!-- 公式列表 -->
            <div
              v-for="(formula, fIdx) in section.formulas"
              :key="fIdx"
              class="p-3 rounded-lg bg-[#0d1321] border border-[#1f2937]"
            >
              <p class="font-mono text-[#e5e7eb] whitespace-pre-wrap leading-relaxed">
                {{ formula.text }}
              </p>
              <p v-if="formula.desc" class="mt-1.5 text-xs text-[#9ca3af]">
                💡 {{ formula.desc }}
              </p>
            </div>
          </div>

          <!-- 注意事项 -->
          <div class="p-3 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20 space-y-1.5">
            <p class="text-sm font-semibold text-[#ef4444]">⚠️ 注意事项</p>
            <ul class="list-disc list-inside text-xs text-[#9ca3af] space-y-1">
              <li>所有分母变量在除法前会进行防零校验，避免除以零错误</li>
              <li>脉冲计算结果四舍五入取整数</li>
              <li>电子齿轮比必须通过 GCD 化简为最简整数比后才能写入驱动器参数</li>
              <li>Modbus 地址格式需为 3xxxxx 或 4xxxxx</li>
            </ul>
          </div>
        </div>

        <!-- 底部操作栏 -->
        <div class="sticky bottom-0 p-4 border-t border-[#1f2937] bg-[#111827] rounded-b-xl flex justify-end">
          <button
            @click="$emit('close')"
            class="px-5 py-2 rounded-lg bg-[#1f2937] hover:bg-[#374151] text-[#e5e7eb] text-sm font-medium transition-colors cursor-pointer border-none"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** 模块ID */
  moduleId: {
    type: String,
    required: true
  }
})

defineEmits(['close'])

/**
 * 各模块的基本信息映射表
 */
const MODULE_INFO_MAP = {
  A: { id: 'A', name: '脉冲与距离互算', icon: '📏' },
  B: { id: 'B', name: '频率与速度互算', icon: '🔄' },
  C: { id: 'C', name: '电子齿轮比计算', icon: '⚙️' },
  D: { id: 'D', name: '变频器线速度', icon: '🌀' },
  E: { id: 'E', name: '大小滚轴同步', icon: '🔗' },
  F: { id: 'F', name: '加减速与Modbus地址', icon: '📡' }
}

/** 当前模块信息 */
const moduleInfo = computed(() => MODULE_INFO_MAP[props.moduleId])

/**
 * 各模块的公式内容定义
 * 每个模块包含多个小节，每小节包含公式和描述
 */
const FORMULA_CONTENTS = {
  A: [
    {
      title: '基本概念',
      formulas: [
        { text: 'L（进给常数）= π × 滚筒直径\n  （若是丝杆，则 L = 导程，无需乘π）', desc: '滚筒旋转一圈所移动的直线距离' },
        { text: '每当量脉冲 (Pulse/mm) = (电机单圈脉冲数 × 减速比) / L', desc: '移动1毫米需要发送多少个脉冲给驱动器' },
        { text: '脉冲当量 (mm/Pulse) = L / (电机单圈脉冲数 × 减速比)', desc: '每个脉冲对应实际移动的距离（上述公式的倒数）' }
      ]
    },
    {
      title: '核心换算',
      formulas: [
        { text: '目标脉冲总数 = round( 目标移动距离(mm) × 每当量脉冲 )', desc: '四舍五入取整，因为控制器只能发送整数个脉冲' },
        { text: '实际距离(mm) = 累计脉冲量 ÷ 每当量脉冲', desc: '根据编码器反馈的累计脉冲反算实际位移' }
      ]
    }
  ],
  B: [
    {
      title: '频率 → 速度',
      formulas: [
        { text: '发送频率(Hz) = 目标速度(mm/s) × 每当量脉冲(Pulse/mm)', desc: '要达到指定速度，需要向驱动器发送多快的脉冲频率' },
        { text: '若输入单位为 m/min:\n  目标速度(mm/s) = (m/min × 1000) ÷ 60', desc: '先统一转换为 mm/s 再代入主公式' }
      ]
    },
    {
      title: '速度 → 频率（反向求解）',
      formulas: [
        { text: '实际速度(mm/s) = 当前频率(Hz) ÷ 每当量脉冲', desc: '根据当前设定的脉冲频率反推实际运行线速度' }
      ]
    }
  ],
  C: [
    {
      title: '电子齿轮比原理',
      formulas: [
        { text: '直线模式：B/A = (伺服设定脉冲数 × 减速比) ÷ 期望每圈脉冲数', desc: '用于匹配外部编码器/光栅尺与电机脉冲的关系' },
        { text: '旋转模式：B/A = (编码器原生分辨率 × 减速比) ÷ 3600', desc: '3600 表示将一圈360°细分为 3600 个 0.1° 刻度' }
      ]
    },
    {
      title: 'GCD 化简（关键！）',
      formulas: [
        { text: '原始比值 B/A 必须通过最大公约数(GCD)化简为最简整数比！', desc: '例如：B=6000, A=200 → GCD=200 → B/A = 30:1' },
        { text: '化简后的 B 和 A 才能写入驱动器的电子齿轮参数', desc: '大多数驱动器要求 B、A 为正整数且尽可能小' }
      ]
    }
  ],
  D: [
    {
      title: '转速 → 线速度',
      formulas: [
        { text: '滚筒转速(基于电机,RPM) = 电机转速(RPM) ÷ 减速比', desc: '通过减速箱减速后滚筒的实际转速' },
        { text: '滚筒转速(基于频率,RPM) = ((60 × 变频器频率Hz) ÷ 极对数) ÷ 减速比', desc: '异步电机的同步转速公式：n = 60f/p' },
        { text: '实际线速度(m/min) = (π × 滚筒直径(mm) × 滚筒转速RPM) ÷ 1000', desc: '圆周运动转线速度，注意单位统一' }
      ]
    },
    {
      title: '反向求解：线速度 → 所需转速',
      formulas: [
        { text: '所需电机转速(RPM) = (目标线速度(m/min) × 减速比 × 1000) ÷ (π × 滚筒直径)', desc: '已知需要的线速度，反求变频器应输出的频率对应的电机转速' }
      ]
    }
  ],
  E: [
    {
      title: '同步倍率计算',
      formulas: [
        { text: '同步倍率 K = 主机滚轴直径 ÷ 从机滚轴直径', desc: '直径越大，同角速度下线速度越快' },
        { text: '从机目标频率(Hz) = 主机实时读取频率(Hz) × K', desc: '从机按此比例跟随主机频率变化' }
      ]
    },
    {
      title: '典型应用场景',
      formulas: [
        { text: '例：主机直径200mm，从机直径100mm\n  K = 200/100 = 2\n  若主机频率50Hz，从机应设为 50×2 = 100Hz', desc: '适用于印刷、涂布等需要多辊同步的行业' }
      ]
    }
  ],
  F: [
    {
      title: '加减速斜率',
      formulas: [
        { text: '加减速斜率(Hz/s) = 目标最高频率(Hz) ÷ 加速时间(s)', desc: '斜率越大表示加减速越急促，可能导致过载报警' },
        { text: '建议：根据负载惯量和电机能力合理设置加速时间', desc: '通常在 0.1s ~ 10s 范围内' }
      ]
    },
    {
      title: 'Modbus 十六进制地址换算',
      formulas: [
        { text: '物理十进制地址 = (用户输入地址剔除首位的数字) − 1', desc: 'Modbus 协议中 40001 对应寄存器地址 0' },
        { text: '最终结果转为十六进制：0xXXXX', desc: '例：40100 → (0100−1)=99 → 0x0063' },
        { text: '例：30002 → (0002−1)=1 → 0x0001', desc: '3xxxxx 系列同样处理方式' }
      ]
    }
  ]
}

/** 当前模块的公式内容 */
const formulaSections = computed(() => FORMULA_CONTENTS[props.moduleId] || [])
</script>
