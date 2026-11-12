// Fixed, pointer-free ambient layer: gradient orbs, a perspective grid and drifting particles.
// Pure CSS transforms/opacity only, so it stays on the compositor and doesn't cost game frames.

const PARTICLES = Array.from({ length: 26 }, (_, i) => {
  const r = (n) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1
  return {
    left: `${(r(1) * 100).toFixed(2)}%`,
    top: `${(r(2) * 100).toFixed(2)}%`,
    size: 1.5 + r(3) * 2.5,
    duration: 14 + r(4) * 18,
    delay: -r(5) * 30,
    color: ['#2ee6ff', '#b26bff', '#ff4fb8'][i % 3],
  }
})

export default function AmbientBackground() {
  return (
    <div className="ambient" aria-hidden="true">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="ambient-grid" />
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="particle"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
