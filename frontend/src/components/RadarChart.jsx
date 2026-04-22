// Pure SVG radar / spider chart — no library needed
export default function RadarChart({ data }) {
  if (!data?.resume?.length) return null

  const { resume, ideal } = data
  const N    = resume.length
  const CX   = 150, CY = 150, R = 110
  const rings = [20, 40, 60, 80, 100]

  function polar(value, index, radius) {
    const angle = (Math.PI * 2 * index) / N - Math.PI / 2
    const r     = (value / 100) * radius
    return {
      x: CX + Math.cos(angle) * r,
      y: CY + Math.sin(angle) * r,
    }
  }

  function polygon(points) {
    return points.map(p => `${p.x},${p.y}`).join(' ')
  }

  function scoreColor(v) {
    if (v >= 75) return '#4ade80'
    if (v >= 55) return '#38bdf8'
    if (v >= 35) return '#fbbf24'
    return '#fb7185'
  }

  const resumePts = resume.map((a, i) => polar(a.value, i, R))
  const idealPts  = ideal.map((a, i) => polar(a.value, i, R))

  return (
    <svg viewBox="0 0 300 300" style={{ width:'100%', maxWidth:300, display:'block', margin:'0 auto' }}>
      {/* Ring lines */}
      {rings.map(pct => {
        const pts = resume.map((_, i) => polar(pct, i, R))
        return (
          <polygon key={pct}
            points={polygon(pts)}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"
          />
        )
      })}

      {/* Spoke lines */}
      {resume.map((_, i) => {
        const tip = polar(100, i, R)
        return (
          <line key={i}
            x1={CX} y1={CY} x2={tip.x} y2={tip.y}
            stroke="rgba(255,255,255,0.08)" strokeWidth="1"
          />
        )
      })}

      {/* Ideal zone (JD requirement) */}
      <polygon
        points={polygon(idealPts)}
        fill="rgba(56,189,248,0.06)"
        stroke="rgba(56,189,248,0.25)"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />

      {/* Resume zone */}
      <polygon
        points={polygon(resumePts)}
        fill="rgba(129,140,248,0.18)"
        stroke="rgba(129,140,248,0.7)"
        strokeWidth="2"
      />

      {/* Data points */}
      {resumePts.map((p, i) => (
        <circle key={i}
          cx={p.x} cy={p.y} r="4"
          fill={scoreColor(resume[i].value)}
          stroke="rgba(7,9,15,0.8)" strokeWidth="1.5"
        />
      ))}

      {/* Labels */}
      {resume.map((axis, i) => {
        const angle    = (Math.PI * 2 * i) / N - Math.PI / 2
        const labelR   = R + 22
        const lx       = CX + Math.cos(angle) * labelR
        const ly       = CY + Math.sin(angle) * labelR
        const anchor   = lx < CX - 5 ? 'end' : lx > CX + 5 ? 'start' : 'middle'
        const color    = scoreColor(axis.value)
        return (
          <g key={i}>
            <text x={lx} y={ly - 5}
              textAnchor={anchor}
              fontSize="8.5" fill="rgba(255,255,255,0.55)"
              fontFamily="DM Sans, sans-serif"
            >{axis.label}</text>
            <text x={lx} y={ly + 7}
              textAnchor={anchor}
              fontSize="9" fill={color}
              fontFamily="Syne, sans-serif" fontWeight="700"
            >{axis.value}%</text>
          </g>
        )
      })}

      {/* Centre dot */}
      <circle cx={CX} cy={CY} r="3" fill="rgba(255,255,255,0.15)" />

      {/* Legend */}
      <g>
        <line x1="20" y1="278" x2="36" y2="278" stroke="rgba(129,140,248,0.7)" strokeWidth="2"/>
        <text x="40" y="282" fontSize="8" fill="rgba(255,255,255,0.45)" fontFamily="DM Sans,sans-serif">Your Resume</text>
        <line x1="115" y1="278" x2="131" y2="278" stroke="rgba(56,189,248,0.5)" strokeWidth="1.5" strokeDasharray="4 3"/>
        <text x="135" y="282" fontSize="8" fill="rgba(255,255,255,0.45)" fontFamily="DM Sans,sans-serif">JD Target</text>
      </g>
    </svg>
  )
}
