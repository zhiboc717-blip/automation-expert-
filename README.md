# 自动化调试专家 · 综合云平台

> 面向电气工程师和自动化从业者的专业计算工具集，涵盖脉冲/距离换算、电子齿轮比、变频器线速度、辊筒同步等  大核心模块。

## ✨ 功能特性

### 🧮 六大核心计算模块

| 模块 | 名称 | 核心功能 |
|------|------|----------|
| **A** | 脉冲/距离换算 | 脉冲数 ↔ 移动距离，支持丝杠/辊筒两种模式 |
| **B** | 频率/速度转换 | 给定速度 → 脉冲频率 / 给定频率 → 线速度 |
| **C** | 电子齿轮比 | 直线/旋转模式，**GCD 最大公约数化简**为整数比 |
| **D** | 变频器线速度 | 电机转速→线速 / 输入频率→线速 / 反算电机转速 |
| **E** | 辊筒同步比 | 主/从辊筒直径同步，可算从动目标频率 |
| **F** | 加减速斜坡 + Modbus 地址 | S曲线加减速参数 / Modbus寄存器地址十六进制转换 |

### 🔒 安全与可靠性

- **零除保护**：所有除法运算均含分母零值检测
- **GCD 化简**：齿轮比自动化简为最简整数形式（欧几里得算法）
- **AES-256 加密**：备注内容可选加密存储（crypto-js CBC 模式）
- **离线缓存**：IndexedDB 本地存储 + PWA Service Worker

### 📐 工业级 UI

- 深色工业主题（背景 #0a0e17，荧光绿高亮结果）
- 步进调参组件（±按钮 + 可选步长 ×0.01/×1/×10/×1000）
- 公式弹窗：每个模块均可查看推导公式
- 公制/英制单位切换
- 响应式布局，适配桌面和平板

### 📤 导出与打印

- 参数总表 HTML 打印预览
- CSV 导出（UTF-8 BOM，Excel 友好）
- 计算历史云端存储（Supabase）+ 本地 IndexedDB 双轨备份

### 🔐 用户系统

- Supabase Auth 邮箱密码登录/注册
- 离线模式自动降级
- 计算历史记录管理（筛选/删除/清空）

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3 Composition API (`<script setup>`) |
| 构建 | Vite 5 + `@tailwindcss/vite` (v4) |
| 样式 | Tailwind CSS v4 自定义主题 |
| 路由 | Vue Router 4 |
| 认证 | Supabase Auth |
| 加密 | crypto-js (AES-256-CBC) |
| Markdown | marked + DOMPurify |
| 离线 | idb-keyval (IndexedDB) + vite-plugin-pwa (Workbox) |
| 导出 | 动态 HTML 打印 + CSV (BOM header) |

## 🚀 快速开始

### 前置要求

- Node.js >= 18
- npm >= 9
- （可选）Supabase 项目账号

### 安装运行

```bash
# 克隆仓库
git clone <your-repo-url>
cd automation-expert

# 安装依赖
npm install

# 复制环境变量模板
cp .env.example .env
# 编辑 .env 填入你的 Supabase 凭证（可选，不填则离线模式）

# 开发模式
npm run dev

# 生产构建
npm run build

# 预览构建产物
npm run preview
```

### Supabase 配置（可选）

1. 创建 [Supabase 项目](https://supabase.com)
2. 在 Settings > API 中获取 URL 和 anon key
3. 在 SQL Editor 中创建 `calc_history` 表：

```sql
create table calc_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  module char(1) not null,
  inputs jsonb not null,
  results jsonb not null,
  note text,
  created_at timestamptz default now()
);

-- 启用 RLS
alter table calc_history enable row level security;

create policy "Users can read own history"
  on calc_history for select
  using (auth.uid() = user_id);

create policy "Users can insert own history"
  on calc_history for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own history"
  on calc_history for delete
  using (auth.uid() = user_id);
```

4. 将凭证填入 `.env` 文件

## 📁 项目结构

```
src/
├── main.js                    # 入口文件
├── App.vue                    # 根组件
├── router/index.js            # Vue Router 配置
├── styles/main.css            # 全局样式 + Tailwind v4 主题
├── stores/calcStore.js        # 全局响应式状态管理
├── utils/
│   ├── calculations.js        # ★ 核心算法库（6大模块 A-F）
│   ├── gcd.js                # GCD 最大公约数 & 比值化简
│   ├── validators.js          # 数值校验 & 零除保护
│   ├── encryption.js          # AES-256-CBC 加解密
│   └── exportUtils.js         # 打印报表 & CSV 导出
├── composables/
│   ├── useUnitSystem.js       # 单位制（公制/英制）切换
│   ├── useOfflineSync.js      # IndexedDB 离线同步队列
│   └── useSupabase.js         # Supabase 客户端封装
├── views/
│   ├── Home.vue               # 主页（模块选择 + 计算 + 备注）
│   ├── Login.vue              # 登录页
│   └── History.vue            # 历史记录
├── components/
│   ├── layout/                # Navbar / Sidebar / UnitToggle
│   ├── common/                # NumberInput / CalcButton / ResultPanel / FormulaModal
│   ├── modules/               # ModuleA ~ ModuleF（6个计算模块组件）
│   ├── notes/                 # NoteEditor / FileUpload / EncryptToggle
│   └── export/                # PrintReport
```

## 📋 开发计划完成状态

| 步骤 | 内容 | 状态 |
|------|------|------|
| 1 | 项目初始化与依赖安装 | ✅ 完成 |
| 2 | 全局 UI 骨架搭建（深色工业主题） | ✅ 完成 |
| 3 | 模块 A-F 核心算法与表单 | ✅ 完成 |
| 4 | Supabase Auth 登录集成 | ✅ 完成 |
| 5 | 备注编辑器、附件上传、离线缓存 | ✅ 完成 |
| 6 | 参数总表打印与 CSV 导出 | ✅ 完成 |

## 📄 License

MIT

---

**面向工业现场，服务一线工程师。** ⚡
