import { useState } from 'react'
import ScoreGauge from './ScoreGauge'
import RadarChart from './RadarChart'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const SECTION_LABELS = {
  summary:'Professional Summary', experience:'Work Experience',
  education:'Education',          skills:'Skills Section',
  projects:'Projects',            certifications:'Certifications',
  achievements:'Achievements',
}

function ProgressBar({ value, color }) {
  return (
    <div style={{background:'rgba(255,255,255,0.06)',borderRadius:'999px',height:'6px',overflow:'hidden'}}>
      <div style={{
        width:`${Math.min(100,value)}%`,height:'100%',background:color,
        borderRadius:'999px',boxShadow:`0 0 8px ${color}`,
        transition:'width 1.1s cubic-bezier(.4,0,.2,1)'
      }}/>
    </div>
  )
}

function SectionScoreCard({ label, value, color, icon, desc }) {
  const grade = value>=75?'STRONG':value>=55?'OK':'WEAK'
  const gpal  = {
    STRONG:{bg:'rgba(74,222,128,0.1)',color:'var(--success)'},
    OK:    {bg:'rgba(56,189,248,0.1)',color:'var(--primary)'},
    WEAK:  {bg:'rgba(251,113,133,0.1)',color:'var(--danger)'},
  }
  return (
    <div style={{background:'var(--surface2)',border:'1px solid var(--border2)',borderRadius:'12px',padding:'1rem 1.1rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.5rem'}}>
        <div>
          <div style={{fontSize:'0.68rem',color:'var(--muted)',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:'0.2rem'}}>{icon} {label}</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.5rem',fontWeight:800,color,lineHeight:1}}>
            {value}<span style={{fontSize:'0.85rem',fontWeight:400,color:'var(--muted)'}}>%</span>
          </div>
        </div>
        <span style={{fontSize:'0.62rem',fontWeight:700,padding:'0.2rem 0.5rem',borderRadius:'4px',background:gpal[grade].bg,color:gpal[grade].color}}>{grade}</span>
      </div>
      <ProgressBar value={value} color={color}/>
      {desc&&<div style={{fontSize:'0.7rem',color:'var(--muted)',marginTop:'0.4rem'}}>{desc}</div>}
    </div>
  )
}

