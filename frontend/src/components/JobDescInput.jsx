export default function JobDescInput({ value, onChange }) {
  const count = value.length
  const ready = count >= 50

  return (
    <>
      <textarea
        className="jd-textarea"
        placeholder="Paste the full job description here…&#10;&#10;Include requirements, responsibilities, and skills. The more complete, the more accurate the analysis."
        value={value}
        onChange={e => onChange(e.target.value)}
        spellCheck={false}
      />
      <div className="char-count" style={{ color: ready ? 'var(--success)' : 'var(--muted)' }}>
        {count < 50 ? `${50 - count} more characters needed` : `${count} characters ✓`}
      </div>
    </>
  )
}
