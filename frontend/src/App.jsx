import { useState } from 'react'
import UploadZone from './components/UploadZone'
import JobDescInput from './components/JobDescInput'
import ResultsDashboard from './components/ResultsDashboard'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function App() {
  const [resumeFile, setResumeFile] = useState(null)
  const [jobDesc, setJobDesc]       = useState('')
  const [results, setResults]       = useState(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)

  const canAnalyze = resumeFile && jobDesc.trim().length >= 50 && !loading

  async function handleAnalyze() {
    setError(null)
    setLoading(true)
    const form = new FormData()
    form.append('resume', resumeFile)
    form.append('jobDescription', jobDesc)
    try {
      const res = await fetch(`${API}/analyze`, { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setResults(data)
      if (data.extractionMethod === 'ocr') {
        setError('ℹ️ Your PDF appears to be scanned. Text was extracted via OCR — accuracy may be slightly reduced.')
      }
    } catch (e) {
      setError(e.message.includes('fetch') ? '❌ Cannot reach backend. Make sure it is running on port 5000.' : e.message)
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setResults(null); setResumeFile(null); setJobDesc(''); setError(null)
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="grid-bg" />

      {/* ── Header ── */}
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">ResumeIQ</span>
        </div>
        <span className="header-badge">ATS ANALYZER</span>
      </header>

      <main className="app-main">
        {!results ? (
          /* ── Input Screen ── */
          <div>

            <div className="hero fade-up">
              <h1>Beat the <span className="accent">ATS Algorithm</span></h1>
              <p>Upload your resume PDF and paste the job description — get an instant ATS score, keyword gap analysis, and actionable suggestions.</p>
            </div>

            <div className="input-grid fade-up fade-up-1">
              <div className="card">
                <div className="card-label">
                  <span>📄</span> Resume Upload
                </div>
                <UploadZone file={resumeFile} onChange={setResumeFile} />
              </div>
              <div className="card">
                <div className="card-label">
                  <span>💼</span> Job Description
                </div>
                <JobDescInput value={jobDesc} onChange={setJobDesc} />
              </div>
            </div>

            {error && <div className="error-msg fade-up" style={error.startsWith("ℹ") ? {background:"rgba(56,189,248,0.08)",borderColor:"rgba(56,189,248,0.3)",color:"var(--primary)"} : {}}>{error}</div>}

            <button
              className={`analyze-btn fade-up fade-up-2 ${loading ? 'loading' : ''}`}
              onClick={handleAnalyze}
              disabled={!canAnalyze}
            >
              {loading ? (
                <><span className="spinner" /> Analyzing Resume…</>
              ) : (
                <><span>⚡</span> Analyze Resume</>
              )}
            </button>

            {!resumeFile && !jobDesc &&
              <p style={{ textAlign:'center', color:'var(--muted)', fontSize:'0.8rem', marginTop:'1rem' }}>
                Upload a PDF resume and add ≥ 50 characters of job description to enable analysis
              </p>}
          </div>
        ) : (
          /* ── Results Screen ── */
          <ResultsDashboard results={results} onReset={handleReset} />
        )}
      </main>
    </div>
  )
}