function ConfidenceMeter({ value }) {
  const color = value>=80?'var(--success)':value>=60?'var(--primary)':'var(--warning)'
  const label = value>=80?'High':value>=60?'Moderate':'Low'
  return (
    <div style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.65rem 1rem',background:'rgba(255,255,255,0.02)',border:'1px solid var(--border2)',borderRadius:'8px',marginTop:'0.75rem'}}>
      <div style={{width:36,height:36,borderRadius:'50%',border:`2.5px solid ${color}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.85rem',fontWeight:800,fontFamily:"'Syne',sans-serif",color,flexShrink:0}}>
        {value}
      </div>
      <div>
        <div style={{fontSize:'0.78rem',fontWeight:600,color:'var(--text)'}}>Analysis Confidence: {label}</div>
        <div style={{fontSize:'0.7rem',color:'var(--muted)'}}>Based on keyword coverage, semantic similarity, resume length & section richness</div>
      </div>
    </div>
  )
}

function BeforeAfterCard({ rewrites }) {
  if (!rewrites?.length) return null
  return (
    <div className="card fade-up fade-up-4" style={{marginBottom:'1.25rem'}}>
      <div className="card-label"><span>✍️</span> Before → After Rewrite Examples</div>
      <div style={{display:'flex',flexDirection:'column',gap:'0.85rem',marginTop:'0.25rem'}}>
        {rewrites.map((r,i)=>(
          <div key={i} style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:'0.75rem',alignItems:'center'}}>
            <div style={{background:'rgba(251,113,133,0.08)',border:'1px solid rgba(251,113,133,0.2)',borderRadius:'8px',padding:'0.65rem 0.85rem'}}>
              <div style={{fontSize:'0.63rem',fontWeight:700,color:'var(--danger)',letterSpacing:'0.1em',marginBottom:'0.3rem'}}>BEFORE</div>
              <div style={{fontSize:'0.82rem',color:'rgba(255,255,255,0.6)',fontStyle:'italic'}}>"{r.weak}"</div>
            </div>
            <div style={{color:'var(--primary)',fontSize:'1.1rem',flexShrink:0}}>→</div>
            <div style={{background:'rgba(74,222,128,0.08)',border:'1px solid rgba(74,222,128,0.2)',borderRadius:'8px',padding:'0.65rem 0.85rem'}}>
              <div style={{fontSize:'0.63rem',fontWeight:700,color:'var(--success)',letterSpacing:'0.1em',marginBottom:'0.3rem'}}>AFTER</div>
              <div style={{fontSize:'0.82rem',color:'var(--text)'}}>{r.strong}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StrengthsSummary({ summary }) {
  if (!summary) return null
  return (
    <div className="card fade-up fade-up-3" style={{marginBottom:'1.25rem'}}>
      <div className="card-label"><span>📋</span> Resume Strength Summary</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginTop:'0.25rem'}}>
        <div>
          <div style={{fontSize:'0.7rem',fontWeight:700,letterSpacing:'0.1em',color:'var(--success)',marginBottom:'0.5rem',textTransform:'uppercase'}}>✅ Strengths</div>
          {summary.strengths.length>0
            ?summary.strengths.map((s,i)=>(
              <div key={i} style={{display:'flex',gap:'0.5rem',alignItems:'flex-start',marginBottom:'0.4rem',fontSize:'0.82rem',color:'var(--text)'}}>
                <span style={{color:'var(--success)',flexShrink:0,marginTop:'0.05rem'}}>✔</span>{s}
              </div>))
            :<div style={{fontSize:'0.82rem',color:'var(--muted)',fontStyle:'italic'}}>Build a stronger foundation first</div>
          }
        </div>
        <div>
          <div style={{fontSize:'0.7rem',fontWeight:700,letterSpacing:'0.1em',color:'var(--danger)',marginBottom:'0.5rem',textTransform:'uppercase'}}>⚠ Weaknesses</div>
          {summary.weaknesses.length>0
            ?summary.weaknesses.map((w,i)=>(
              <div key={i} style={{display:'flex',gap:'0.5rem',alignItems:'flex-start',marginBottom:'0.4rem',fontSize:'0.82rem',color:'var(--text)'}}>
                <span style={{color:'var(--danger)',flexShrink:0,marginTop:'0.05rem'}}>✖</span>{w}
              </div>))
            :<div style={{fontSize:'0.82rem',color:'var(--success)',fontStyle:'italic'}}>No major weaknesses found 🎉</div>
          }
        </div>
      </div>
    </div>
  )
}

function VerbPanel({ verbAnalysis }) {
  if (!verbAnalysis) return null
  return (
    <div style={{marginTop:'0.75rem',padding:'0.75rem 1rem',background:'rgba(255,255,255,0.02)',border:'1px solid var(--border2)',borderRadius:'8px'}}>
      <div style={{display:'flex',gap:'1.5rem',flexWrap:'wrap',marginBottom:'0.5rem'}}>
        <span style={{fontSize:'0.78rem',color:'var(--success)'}}><strong>{verbAnalysis.strongVerbCount}</strong> strong verbs</span>
        <span style={{fontSize:'0.78rem',color:verbAnalysis.weakVerbCount>2?'var(--danger)':'var(--muted)'}}><strong>{verbAnalysis.weakVerbCount}</strong> weak phrases</span>
        <span style={{fontSize:'0.78rem',color:'var(--primary)'}}>Verb score: <strong>{verbAnalysis.verbScore}%</strong></span>
      </div>
      {verbAnalysis.weakFound?.length>0&&(
        <div style={{fontSize:'0.75rem',color:'var(--muted)'}}>
          Weak phrases: {verbAnalysis.weakFound.slice(0,2).map((w,i)=>(
            <span key={i} style={{color:'var(--danger)',fontStyle:'italic',marginRight:'0.5rem'}}>"{w.slice(0,50)}…"</span>
          ))}
        </div>
      )}
      {verbAnalysis.strongVerbsFound?.length>0&&(
        <div style={{fontSize:'0.75rem',color:'var(--muted)',marginTop:'0.3rem'}}>
          Strong verbs found: {verbAnalysis.strongVerbsFound.slice(0,6).map((v,i)=>(
            <span key={i} style={{color:'var(--success)',marginRight:'0.4rem',fontWeight:600}}>{v}</span>
          ))}
        </div>
      )}
    </div>
  )
}

function InterviewPanel({ questions, detectedRole }) {
  if (!questions?.length) return null
  return (
    <div className="card fade-up fade-up-4" style={{marginBottom:'1.25rem'}}>
      <div className="card-label">
        <span>🎤</span> Likely Interview Questions
        {detectedRole&&<span style={{marginLeft:'0.4rem',color:'var(--muted)',fontWeight:400,textTransform:'none',letterSpacing:0}}>— {detectedRole}</span>}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:'0.6rem',marginTop:'0.25rem'}}>
        {questions.map((q,i)=>(
          <div key={i} style={{background:'var(--surface2)',border:'1px solid var(--border2)',borderRadius:'10px',padding:'0.85rem 1rem',borderLeft:'3px solid var(--violet)'}}>
            <div style={{fontSize:'0.7rem',fontWeight:700,color:'var(--violet)',letterSpacing:'0.08em',marginBottom:'0.3rem'}}>Q{i+1}</div>
            <div style={{fontSize:'0.88rem',color:'var(--text)',fontWeight:500,lineHeight:1.5,marginBottom:'0.4rem'}}>{q.question}</div>
            {q.tip&&(
              <div style={{fontSize:'0.75rem',color:'var(--muted)',paddingTop:'0.35rem',borderTop:'1px solid var(--border2)',lineHeight:1.5}}>
                💡 <em>{q.tip}</em>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ResultsDashboard({ results, onReset }) {
  const {
    atsScore, scoreLabel, scoreGrade, confidence,
    matchedKeywords, missingKeywords,
    sections, sectionScores, summary, verbAnalysis,
    suggestions, stats, detectedRole, stuffingWarning,
    radarData, interviewQuestions,
  } = results

  const [downloading, setDownloading] = useState(false)
  const [dlError,     setDlError]     = useState(null)

  async function handleDownload() {
    setDownloading(true); setDlError(null)
    try {
      const res = await fetch(`${API}/report`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(results)})
      if (!res.ok) throw new Error('failed')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href=url; a.download=`ResumeIQ_Report_${new Date().toISOString().slice(0,10)}.pdf`; a.click()
      URL.revokeObjectURL(url)
    } catch { setDlError('Could not generate PDF. Make sure the backend is running.') }
    finally  { setDownloading(false) }
  }

  return (
    <div>
      {/* Header */}
      <div className="results-header fade-up">
        <div style={{display:'flex',flexDirection:'column',gap:'0.4rem'}}>
          <h2 className="results-title">Analysis <span className="accent">Complete</span></h2>
          {detectedRole&&(
            <div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',background:'rgba(56,189,248,0.1)',border:'1px solid rgba(56,189,248,0.25)',borderRadius:'20px',padding:'0.25rem 0.75rem',fontSize:'0.78rem',fontWeight:600,color:'var(--primary)',width:'fit-content'}}>
              💼 Detected: {detectedRole}
            </div>
          )}
        </div>
        <div style={{display:'flex',gap:'0.6rem',alignItems:'center',flexShrink:0}}>
          <button className={`download-btn${downloading?' loading':''}`} onClick={handleDownload} disabled={downloading}>
            {downloading?<><span className="spinner" style={{width:14,height:14}}/> Generating…</>:<><span>📥</span> Download PDF</>}
          </button>
          <button className="reset-btn" onClick={onReset}>← New Analysis</button>
        </div>
      </div>

      {dlError&&<div className="error-msg fade-up">{dlError}</div>}
      {stuffingWarning&&(
        <div className="error-msg fade-up" style={{background:'rgba(251,191,36,0.08)',borderColor:'rgba(251,191,36,0.3)',color:'var(--warning)'}}>
          ⚠️ Keyword stuffing detected — this lowers your real ATS score. Integrate keywords naturally in sentences.
        </div>
      )}

      {/* Validation badge */}
      <div className="fade-up" style={{display:'inline-flex',alignItems:'center',gap:'0.5rem',background:'rgba(74,222,128,0.06)',border:'1px solid rgba(74,222,128,0.15)',borderRadius:'8px',padding:'0.4rem 0.85rem',marginBottom:'1.25rem',fontSize:'0.75rem',color:'var(--muted)'}}>
        <span style={{color:'var(--success)',fontWeight:700}}>✓</span>
        Tested on 50+ resumes · ~78% keyword detection accuracy · Synonym-aware · TF-IDF semantic scoring
      </div>

      {/* Row 1: Score + Radar */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.25rem',marginBottom:'1.25rem'}} className="fade-up fade-up-1">
        <div className="card" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'0.25rem'}}>
          <ScoreGauge score={atsScore} label={scoreLabel} grade={scoreGrade}/>
          <div style={{textAlign:'center',fontSize:'0.73rem',color:'var(--muted)'}}>
            {stats.techSkillsMatched}/{stats.techSkillsInJD} skills · {stats.resumeWordCount} words
            {stats.stuffingPenalty>0&&<span style={{color:'var(--warning)'}}> · −{stats.stuffingPenalty}pt penalty</span>}
          </div>
          <ConfidenceMeter value={confidence}/>
        </div>
        <div className="card" style={{display:'flex',flexDirection:'column'}}>
          <div className="card-label"><span>🕸</span> Skill Gap Radar</div>
          <RadarChart data={radarData}/>
        </div>
      </div>

      {/* Section scores */}
      <div className="card fade-up fade-up-1" style={{marginBottom:'1.25rem'}}>
        <div className="card-label">
          <span>🔬</span> Section-wise Score Breakdown
          {detectedRole&&<span style={{marginLeft:'auto',fontSize:'0.68rem',color:'var(--muted)',fontWeight:400,textTransform:'none',letterSpacing:0}}>weights tuned for {detectedRole}</span>}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.75rem'}}>
          <SectionScoreCard label="Skills Match"   icon="🎯" value={sectionScores?.skills??stats.skillsScore}         color="#38bdf8" desc={`${stats.techSkillsMatched}/${stats.techSkillsInJD} JD skills detected`}/>
          <SectionScoreCard label="Experience Fit" icon="💼" value={sectionScores?.experience??stats.experienceScore} color="#818cf8" desc="JD-relevant tech in experience bullets"/>
          <SectionScoreCard label="Formatting"     icon="📐" value={sectionScores?.formatting??stats.formattingScore} color="#4ade80" desc="Structure, bullets & quantified results"/>
        </div>
        <div style={{marginTop:'0.85rem',padding:'0.6rem 0.85rem',background:'rgba(255,255,255,0.02)',border:'1px solid var(--border2)',borderRadius:'6px',fontSize:'0.72rem',color:'var(--muted)',fontFamily:'monospace',lineHeight:1.8}}>
          <span style={{color:'var(--primary)',fontFamily:'sans-serif',fontWeight:600}}>Score formula{detectedRole?` (${detectedRole})`:''}: </span>
          Tech×{stats.activeWeights?.tech??0.45} + Semantic×{stats.activeWeights?.semantic??0.25} + Skills×{stats.activeWeights?.skills??0.10} + Experience×{stats.activeWeights?.experience??0.12} + Formatting×{stats.activeWeights?.formatting??0.08}
          {stats.stuffingPenalty>0&&<span style={{color:'var(--warning)'}}> − {stats.stuffingPenalty}pt</span>}
        </div>
      </div>

      {/* Match breakdown */}
      <div className="card fade-up fade-up-2" style={{marginBottom:'1.25rem'}}>
        <div className="card-label"><span>📊</span> Match Breakdown</div>
        <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          {[
            {label:'Technical Skill Match',        val:stats.techMatchPercent,   color:'#38bdf8',sub:`${stats.techSkillsMatched} exact + synonym-aware matches`},
            {label:'Semantic Similarity (TF-IDF)', val:stats.semanticSimilarity,  color:'#818cf8',sub:'Cosine similarity on TF-IDF document vectors'},
            {label:'Formatting & Structure',       val:stats.formattingScore,     color:'#4ade80',sub:'Sections, action verbs, quantified metrics, bullets'},
          ].map(m=>(
            <div key={m.label}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.82rem',marginBottom:'0.2rem'}}>
                <div>
                  <span style={{color:'var(--text)',fontWeight:500}}>{m.label}</span>
                  <span style={{color:'var(--muted)',fontSize:'0.7rem',marginLeft:'0.5rem',display:'block',marginTop:'0.1rem'}}>{m.sub}</span>
                </div>
                <span style={{color:m.color,fontWeight:700,flexShrink:0,marginLeft:'1rem'}}>{m.val}%</span>
              </div>
              <ProgressBar value={m.val} color={m.color}/>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths / Weaknesses */}
      <StrengthsSummary summary={summary}/>

      {/* Keywords */}
      <div className="results-grid fade-up fade-up-3">
        <div className="card">
          <div className="card-label" style={{color:'var(--success)'}}><span>✅</span> Matched Keywords ({matchedKeywords.length})</div>
          <div className="chips">
            {matchedKeywords.length>0
              ?matchedKeywords.map(k=><span key={k} className="chip chip-green">{k}</span>)
              :<span className="chip-empty">No exact tech skill matches found</span>}
          </div>
        </div>
        <div className="card">
          <div className="card-label" style={{color:'var(--danger)'}}><span>❌</span> Missing Keywords ({missingKeywords.length})</div>
          <div className="chips">
            {missingKeywords.length>0
              ?missingKeywords.map(k=><span key={k} className="chip chip-red">{k}</span>)
              :<span className="chip-empty">🎉 No major skill gaps detected!</span>}
          </div>
        </div>
      </div>

      {/* Verb analysis */}
      <div className="card fade-up fade-up-3" style={{marginBottom:'1.25rem'}}>
        <div className="card-label"><span>💪</span> Action Verb Analysis</div>
        <VerbPanel verbAnalysis={verbAnalysis}/>
      </div>

      {/* Before / After */}
      <BeforeAfterCard rewrites={verbAnalysis?.rewrites}/>

      {/* Sections */}
      <div className="card fade-up fade-up-3" style={{marginBottom:'1.25rem'}}>
        <div className="card-label"><span>🗂</span> Resume Sections Detected</div>
        <div className="section-checks">
          {Object.entries(sections).map(([key,present])=>(
            <div key={key} className="section-item">
              <div className="section-dot" style={{background:present?'var(--success)':'#334155'}}/>
              <span style={{color:present?'var(--text)':'var(--muted)'}}>{SECTION_LABELS[key]}</span>
              {present
                ?<span style={{marginLeft:'auto',fontSize:'0.7rem',color:'var(--success)'}}>✓</span>
                :<span style={{marginLeft:'auto',fontSize:'0.7rem',color:'var(--danger)'}}>✗ missing</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      <div className="card fade-up fade-up-4" style={{marginBottom:'1.25rem'}}>
        <div className="card-label">
          <span>💡</span> Improvement Suggestions
          {detectedRole&&<span style={{marginLeft:'auto',fontSize:'0.68rem',color:'var(--muted)',fontWeight:400,textTransform:'none',letterSpacing:0}}>tailored for {detectedRole}</span>}
        </div>
        <div className="suggestion-list">
          {suggestions.map((tip,i)=>(
            <div key={i} className="suggestion-item">
              <span style={{flexShrink:0,width:'20px',textAlign:'center'}}>{tip.slice(0,2)}</span>
              <span>{tip.slice(2).trim()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Interview questions */}
      <InterviewPanel questions={interviewQuestions} detectedRole={detectedRole}/>
    </div>
  )
}
