import { FEEDBACK, TIPS } from '../data/questions'

export default function ReportCard({ results, config, onRetry }) {
  const { questions, answers, scores } = results
  const total = scores.reduce((a, b) => a + b, 0)
  const max = questions.length * 9
  const percent = Math.round((total / max) * 100)
  const tips = TIPS[config.role] || []

  const grade =
    percent >= 80 ? { label: 'Excellent', color: '#22c55e' } :
    percent >= 60 ? { label: 'Good', color: '#7c6aff' } :
    percent >= 40 ? { label: 'Average', color: '#f59e0b' } :
    { label: 'Needs Work', color: '#ef4444' }

  function getFeedback(score) {
    const pool =
      score >= 8 ? FEEDBACK.strong :
      score >= 6 ? FEEDBACK.average :
      FEEDBACK.weak
    return pool[Math.floor(Math.random() * pool.length)]
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* Header */}
        <div style={styles.topBadge}>
          <span style={styles.dot}></span>
          Interview Complete
        </div>

        <h2 style={styles.heading}>Your Report Card</h2>
        <p style={styles.sub}>{config.role} · {config.level} Level</p>

        {/* Score */}
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

        {/* Q&A Breakdown */}
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

        {/* Tips */}
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

        {/* Actions */}
        <div style={styles.actions}>
          <button style={styles.retryBtn} onClick={onRetry}>
            Try Another Role
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
  },
  card: {
    width: '100%',
    maxWidth: '560px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
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
  actions: { display: 'flex', gap: '10px', marginTop: '8px', paddingBottom: '40px' },
  retryBtn: {
    flex: 1, padding: '14px',
    background: '#7c6aff', border: 'none',
    borderRadius: '12px', fontSize: '14px',
    fontWeight: '700', color: '#fff', cursor: 'pointer',
  },
  copyBtn: {
    padding: '14px 20px',
    background: '#1a1a24',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '12px', fontSize: '13px',
    color: '#9999b0', cursor: 'pointer',
  },
}