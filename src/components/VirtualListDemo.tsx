import { useMemo, useRef, useState } from 'react'
import { useFps } from '../perf/useFps'

const ITEM_HEIGHT = 40
const VIEWPORT_HEIGHT = 420

/**
 * 虚拟滚动 vs 全量渲染 对比实验
 * - 全量渲染：一次性创建 N 个 DOM 节点，滚动时浏览器需布局/绘制全部节点 → FPS 暴跌、DOM 数爆炸
 * - 虚拟滚动：仅渲染可视区域 + 缓冲区的少量节点，用占位撑开总高度，滚动时复用节点 → 节点数恒定、流畅
 */
export default function VirtualListDemo() {
  const [mode, setMode] = useState<'virtual' | 'normal'>('virtual')
  const [count, setCount] = useState(100000)
  const [scrollTop, setScrollTop] = useState(0)
  const { fps, jank } = useFps(true)

  const containerRef = useRef<HTMLDivElement>(null)
  const buffer = 4
  const visibleCount = Math.ceil(VIEWPORT_HEIGHT / ITEM_HEIGHT) + buffer

  const domCount = mode === 'virtual' ? Math.min(count, visibleCount) : count

  const slice = useMemo(() => {
    if (mode !== 'virtual') return []
    const start = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - buffer)
    const end = Math.min(count, start + visibleCount)
    const arr: number[] = []
    for (let i = start; i < end; i++) arr.push(i)
    return arr
  }, [mode, scrollTop, count])

  const totalHeight = count * ITEM_HEIGHT

  return (
    <section className="panel">
      <div className="panel__head">
        <h3>① 虚拟列表 · Virtual Scrolling</h3>
        <span className={`badge ${fps >= 50 ? 'badge--ok' : fps >= 30 ? 'badge--warn' : 'badge--bad'}`}>
          {fps} FPS · 掉帧 {jank}
        </span>
      </div>

      <div className="controls">
        <div className="seg">
          <button className={mode === 'virtual' ? 'seg__btn is-active' : 'seg__btn'} onClick={() => setMode('virtual')}>
            虚拟滚动
          </button>
          <button className={mode === 'normal' ? 'seg__btn is-active' : 'seg__btn'} onClick={() => setMode('normal')}>
            全量渲染
          </button>
        </div>
        <label className="field">
          数据量：
          <select value={count} onChange={(e) => setCount(Number(e.target.value))}>
            <option value={10000}>1 万</option>
            <option value={100000}>10 万</option>
            <option value={500000}>50 万</option>
          </select>
        </label>
      </div>

      <div className="stats">
        <div className="stat">
          <span className="stat__value">{count.toLocaleString()}</span>
          <span className="stat__label">总数据条数</span>
        </div>
        <div className="stat">
          <span className="stat__value">{domCount.toLocaleString()}</span>
          <span className="stat__label">实际 DOM 节点数</span>
        </div>
      </div>

      <div
        className="scroller"
        ref={containerRef}
        style={{ height: VIEWPORT_HEIGHT }}
        onScroll={(e) => setScrollTop((e.target as HTMLDivElement).scrollTop)}
      >
        {mode === 'normal' ? (
          <div>
            {Array.from({ length: count }, (_, i) => (
              <div className="row" style={{ height: ITEM_HEIGHT }} key={i}>
                <span className="row__idx">#{i}</span> 全量渲染条目
              </div>
            ))}
          </div>
        ) : (
          <div style={{ height: totalHeight, position: 'relative' }}>
            {slice.map((i) => (
              <div
                className="row row--virtual"
                key={i}
                style={{ height: ITEM_HEIGHT, position: 'absolute', top: i * ITEM_HEIGHT, left: 0, right: 0 }}
              >
                <span className="row__idx">#{i}</span> 虚拟滚动条目
              </div>
            ))}
          </div>
        )}
      </div>
      <p className="hint">
        切换「全量渲染」并快速滚动，观察 DOM 节点数暴涨到 {count.toLocaleString()}、FPS 直线下降；
        切回「虚拟滚动」后节点数恒定、滚动如丝。这正是长列表性能优化的核心手段。
      </p>
    </section>
  )
}
