import { useRef, useState } from 'react'

export default function UploadZone({ file, onChange }) {
  const inputRef  = useRef(null)
  const [drag, setDrag] = useState(false)

  function handleFiles(files) {
    const f = files[0]
    if (f && f.type === 'application/pdf') onChange(f)
    else alert('Please upload a PDF file.')
  }

  return (
    <div
      className={`upload-zone ${drag ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
      onClick={() => inputRef.current.click()}
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files) }}
    >
      <input
        ref={inputRef}
        type="file" accept=".pdf" hidden
        onChange={e => handleFiles(e.target.files)}
      />
      {file ? (
        <>
          <div className="upload-icon">✅</div>
          <span className="label">Resume uploaded</span>
          <span className="file-name">📎 {file.name}</span>
          <span className="sub">Click to replace</span>
        </>
      ) : (
        <>
          <div className="upload-icon" style={{ filter:'drop-shadow(0 0 8px rgba(56,189,248,0.5))' }}>📁</div>
          <span className="label">Drop your resume here</span>
          <span className="sub">or click to browse · PDF only · max 5 MB</span>
        </>
      )}
    </div>
  )
}
