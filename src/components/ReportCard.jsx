import { useEffect, useRef, useState } from 'react'
import { FEEDBACK, TIPS } from '../data/questions'

export default function ReportCard({ results, config, onRetry, onRetrySameRole }) {
  const { questions, answers, scores } = results
  const total = scores.reduce((a, b) => a + b, 0)
  const max = questions.length * 9
  const percent = Math.round((total / max) * 100)
  const tips = TIPS[config.role] || []
  const canvasRef = useRef(null)
  const [bestScore, setBestScore] = useState(null)
  const [previousScores, setPreviousScores] = useState([])

  const grade =
    percent >= 80 ? { label: 'Excellent', color: '#22c55e' } :
    percent >= 60 ? { label: 'Good', color: '#7c6aff' } :
    percent >= 40 ? { label: 'Average', color: '#f59e0b' } :
    { label: 'Needs Work', color: '#ef4444' }

  useEffect(() => {
    const key = `interview_history_${config.role}_${config.level}`
    const history = JSON.parse(localStorage.getItem(key) || '[]')
    const newEntry = { date: new Date().toISOString(), score: percent, total, max, timestamp: Date.now() }
    const updatedHistory = [newEntry, ...history].slice(0, 10)
    localStorage.setItem(key, JSON.stringify(updatedHistory))
    const best = Math.max(...updatedHistory.map(h => h.score), 0)
    setBestScore(best)
    setPreviousScores(updatedHistory.slice(0, 5))
  }, [percent, total, max, config.role, config.level])

  useEffect(() => {
    if (percent < 80) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const pieces = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      w: Math.random() * 10 + 5,
      h: Math.random() * 6 + 4,
      color: ['#7c6aff', '#22c55e', '#f59e0b', '#a855f7', '#ef4444', '#60a5fa'][Math.floor(Math.random() * 6)],
      speed: Math.random() * 3 + 2,
      angle: Math.random() * 360,
      spin: Math.random() * 4 - 2,
    }))
    let frame
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      pieces.forEach(p => {
        ctx.save()
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2)
        ctx.rotate((p.angle * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
        p.y += p.speed
        p.angle += p.spin
        if (p.y > canvas.height) { p.y = -20; p.x = Math.random() * canvas.width }
      })
      frame = requestAnimationFrame(draw)
    }
    draw()
    const timer = setTimeout(() => { cancelAnimationFrame(frame); ctx.clearRect(0, 0, canvas.width, canvas.height) }, 4000)
    return () => { cancelAnimationFrame(frame); clearTimeout(timer) }
  }, [percent])

  function getFeedback(score) {
    const pool = score >= 8 ? FEEDBACK.strong : score >= 6 ? FEEDBACK.average : FEEDBACK.weak
    return pool[Math.floor(Math.random() * pool.length)]
  }

  const attempted = answers.filter(a => a !== '[Skipped]').length

  return (
    <div style={styles.container}>
      <canvas ref={canvasRef} style={styles.canvas} />

      {/* ── Header ── */}
      <div style={styles.header}>
        <div>
          <div style={styles.headerBadge}>
            <span style={styles.dot} />
            Interview Complete
          </div>
          <h2 style={styles.heading}>Performance Dashboard</h2>
          <p style={styles.sub}>{config.role} · {config.level} Level</p>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.shareBtn} onClick={() => {
            const text = `I just completed an AI Interview!\n\nRole: ${config.role}\nLevel: ${config.level}\nScore: ${percent}% (${grade.label})\n\nTry it yourself: https://interview-bot-ivory-six.vercel.app`
            if (navigator.share) navigator.share({ title: 'Interview Bot Result', text })
            else navigator.clipboard.writeText(text).then(() => alert('Copied!'))
          }}>Share </button>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div style={styles.statsRow}>
        <div style={{ ...styles.statCard, borderColor: `${grade.color}44` }}>
          <div style={{ ...styles.statNum, color: grade.color }}>{percent}%</div>
          <div style={styles.statLabel}>Overall Score</div>
          <div style={{ ...styles.gradePill, background: `${grade.color}22`, color: grade.color }}>{grade.label}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNum}>{attempted}<span style={styles.statDen}>/{questions.length}</span></div>
          <div style={styles.statLabel}>Answered</div>
          <div style={styles.statSub}>{questions.length - attempted} skipped</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statNum, color: '#f59e0b' }}>{bestScore ?? percent}%</div>
          <div style={styles.statLabel}>Best Score</div>
          <div style={styles.statSub}> All time</div>
        </div>
        {previousScores.length > 1 && (
          <div style={styles.statCard}>
            <div style={styles.statNum}>{previousScores.length}</div>
            <div style={styles.statLabel}>Attempts</div>
            <div style={styles.statSub}>This role</div>
          </div>
        )}
      </div>

      {/* ── Main Grid ── */}
      <div style={styles.grid}>

        {/* Left — Question Breakdown */}
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <div style={styles.panelTitle}>Question Breakdown</div>
            <div style={styles.panelSub}>{total}/{max} pts</div>
          </div>
          {questions.map((q, i) => {
            const pct = Math.round((scores[i] / 9) * 100)
            const col = scores[i] >= 7 ? '#22c55e' : scores[i] >= 5 ? '#7c6aff' : scores[i] > 0 ? '#f59e0b' : '#ef4444'
            return (
              <div key={i} style={styles.qBlock}>
                <div style={styles.qTop}>
                  <div style={styles.qMeta}>
                    <span style={styles.qNum}>Q{i + 1}</span>
                    <span style={styles.qText}>{q}</span>
                  </div>
                  <div style={{ ...styles.qScore, color: col }}>{scores[i]}/9</div>
                </div>
                {/* Progress bar */}
                <div style={styles.progressBg}>
                  <div style={{ ...styles.progressFill, width: `${pct}%`, background: col }} />
                </div>
                {answers[i] !== '[Skipped]' ? (
                  <div style={styles.answerBox}>{answers[i]}</div>
                ) : (
                  <div style={styles.skipped}>⚠ Skipped</div>
                )}
              </div>
            )
          })}
        </div>

        {/* Right — Sidebar */}
        <div style={styles.sidebar}>

          {/* Score History */}
          {previousScores.length > 1 && (
            <div style={styles.sidePanel}>
              <div style={styles.panelTitle}>Score History</div>
              {previousScores.slice(1).map((entry, idx) => (
                <div key={idx} style={styles.historyItem}>
                  <span style={styles.historyDate}>{new Date(entry.date).toLocaleDateString()}</span>
                  <div style={styles.historyBarBg}>
                    <div style={{
                      ...styles.historyBarFill,
                      width: `${entry.score}%`,
                      background: entry.score >= 80 ? '#22c55e' : entry.score >= 60 ? '#7c6aff' : '#f59e0b'
                    }} />
                  </div>
                  <span style={{
                    ...styles.historyScore,
                    color: entry.score >= 80 ? '#22c55e' : entry.score >= 60 ? '#7c6aff' : '#f59e0b'
                  }}>{entry.score}%</span>
                </div>
              ))}
            </div>
          )}

          {/* Tips */}
          {tips.length > 0 && (
            <div style={styles.sidePanel}>
              <div style={styles.panelTitle}>Improvement Tips</div>
              {tips.map((tip, i) => (
                <div key={i} style={styles.tip}>
                  <span style={styles.tipIcon}>→</span>
                  {tip}
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div style={styles.sidePanel}>
            <div style={styles.panelTitle}>Next Steps</div>
            <div style={styles.actionCol}>
              <button style={styles.retryBtn} onClick={onRetry}>Try Another Role</button>
              <button style={styles.retrySameBtn} onClick={onRetrySameRole}> Same Role</button>
              <button style={styles.copyBtn} onClick={() => {
                const text = questions.map((q, i) =>
                  `Q${i+1}: ${q}\nAnswer: ${answers[i]}\nScore: ${scores[i]}/9`
                ).join('\n\n')
                navigator.clipboard.writeText(text).then(() => alert('Copied!'))
              }}> Copy Results</button>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0a0a0f',
    padding: '32px 32px 60px',
    position: 'relative',
  },
  canvas: {
    position: 'fixed', top: 0, left: 0,
    width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: 99,
  },

  // Header
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  headerBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    background: '#1a1a24', border: '1px solid rgba(255,255,255,0.13)',
    borderRadius: '100px', padding: '5px 12px',
    fontSize: '11px', color: '#9999b0',
    fontFamily: "'DM Mono', monospace", marginBottom: '8px',
  },
  dot: { width: '7px', height: '7px', background: '#22c55e', borderRadius: '50%', display: 'inline-block' },
  heading: { fontSize: '28px', fontWeight: '800', color: '#f0f0f8', letterSpacing: '-1px', marginBottom: '4px' },
  sub: { fontSize: '13px', color: '#6b6b80', fontFamily: "'DM Mono', monospace" },
  headerActions: { display: 'flex', gap: '10px', alignItems: 'center' },
  shareBtn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #7c6aff, #a855f7)',
    border: 'none', borderRadius: '10px',
    fontSize: '13px', color: '#fff', fontWeight: '700', cursor: 'pointer',
  },

  // Stats Row
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
    marginBottom: '24px',
  },
  statCard: {
    background: '#111118',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '14px',
    padding: '18px 20px',
    display: 'flex', flexDirection: 'column', gap: '4px',
  },
  statNum: {
    fontSize: '32px', fontWeight: '800',
    color: '#f0f0f8', letterSpacing: '-1px', lineHeight: '1',
  },
  statDen: { fontSize: '18px', color: '#6b6b80', fontWeight: '400' },
  statLabel: { fontSize: '12px', color: '#6b6b80', fontFamily: "'DM Mono', monospace", marginTop: '4px' },
  statSub: { fontSize: '11px', color: '#4a4a5a', fontFamily: "'DM Mono', monospace" },
  gradePill: {
    alignSelf: 'flex-start', padding: '2px 10px',
    borderRadius: '100px', fontSize: '11px', fontWeight: '700',
    fontFamily: "'DM Mono', monospace", marginTop: '4px',
  },

  // Main Grid
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
    gap: '20px',
    alignItems: 'start',
  },

  // Left panel
  panel: {
    background: '#111118',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex', flexDirection: 'column', gap: '0px',
  },
  panelHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '20px',
  },
  panelTitle: {
    fontSize: '11px', fontWeight: '700', color: '#6b6b80',
    textTransform: 'uppercase', letterSpacing: '1.5px',
    fontFamily: "'DM Mono', monospace",
  },
  panelSub: { fontSize: '12px', color: '#4a4a5a', fontFamily: "'DM Mono', monospace" },

  qBlock: {
    borderTop: '1px solid rgba(255,255,255,0.05)',
    paddingTop: '16px', paddingBottom: '16px',
    display: 'flex', flexDirection: 'column', gap: '8px',
  },
  qTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' },
  qMeta: { display: 'flex', gap: '10px', alignItems: 'flex-start', flex: 1 },
  qNum: {
    fontSize: '10px', fontWeight: '700', color: '#7c6aff',
    fontFamily: "'DM Mono', monospace", flexShrink: 0, marginTop: '2px',
  },
  qText: { fontSize: '13px', color: '#f0f0f8', lineHeight: '1.5' },
  qScore: { fontSize: '13px', fontWeight: '700', fontFamily: "'DM Mono', monospace", flexShrink: 0 },
  progressBg: {
    width: '100%', height: '4px',
    background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: '2px', transition: 'width 0.6s ease' },
  answerBox: {
    background: '#1a1a24', borderRadius: '8px', padding: '8px 12px',
    fontSize: '12px', color: '#9999b0',
    fontFamily: "'DM Mono', monospace", lineHeight: '1.5', fontStyle: 'italic',
  },
  skipped: { fontSize: '12px', color: '#ef4444', fontFamily: "'DM Mono', monospace" },
  feedbackText: { fontSize: '12px', color: '#6b6b80', lineHeight: '1.5' },

  // Sidebar
  sidebar: { display: 'flex', flexDirection: 'column', gap: '14px' },
  sidePanel: {
    background: '#111118',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex', flexDirection: 'column', gap: '12px',
  },

  historyItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
  },
  historyDate: { fontSize: '11px', color: '#6b6b80', fontFamily: "'DM Mono', monospace", width: '70px', flexShrink: 0 },
  historyBarBg: { flex: 1, height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' },
  historyBarFill: { height: '100%', borderRadius: '2px' },
  historyScore: { fontSize: '12px', fontWeight: '700', fontFamily: "'DM Mono', monospace", width: '36px', textAlign: 'right' },

  tip: { display: 'flex', gap: '10px', fontSize: '13px', color: '#9999b0', lineHeight: '1.5' },
  tipIcon: { color: '#7c6aff', flexShrink: 0, fontWeight: '700' },

  actionCol: { display: 'flex', flexDirection: 'column', gap: '8px' },
  retryBtn: {
    padding: '12px', background: '#7c6aff', border: 'none',
    borderRadius: '10px', fontSize: '13px', fontWeight: '700',
    color: '#fff', cursor: 'pointer',
  },
  retrySameBtn: {
    padding: '12px', background: '#1a1a24',
    border: '1px solid rgba(124,106,255,0.3)',
    borderRadius: '10px', fontSize: '13px',
    fontWeight: '600', color: '#7c6aff', cursor: 'pointer',
  },
  copyBtn: {
    padding: '12px', background: 'transparent',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '10px', fontSize: '13px',
    color: '#9999b0', cursor: 'pointer',
  },
}