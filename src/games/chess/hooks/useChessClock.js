import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Two-sided chess clock. Time is computed from performance.now() deltas (not tick counting),
 * so it stays accurate even if the tab is throttled.
 *
 * @param {number|null} initialMs  per-player time; null = untimed (clock is inert)
 * @param {(color) => void} onFlag called once when a side runs out of time
 */
export function useChessClock(initialMs, onFlag) {
  const enabled = initialMs != null
  const s = useRef({ base: { w: initialMs ?? 0, b: initialMs ?? 0 }, running: null, since: 0 })
  const onFlagRef = useRef(onFlag)
  onFlagRef.current = onFlag
  const [display, setDisplay] = useState({ w: initialMs ?? 0, b: initialMs ?? 0, running: null })

  const remaining = (color) => {
    const st = s.current
    return st.running === color ? Math.max(0, st.base[color] - (performance.now() - st.since)) : st.base[color]
  }
  const publish = () => setDisplay({ w: remaining('w'), b: remaining('b'), running: s.current.running })

  /** Stop the running side (banking its time) and start `color` (or nobody). */
  const runFor = useCallback((color) => {
    if (!enabled) return
    const st = s.current
    if (st.running) st.base[st.running] = remaining(st.running)
    st.running = color ?? null
    st.since = performance.now()
    publish()
  }, [enabled]) // eslint-disable-line react-hooks/exhaustive-deps -- remaining/publish only touch refs + setState

  const pause = useCallback(() => runFor(null), [runFor])

  useEffect(() => {
    if (!enabled || !display.running) return
    const id = setInterval(() => {
      const side = s.current.running
      if (!side) return
      if (remaining(side) <= 0) {
        s.current.base[side] = 0
        s.current.running = null
        publish()
        onFlagRef.current?.(side)
      } else publish()
    }, 100)
    return () => clearInterval(id)
  }, [enabled, display.running]) // eslint-disable-line react-hooks/exhaustive-deps

  return { enabled, times: { w: display.w, b: display.b }, running: display.running, runFor, pause }
}

export function formatClock(ms) {
  const total = Math.max(0, ms)
  if (total < 10_000) {
    // Under ten seconds: tenths, e.g. 0:07.3 (floor so it never shows time you don't have)
    const t = Math.floor(total / 100) / 10
    return `0:${t.toFixed(1).padStart(4, '0')}`
  }
  const secs = Math.ceil(total / 1000)
  return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`
}
