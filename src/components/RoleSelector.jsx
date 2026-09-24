import { useState } from 'react'

const ROLES = [
  { role: 'Frontend Dev', sub: 'React · CSS · JS' },
  { role: 'Backend Dev', sub: 'Node · APIs · DBs' },
  { role: 'Data Science', sub: 'ML · Python · Stats' },
  { role: 'Product Manager', sub: 'Strategy · Roadmaps' },
  { role: 'UI/UX Designer', sub: 'Design · Research' },
  { role: 'HR / Behavioral', sub: 'Soft skills · Culture' },
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
            key={r.role}
            style={{
              ...styles.card,
              ...(role === r.role ? styles.cardSelected : {})
            }}
            onClick={() => setRole(r.role)}
          >
            <div style={styles.icon}>{r.icon}</div>
            <div style={styles.roleName}>{r.role}</div>
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
    background: '#050f14',
    fontFamily: "'Poppins', sans-serif",
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: '#0c1d25',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: '100px',
    padding: '6px 14px',
    fontSize: '12px',
    color: '#84b3c0',
    fontFamily: "'DM Mono', monospace",
    marginBottom: '16px',
  },
  dot: {
    width: '7px',
    height: '7px',
    background: '#67e8f9',
    borderRadius: '50%',
    display: 'inline-block',
  },
  heading: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: '40px',
    fontWeight: '700',
    lineHeight: '1.15',
    letterSpacing: '-1px',
    marginBottom: '10px',
    textAlign: 'center',
    color: '#e8f7fa',
  },
  accent: {
    color: '#67e8f9',
  },
  subtext: {
    fontFamily: "'Poppins', sans-serif",
    color: '#84b3c0',
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
    background: '#0a1820',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '14px',
    padding: '14px 16px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
  },
  cardSelected: {
    border: '1px solid #0891b2',
    background: 'rgba(8,145,178,0.18)',
  },
  icon: { fontSize: '20px', marginBottom: '6px' },
  roleName: { fontFamily: "'Poppins', sans-serif", fontSize: '13px', fontWeight: '600', color: '#e8f7fa' },
  roleSub: {
    fontSize: '11px',
    color: '#6a9aa8',
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
    fontFamily: "'Poppins', sans-serif",
    padding: '8px',
    background: '#0a1820',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#84b3c0',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  levelSelected: {
    border: '1px solid #0891b2',
    color: '#67e8f9',
    background: 'rgba(8,145,178,0.18)',
  },
  startBtn: {
    width: '100%',
    maxWidth: '460px',
    fontFamily: "'Poppins', sans-serif",
    padding: '16px',
    background: '#0891b2',
    border: 'none',
    borderRadius: '14px',
    fontSize: '15px',
    fontWeight: '700',
    color: '#ecfeff',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  startDisabled: {
    opacity: '0.4',
    cursor: 'not-allowed',
  },
}