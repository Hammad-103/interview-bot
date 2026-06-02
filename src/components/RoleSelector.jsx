import { useState } from 'react'

const ROLES = [
  { id: 'Frontend Dev', icon: '💻', sub: 'React · CSS · JS' },
  { id: 'Backend Dev', icon: '⚙️', sub: 'Node · APIs · DBs' },
  { id: 'Data Science', icon: '📊', sub: 'ML · Python · Stats' },
  { id: 'Product Manager', icon: '🧭', sub: 'Strategy · Roadmaps' },
  { id: 'UI/UX Designer', icon: '🎨', sub: 'Design · Research' },
  { id: 'HR / Behavioral', icon: '🤝', sub: 'Soft skills · Culture' },
]

const LEVELS = ['Junior', 'Mid', 'Senior']

export default function RoleSelector({ onStart }) {
  const [role, setRole] = useState(null)
  const [level, setLevel] = useState('Junior')

  return (
    <div style={styles.container}>
      <div style={styles.badge}>
        <span style={styles.dot}></span>
        AI Interview Engine
      </div>

      <h1 style={styles.heading}>
        Ace Your Next<br />
        <span style={styles.accent}>Interview</span>
      </h1>

      <p style={styles.subtext}>
        A real-time AI interviewer that asks, listens,
        and gives you brutally honest feedback.
      </p>

      <div style={styles.grid}>
        {ROLES.map((r) => (
          <div
            key={r.id}
            style={{
              ...styles.card,
              ...(role === r.id ? styles.cardSelected : {})
            }}
            onClick={() => setRole(r.id)}
          >
            <div style={styles.icon}>{r.icon}</div>
            <div style={styles.roleName}>{r.id}</div>
            <div style={styles.roleSub}>{r.sub}</div>
          </div>
        ))}
      </div>

      <div style={styles.levelRow}>
        {LEVELS.map((l) => (
          <button
            key={l}
            style={{
              ...styles.levelBtn,
              ...(level === l ? styles.levelSelected : {})
            }}
            onClick={() => setLevel(l)}
          >
            {l}
          </button>
        ))}
      </div>

      <button
        style={{
          ...styles.startBtn,
          ...(role ? {} : styles.startDisabled)
        }}
        disabled={!role}
        onClick={() => onStart({ role, level })}
      >
        {role ? `Start ${role} Interview →` : 'Select a role to begin'}
      </button>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
    gap: '8px',
  },
  badge: {
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
    marginBottom: '16px',
  },
  dot: {
    width: '7px',
    height: '7px',
    background: '#22c55e',
    borderRadius: '50%',
    display: 'inline-block',
  },
  heading: {
    fontSize: '42px',
    fontWeight: '800',
    lineHeight: '1.1',
    letterSpacing: '-1.5px',
    marginBottom: '10px',
    textAlign: 'center',
    color: '#f0f0f8',
  },
  accent: {
    background: 'linear-gradient(135deg, #7c6aff, #a855f7)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtext: {
    color: '#9999b0',
    fontSize: '15px',
    lineHeight: '1.6',
    maxWidth: '380px',
    marginBottom: '28px',
    textAlign: 'center',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    width: '100%',
    maxWidth: '460px',
    marginBottom: '20px',
  },
  card: {
    background: '#111118',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '14px',
    padding: '14px 16px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
  },
  cardSelected: {
    border: '1px solid #7c6aff',
    background: 'rgba(124,106,255,0.08)',
  },
  icon: { fontSize: '20px', marginBottom: '6px' },
  roleName: { fontSize: '13px', fontWeight: '600', color: '#f0f0f8' },
  roleSub: {
    fontSize: '11px',
    color: '#6b6b80',
    marginTop: '2px',
    fontFamily: "'DM Mono', monospace",
  },
  levelRow: {
    display: 'flex',
    gap: '8px',
    width: '100%',
    maxWidth: '460px',
    marginBottom: '24px',
  },
  levelBtn: {
    flex: '1',
    padding: '8px',
    background: '#111118',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#9999b0',
    transition: 'all 0.2s',
  },
  levelSelected: {
    border: '1px solid #7c6aff',
    color: '#7c6aff',
    background: 'rgba(124,106,255,0.08)',
  },
  startBtn: {
    width: '100%',
    maxWidth: '460px',
    padding: '16px',
    background: '#7c6aff',
    border: 'none',
    borderRadius: '14px',
    fontSize: '15px',
    fontWeight: '700',
    color: '#fff',
    transition: 'all 0.2s',
  },
  startDisabled: {
    opacity: '0.4',
    cursor: 'not-allowed',
  },
}