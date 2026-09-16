import { useEffect, useRef, useState } from 'react'

export interface FpsState {
  fps: number
  /** 统计窗口内超过 32ms 的“掉帧”帧数（< 30fps 视为卡顿） */
  jank: number
}

/**
 * 基于 requestAnimationFrame 的实时帧率测量。
 * - 每秒统计一次平均 FPS
 * - 同时累计“掉帧帧数”（单帧耗时 > 32ms 的帧），用于量化卡顿
 *
 * @param active 是否启用测量（切换 demo 模式时关闭可重置数据）
 */
export function useFps(active: boolean): FpsState {
  const [state, setState] = useState<FpsState>({ fps: 0, jank: 0 })

  const rafRef = useRef<number>(0)
  const frames = useRef(0)
  const jankFrames = useRef(0)
  const lastSecond = useRef(performance.now())
  const prevFrame = useRef(performance.now())

  useEffect(() => {
    if (!active) {
      setState({ fps: 0, jank: 0 })
      frames.current = 0
      jankFrames.current = 0
      return
    }

    prevFrame.current = performance.now()
    lastSecond.current = performance.now()

    const loop = (now: number) => {
      const dt = now - prevFrame.current
      prevFrame.current = now
      if (dt > 32) jankFrames.current++

      frames.current++
      const elapsed = now - lastSecond.current
      if (elapsed >= 1000) {
        setState({
          fps: Math.round((frames.current * 1000) / elapsed),
          jank: jankFrames.current
        })
        frames.current = 0
        jankFrames.current = 0
        lastSecond.current = now
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active])

  return state
}
