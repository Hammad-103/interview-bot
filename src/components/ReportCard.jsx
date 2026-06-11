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
    const newEntry = {
      date: new Date().toISOString(),
      score: percent,
      total: total,
      max: max,
      timestamp: Date.now()
    }
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
        if (p.y > canvas.height) {
          p.y = -20
          p.x = Math.random() * canvas.width
        }
      })
      frame = requestAnimationFrame(draw)
    }
    draw()

    const timer = setTimeout(() => {
      cancelAnimationFrame(frame)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }, 4000)

    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
    }
  }, [percent])

  function getFeedback(score) {
    const pool =
      score >= 8 ? FEEDBACK.strong :
      score >= 6 ? FEEDBACK.average :
      FEEDBACK.weak
    return pool[Math.floor(Math.random() * pool.length)]
  }

  return (
    <div style={styles.container}>
      <canvas ref={canvasRef} style={styles.canvas} />

      <div style={styles.card}>
        <div style={styles.topBadge}>
          <span style={styles.dot}></span>
          Interview Complete
        </div>

        <h2 style={styles.heading}>Your Report Card</h2>
        <p style={styles.sub}>{config.role} · {config.level} Level</p>

        {bestScore !== null && bestScore > 0 && (
          <div style={styles.bestScoreBox}>
            <span style={styles.trophyIcon}>🏆</span>
            <div>
              <div style={styles.bestLabel}>Your Best Score</div>
              <div style={styles.bestValue}>{bestScore}%</div>
            </div>
          </div>
        )}

        <div style={styles.scoreBox}>
          <div style={{ ...styles.scoreNum, color: grade.color }}>
            {percent}%
          </div>
          <div style={{ ...styles.gradeBadge, background: `${grade.color}22`, color: grade.color }}>
            {grade.label}
          </div>
          <div style={styles.scoreDesc}>
            {total} / {max} points across {questions.length} questions
          </div>
        </div>

        {previousScores.length > 1 && (
          <div style={styles.historyBox}>
            <div style={styles.historyTitle}>Previous Attempts</div>
            <div style={styles.historyList}>
              {previousScores.slice(1).map((entry, idx) => (
                <div key={idx} style={styles.historyItem}>
                  <span style={styles.historyDate}>
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                  <span style={{
                    ...styles.historyScore,
                    color: entry.score >= 80 ? '#22c55e' : 
                           entry.score >= 60 ? '#7c6aff' : '#f59e0b'
                  }}>
                    {entry.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Question Breakdown</div>
          {questions.map((q, i) => (
            <div key={i} style={styles.qBlock}>
              <div style={styles.qHeader}>
                <span style={styles.qNum}>Q{i + 1}</span>
                <div style={{
                  ...styles.scoreBar,
                  background: scores[i] >= 8 ? '#22c55e22' :
                    scores[i] >= 6 ? '#7c6aff22' : '#ef444422',
                  borderColor: scores[i] >= 8 ? '#22c55e' :
                    scores[i] >= 6 ? '#7c6aff' : '#ef4444',
                }}>
                  <span style={{
                    color: scores[i] >= 8 ? '#22c55e' :
                      scores[i] >= 6 ? '#7c6aff' : '#ef4444',
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '12px',
                    fontWeight: '700',
                  }}>{scores[i]}/9</span>
                </div>
              </div>
              <div style={styles.qText}>{q}</div>
              {answers[i] !== '[Skipped]' ? (
                <div style={styles.answerBox}>{answers[i]}</div>
              ) : (
                <div style={styles.skipped}>Skipped</div>
              )}
              <div style={styles.feedbackText}>
                💬 {getFeedback(scores[i])}
              </div>
            </div>
          ))}
        </div>

        {tips.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Improvement Tips</div>
            {tips.map((tip, i) => (
              <div key={i} style={styles.tip}>
                <span style={styles.tipIcon}>→</span>
                {tip}
              </div>
            ))}
          </div>
        )}

        <div style={styles.actions}>
          <button style={styles.retryBtn} onClick={onRetry}>
            Try Another Role
          </button>
          <button style={styles.retrySameBtn} onClick={onRetrySameRole}>
            🔄 Try Again (Same Role)
          </button>
          <button style={styles.copyBtn} onClick={() => {
            const text = questions.map((q, i) =>
              `Q${i+1}: ${q}\nAnswer: ${answers[i]}\nScore: ${scores[i]}/9`
            ).join('\n\n')
            navigator.clipboard.writeText(text)
              .then(() => alert('Results copied to clipboard!'))
          }}>
            Copy Results
          </button>
          {/* ✅ Share button */}
          <button style={styles.shareBtn} onClick={() => {
            const text = `🎯 I just completed an AI Interview!\n\nRole: ${config.role}\nLevel: ${config.level}\nScore: ${percent}% (${grade.label})\n\nTry it yourself: https://interview-bot-ivory-six.vercel.app`
            if (navigator.share) {
              navigator.share({ title: 'Interview Bot Result', text })
            } else {
              navigator.clipboard.writeText(text)
                .then(() => alert('Result copied! Paste it anywhere to share.'))
            }
          }}>
            Share 🚀
          </button>
        </div>

      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    padding: '40px 24px',
    background: '#0a0a0f',
    position: 'relative',
  },
  canvas: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 99,
  },
  card: {
    width: '100%',
    maxWidth: '560px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    position: 'relative',
    zIndex: 100,
  },
  topBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: '#1a1a24',
    border: '1px solid rgba(255,255,255,0.13)',
    borderRadius: '100px',
    padding: '6px 14px',
    fontSize: '12px',
    color: '#9999b0',
    fontFamily: "'DM Mono', monospace",
    alignSelf: 'flex-start',
    marginBottom: '4px',
  },
  dot: {
    width: '7px', height: '7px',
    background: '#22c55e',
    borderRadius: '50%', display: 'inline-block',
  },
  heading: {
    fontSize: '30px', fontWeight: '800',
    color: '#f0f0f8', letterSpacing: '-1px',
  },
  sub: {
    fontSize: '13px', color: '#6b6b80',
    fontFamily: "'DM Mono', monospace",
    marginBottom: '8px',
  },
  bestScoreBox: {
    background: 'linear-gradient(135deg, #f59e0b22, #f59e0b08)',
    border: '1px solid rgba(245,158,11,0.3)',
    borderRadius: '12px',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  trophyIcon: { fontSize: '28px' },
  bestLabel: { fontSize: '11px', color: '#f59e0b', fontFamily: "'DM Mono', monospace" },
  bestValue: { fontSize: '20px', fontWeight: '800', color: '#f59e0b', lineHeight: '1.2' },
  scoreBox: {
    background: '#111118',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  scoreNum: {
    fontSize: '52px', fontWeight: '800',
    letterSpacing: '-2px', lineHeight: '1',
  },
  gradeBadge: {
    padding: '4px 14px', borderRadius: '100px',
    fontSize: '12px', fontWeight: '700',
    fontFamily: "'DM Mono', monospace",
  },
  scoreDesc: { fontSize: '12px', color: '#6b6b80', marginTop: '4px' },
  historyBox: {
    background: '#0f0f14',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '12px',
    padding: '12px 16px',
    marginBottom: '8px',
  },
  historyTitle: {
    fontSize: '10px',
    color: '#6b6b80',
    fontFamily: "'DM Mono', monospace",
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  historyList: { display: 'flex', flexDirection: 'column', gap: '6px' },
  historyItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
  },
  historyDate: { color: '#6b6b80', fontFamily: "'DM Mono', monospace" },
  historyScore: { fontWeight: '700', fontFamily: "'DM Mono', monospace" },
  section: {
    background: '#111118',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  sectionTitle: {
    fontSize: '11px', fontWeight: '700',
    color: '#6b6b80', textTransform: 'uppercase',
    letterSpacing: '1px',
    fontFamily: "'DM Mono', monospace",
  },
  qBlock: {
    borderTop: '1px solid rgba(255,255,255,0.05)',
    paddingTop: '14px',
    display: 'flex', flexDirection: 'column', gap: '6px',
  },
  qHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  qNum: {
    fontSize: '11px', fontWeight: '700',
    color: '#7c6aff', fontFamily: "'DM Mono', monospace",
  },
  scoreBar: {
    padding: '2px 10px', borderRadius: '100px',
    border: '1px solid',
  },
  qText: { fontSize: '13px', color: '#f0f0f8', lineHeight: '1.5' },
  answerBox: {
    background: '#1a1a24',
    borderRadius: '8px',
    padding: '8px 10px',
    fontSize: '12px',
    color: '#9999b0',
    fontFamily: "'DM Mono', monospace",
    lineHeight: '1.5',
    fontStyle: 'italic',
  },
  skipped: {
    fontSize: '12px', color: '#ef4444',
    fontFamily: "'DM Mono', monospace",
  },
  feedbackText: {
    fontSize: '12px', color: '#9999b0', lineHeight: '1.5',
  },
  tip: {
    display: 'flex', gap: '10px',
    fontSize: '13px', color: '#9999b0', lineHeight: '1.5',
  },
  tipIcon: { color: '#7c6aff', flexShrink: 0, fontWeight: '700' },
  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: '8px',
    paddingBottom: '40px',
    flexWrap: 'wrap',
  },
  retryBtn: {
    flex: 1, padding: '14px',
    background: '#7c6aff', border: 'none',
    borderRadius: '12px', fontSize: '14px',
    fontWeight: '700', color: '#fff', cursor: 'pointer',
  },
  retrySameBtn: {
    flex: 1, padding: '14px',
    background: '#1a1a24', border: '1px solid rgba(124,106,255,0.3)',
    borderRadius: '12px', fontSize: '13px',
    fontWeight: '600', color: '#7c6aff', cursor: 'pointer',
  },
  copyBtn: {
    padding: '14px 20px',
    background: '#1a1a24',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '12px', fontSize: '13px',
    color: '#9999b0', cursor: 'pointer',
  },
  // ✅ Share button style
  shareBtn: {
    padding: '14px 20px',
    background: 'linear-gradient(135deg, #7c6aff, #a855f7)',
    border: 'none',
    borderRadius: '12px',
    fontSize: '13px',
    color: '#fff',
    fontWeight: '700',
    cursor: 'pointer',
  },
}