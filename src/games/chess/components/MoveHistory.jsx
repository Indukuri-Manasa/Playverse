import { useEffect, useRef } from 'react'

export default function MoveHistory({ history }) {
  const listRef = useRef(null)
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [history.length])

  const rows = []
  for (let i = 0; i < history.length; i += 2) rows.push({ n: i / 2 + 1, w: history[i], b: history[i + 1], wi: i, bi: i + 1 })
  const last = history.length - 1

  return (
    <div className="move-history">
      <div className="move-history-head">
        <span>#</span><span>White</span><span>Black</span>
      </div>
      <ol ref={listRef} className="move-list">
        {rows.length === 0 && <li className="move-empty">No moves yet</li>}
        {rows.map((r) => (
          <li key={r.n} className="move-row">
            <span className="move-num">{r.n}.</span>
            <span className={`move ${r.wi === last ? 'current' : ''}`}>{r.w.san}</span>
            <span className={`move ${r.bi === last ? 'current' : ''}`}>{r.b?.san ?? ''}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
