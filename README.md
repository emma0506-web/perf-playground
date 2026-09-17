# perf-playground · 前端性能优化可视化实验室

> 把虚拟滚动、防抖/节流、图片懒加载这些高频性能优化手段，做成**可亲手操作、实时看数据**的交互 Demo。
> 源自真实业务沉淀：千万级金融前端首屏 2.8s → 0.6s、长列表稳定 60fps。

🌐 **在线 Demo**：https://emma-portfolio-d3g63enee42c92791-1489601674.tcloudbaseapp.com/perf-playground/

---

## ✨ 特性

- 🧪 **三个交互式实验**，点开即玩，数据实时跳动
- 📊 **每个实验都内置实时 FPS 自测仪表**（基于 `requestAnimationFrame` 测帧率 + 掉帧计数），全程肉眼可验收是否流畅
- 📉 **虚拟列表**：10 万条数据下，对比「全量渲染」与「虚拟滚动」的 DOM 节点数与 FPS
- ⏱️ **防抖 vs 节流**：同一输入框，raw / debounce / throttle 三种触发计数一目了然
- 🖼️ **图片懒加载**：IntersectionObserver 懒加载 vs 全量加载，实时统计「已加载」数量
- ⚡ **零后端依赖**：纯前端 React + TypeScript + Vite 构建

---

## 🚀 快速开始

```bash
npm install
npm run dev        # 本地开发 http://localhost:5173
npm run build      # 类型检查 + 生产构建到 dist/
npm run preview    # 本地预览构建产物
```

部署：将 `dist/` 静态文件托管到任意静态服务器（GitHub Pages / Vercel / 腾讯云 CloudBase 等）。
本项目 `vite.config.ts` 已设 `base: './'`，兼容子路径部署，避免线上资源 404。

---

## 🧩 实验原理

### ① 虚拟列表（Virtual Scrolling）
长列表性能优化的核心。普通渲染会把 N 条数据全部创建为 DOM 节点，滚动时浏览器需对全部节点做布局与绘制，
节点数越多越卡。虚拟滚动只渲染**可视区域 + 缓冲区**的少量节点，用一个撑开的占位元素维持总滚动高度，
滚动时通过 `scrollTop` 计算窗口并复用节点 —— 因此 DOM 节点数恒定（约十几个），FPS 始终流畅。

### ② 防抖 vs 节流（Debounce / Throttle）
- **raw**：每次输入事件立即触发，高频且浪费（如搜索联想会打爆接口）。
- **debounce（防抖）**：等用户「停手」`WAIT` 毫秒后才触发一次 —— 适合搜索联想、输入校验。
- **throttle（节流）**：每 `WAIT` 毫秒「至多」触发一次 —— 适合滚动监听、按钮防连点、resize。
两者都是把高频事件「削峰填谷」，区别在于「等结束」还是「控频率」。

### ③ 图片懒加载（Lazy Loading）
图片是首屏体积大户。全量加载会一次性请求所有图片，拖慢首屏。懒加载用 `IntersectionObserver`
监听元素是否进入（或即将进入）视口，进入才发起加载（Demo 中以骨架屏→彩色图模拟），
首屏只加载可见区域，滚动到哪加载到哪，显著缩短首屏、节省带宽。

---

## 🛠 技术栈

| 能力 | 实现 |
|---|---|
| 框架 | React 18 + TypeScript |
| 构建 | Vite 5（`base: './'` 兼容子路径） |
| 帧率测量 | `requestAnimationFrame` 自研 `useFps` hook |
| 懒加载 | 原生 `IntersectionObserver` |
| 防抖/节流 | 原生 `setTimeout` / 时间戳实现 |

---

## 📁 目录结构

```
perf-playground/
├── index.html
├── vite.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── perf/
│   │   └── useFps.ts              # 实时 FPS / 掉帧测量 hook
│   └── components/
│       ├── VirtualListDemo.tsx    # 实验① 虚拟列表
│       ├── DebounceThrottleDemo.tsx # 实验② 防抖/节流
│       └── LazyImageDemo.tsx      # 实验③ 图片懒加载
└── README.md
```
