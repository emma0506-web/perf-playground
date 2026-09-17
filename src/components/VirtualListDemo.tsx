import { useMemo, useRef, useState } from 'react'
import { useFps } from '../perf/useFps'

const ITEM_HEIGHT = 40
const VIEWPORT_HEIGHT = 420
/** 全量渲染为保护浏览器设上限：50 万节点一次性创建会冻结主线程数十秒，失去演示意义 */
const MAX_NORMAL = 100000

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

  // 全量模式下限制实际渲染条数，避免一次性创建过多节点长时间冻结页面
  const renderCount = mode === 'normal' ? Math.min(count, MAX_NORMAL) : count

  const domCount = mode === 'virtual' ? Math.min(count, visibleCount) : renderCount

  const slice = useMemo(() => {
    if (mode !== 'virtual') return []
    const start = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - buffer)
    const end = Math.min(count, start + visibleCount)
    const arr: number[] = []
    for (let i = start; i < end; i++) arr.push(i)
    return arr
  }, [mode, scrollTop, count])

  // 关键优化：全量列表的元素数组用 useMemo 固定引用。
  // FPS 徽章每秒 setState 会触发本组件重渲染，若每次都重建 10 万个元素并 diff，
  // 页面会被周期性冻住；引用不变时 React 会跳过这些子树，不产生任何 diff 开销。
  const normalRows = useMemo(
    () =>
      mode !== 'normal'
        ? []
        : Array.from({ length: renderCount }, (_, i) => (
            <div className="row" style={{ height: ITEM_HEIGHT }} key={i}>
              <span className="row__idx">#{i}</span> 全量渲染条目
            </div>
          )),
    [mode, renderCount]
  )

  const totalHeight = count * ITEM_HEIGHT

  const switchMode = (next: 'virtual' | 'normal') => {
    setMode(next)
    // 切换模式时回到列表顶部，保证两种模式从同一起点对比
    setScrollTop(0)
    if (containerRef.current) containerRef.current.scrollTop = 0
  }

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
          <button className={mode === 'virtual' ? 'seg__btn is-active' : 'seg__btn'} onClick={() => switchMode('virtual')}>
            虚拟滚动
          </button>
          <button className={mode === 'normal' ? 'seg__btn is-active' : 'seg__btn'} onClick={() => switchMode('normal')}>
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
        onScroll={(e) => {
          // 只在虚拟模式下记录滚动位置：全量模式由浏览器原生滚动，
          // 若在此 setState 会导致每次滚动都重渲染（历史上正是页面冻结的根因）
          if (mode === 'virtual') setScrollTop((e.target as HTMLDivElement).scrollTop)
        }}
      >
        {mode === 'normal' ? (
          <div>{normalRows}</div>
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
        切换「全量渲染」并快速滚动，观察 DOM 节点数暴涨、FPS 明显下降；切回「虚拟滚动」后节点数恒定、滚动如丝。
        这正是长列表性能优化的核心手段。
        {mode === 'normal' && count > MAX_NORMAL && (
          <>（全量模式为保护浏览器最多渲染 {MAX_NORMAL.toLocaleString()} 条，「50 万」仅在虚拟模式下展示占位高度）</>
        )}
      </p>
    </section>
  )
}
