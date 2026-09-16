import { useEffect, useRef, useState } from 'react'

const TOTAL = 300

function gradient(i: number): string {
  const h = (i * 47) % 360
  return `linear-gradient(135deg, hsl(${h} 70% 62%), hsl(${(h + 40) % 360} 70% 52%))`
}

/**
 * 图片懒加载可视化对比
 * - 懒加载：仅当卡片进入（或即将进入）视口时才“加载”（由 IntersectionObserver 触发）
 * - 全量加载：一次性全部加载，无论是否在视口内
 * 下方“已加载”计数直观展示：懒加载首屏只加载少量，滚动到哪加载到哪。
 */
export default function LazyImageDemo() {
  const [lazy, setLazy] = useState(true)
  const [loaded, setLoaded] = useState<Set<number>>(new Set())
  const scrollRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const timers = useRef<Record<number, number>>({})

  // 模式切换时重置加载状态
  useEffect(() => {
    Object.values(timers.current).forEach((t) => clearTimeout(t))
    timers.current = {}
    if (lazy) {
      setLoaded(new Set())
    } else {
      const all = new Set<number>()
      for (let i = 0; i < TOTAL; i++) all.add(i)
      setLoaded(all)
    }
  }, [lazy])

  // 懒加载：用 IntersectionObserver 监听卡片进入视口
  useEffect(() => {
    if (!lazy) return
    const root = scrollRef.current
    const grid = gridRef.current
    if (!root || !grid) return

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          const idx = Number((e.target as HTMLElement).dataset.idx)
          io.unobserve(e.target)
          // 模拟图片异步加载耗时
          if (timers.current[idx] === undefined) {
            timers.current[idx] = window.setTimeout(() => {
              setLoaded((prev) => {
                const next = new Set(prev)
                next.add(idx)
                return next
              })
              delete timers.current[idx]
            }, 150 + Math.random() * 400)
          }
        })
      },
      { root, rootMargin: '60px' }
    )

    grid.querySelectorAll('[data-idx]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [lazy])

  return (
    <section className="panel">
      <div className="panel__head">
        <h3>③ 图片懒加载 · Lazy Loading</h3>
        <span className={`badge ${lazy ? 'badge--ok' : 'badge--bad'}`}>已加载 {loaded.size} / {TOTAL}</span>
      </div>

      <div className="controls">
        <div className="seg">
          <button className={lazy ? 'seg__btn is-active' : 'seg__btn'} onClick={() => setLazy(true)}>
            懒加载（IO）
          </button>
          <button className={!lazy ? 'seg__btn is-active' : 'seg__btn'} onClick={() => setLazy(false)}>
            全量加载
          </button>
        </div>
      </div>

      <div className="scroller scroller--grid" ref={scrollRef}>
        <div className="grid" ref={gridRef}>
          {Array.from({ length: TOTAL }, (_, i) => (
            <div className="cell" data-idx={i} key={i}>
              {loaded.has(i) ? (
                <div className="cell__img" style={{ background: gradient(i) }}>
                  #{i}
                </div>
              ) : (
                <div className="cell__skeleton" />
              )}
            </div>
          ))}
        </div>
      </div>
      <p className="hint">
        切到「懒加载」并向下滚动，只有滚到的卡片才从骨架屏变为彩色图；「全量加载」则一次性全部渲染。
        首屏只加载可见区域，正是缩短首屏、节省带宽的关键。
      </p>
    </section>
  )
}
