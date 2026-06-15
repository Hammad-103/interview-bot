import { useState } from 'react'
import RoleSelector from './components/RoleSelector'
import InterviewScreen from './components/InterviewScreen'
import ReportCard from './components/ReportCard'
import './styles/global.css'

function App() {
  const [screen, setScreen] = useState('landing')
  const [config, setConfig] = useState({ role: null, level: 'Junior' })
  const [results, setResults] = useState(null)

  return (
    <div className="app">
      {screen === 'landing' && (
        <RoleSelector
          onStart={(cfg) => { setConfig(cfg); setScreen('interview') }}
        />
      )}
      {screen === 'interview' && (
        <InterviewScreen
          config={config}
          onFinish={(data) => { setResults(data); setScreen('report') }}
        />
      )}
      {screen === 'report' && (
        <ReportCard
          results={results}
          config={config}
          onRetry={() => setScreen('landing')}
          onRetrySameRole={() => setScreen('interview')}

        />
      )}
    </div>
  )
}

export default App