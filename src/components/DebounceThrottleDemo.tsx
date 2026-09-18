import { useRef, useState } from 'react'
import { useFps } from '../perf/useFps'

const WAIT = 300

/**
 * 防抖 / 节流 可视化对比
 * - raw：每次输入事件都立即触发（高频、浪费）
 * - debounce：停止输入 WAIT 毫秒后才触发一次（“等你说完”）
 * - throttle：每 WAIT 毫秒最多触发一次（“匀速节流”）
 */
export default function DebounceThrottleDemo() {
  const [text, setText] = useState('')
  const [raw, setRaw] = useState(0)
  const [debounced, setDebounced] = useState(0)
  const [throttled, setThrottled] = useState(0)

  // 实时帧率自测：无论怎么狂敲键盘，本面板都应稳定在 ~60 FPS
  const { fps, jank } = useFps(true)

  const debTimer = useRef<number | undefined>(undefined)
  const lastThrottle = useRef(0)

  const onChange = (v: string) => {
    setText(v)
    setRaw((r) => r + 1)

    // 防抖：重新计时，停止输入 WAIT 后才触发
    window.clearTimeout(debTimer.current)
    debTimer.current = window.setTimeout(() => {
      setDebounced((d) => d + 1)
    }, WAIT)

    // 节流：固定时间窗口内至多触发一次
    const now = Date.now()
    if (now - lastThrottle.current >= WAIT) {
      lastThrottle.current = now
      setThrottled((t) => t + 1)
    }
  }

  return (
    <section className="panel">
      <div className="panel__head">
        <h3>② 防抖 vs 节流 · Debounce / Throttle</h3>
        <span className={`badge ${fps >= 50 ? 'badge--ok' : fps >= 30 ? 'badge--warn' : 'badge--bad'}`}>
          {fps} FPS · 掉帧 {jank}
        </span>
        <span className="badge badge--info">窗口 {WAIT}ms</span>
      </div>

      <label className="field">
        <input
          className="text-input"
          aria-label="输入测试文本"
          placeholder="在这里快速连续输入，观察三种计数差异…"
          value={text}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>

      <div className="counters">
        <div className="counter">
          <span className="counter__value">{raw}</span>
          <span className="counter__label">raw · 原始事件</span>
          <span className="counter__note">每次按键都触发</span>
        </div>
        <div className="counter counter--debounce">
          <span className="counter__value">{debounced}</span>
          <span className="counter__label">debounce · 防抖</span>
          <span className="counter__note">停手 {WAIT}ms 后触发</span>
        </div>
        <div className="counter counter--throttle">
          <span className="counter__value">{throttled}</span>
          <span className="counter__label">throttle · 节流</span>
          <span className="counter__note">每 {WAIT}ms 至多一次</span>
        </div>
      </div>
      <p className="hint">
        疯狂敲键盘时 raw 猛涨，而 debounce / throttle 增长平缓——搜索框联想、按钮防重复提交、resize 监听
        等场景用它俩把高频事件“削峰填谷”。
      </p>
    </section>
  )
}
