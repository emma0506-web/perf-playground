import VirtualListDemo from './components/VirtualListDemo'
import DebounceThrottleDemo from './components/DebounceThrottleDemo'
import LazyImageDemo from './components/LazyImageDemo'

export default function App() {
  return (
    <>
      <a href="#main" className="skip-link">跳到主内容</a>
      <div className="app">
        <header className="hero">
        <div className="hero__inner">
          <p className="hero__eyebrow">FRONTEND PERFORMANCE LAB</p>
          <h1 className="hero__title">perf-playground</h1>
          <p className="hero__lead">
            前端性能优化<strong>可视化实验室</strong>：把虚拟滚动、防抖/节流、图片懒加载这些高频优化手段，
            做成可<span>亲手操作、实时看数据</span>的交互 Demo。
          </p>
          <p className="hero__sub">
            源自真实业务沉淀 —— 千万级金融前端首屏 2.8s → 0.6s、长列表稳定 60fps。
          </p>
        </div>
      </header>

      <main id="main" className="main">
        <VirtualListDemo />
        <DebounceThrottleDemo />
        <LazyImageDemo />
      </main>

      <footer className="footer">
        <p>perf-playground · React + TypeScript + Vite 构建 · 零后端依赖，纯前端性能实验</p>
      </footer>
    </div>
    </>
  )
}
