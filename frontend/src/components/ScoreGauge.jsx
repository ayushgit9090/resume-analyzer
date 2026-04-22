import { useEffect, useState } from 'react'

const R = 72
const CIRC = 2 * Math.PI * R

function scoreColor(score) {
  if (score >= 80) return 'var(--success)'
  if (score >= 65) return '#38bdf8'
  if (score >= 45) return 'var(--warning)'
  return 'var(--danger)'
}

export default function ScoreGauge({ score, label, grade }) {
  const [animated, setAnimated] = useState(0)

  useEffect(() => {
    let start = null
    const duration = 1200
    function step(ts) {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setAnimated(Math.round(ease * score))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [score])

  const offset = CIRC - (animated / 100) * CIRC
  const color  = scoreColor(score)
  const size   = 180

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.5rem' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <circle
          cx={size/2} cy={size/2} r={R}
          fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10"
        />
        {/* Glow filter */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {/* Progress arc */}
        <circle
          cx={size/2} cy={size/2} r={R}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: 'stroke 0.3s', filter:`drop-shadow(0 0 6px ${color})` }}
        />
        {/* Score text */}
        <text x={size/2} y={size/2 - 8} textAnchor="middle"
          fill={color}
          fontSize="36" fontFamily="Syne,sans-serif" fontWeight="800"
        >{animated}</text>
        <text x={size/2} y={size/2 + 14} textAnchor="middle"
          fill="rgba(255,255,255,0.35)"
          fontSize="11" fontFamily="DM Sans,sans-serif" letterSpacing="2"
        >ATS SCORE</text>
        {/* Grade badge */}
        <text x={size/2} y={size/2 + 34} textAnchor="middle"
          fill={color}
          fontSize="13" fontFamily="Syne,sans-serif" fontWeight="700"
        >Grade {grade}</text>
      </svg>
      <div style={{
        fontSize:'0.78rem', fontWeight:600, letterSpacing:'0.08em',
        color, textTransform:'uppercase', textAlign:'center'
      }}>{label}</div>
    </div>
  )
}
