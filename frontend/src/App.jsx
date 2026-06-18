import { useEffect, useState } from 'react'
import './App.css'

const API = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

export default function App() {
  const [home, setHome] = useState('Loading...')
  const [health, setHealth] = useState('Loading...')
  const [version, setVersion] = useState('Loading...')
  const [info, setInfo] = useState('Loading...')

  useEffect(() => {
    fetch(`${API}/`).then(r => r.json()).then(d => setHome(d.message)).catch(() => setHome('Error'))
    fetch(`${API}/health`).then(r => r.json()).then(d => setHealth(d.status)).catch(() => setHealth('Error'))
    fetch(`${API}/version`).then(r => r.json()).then(d => setVersion(d.version)).catch(() => setVersion('Error'))
    fetch(`${API}/info`).then(r => r.json()).then(d => setInfo(`${d.app} - ${d.environment}`)).catch(() => setInfo('Error'))
  }, [])

  return (
    <div className="container">
      <h1>🚀 Tiny App — Pipeline Powered!</h1>
      <div className="grid">
        <div className="card">
          <h2>Home</h2>
          <p>{home}</p>
        </div>
        <div className="card">
          <h2>Health</h2>
          <p>{health}</p>
        </div>
        <div className="card">
          <h2>Version</h2>
          <p>{version}</p>
        </div>
        <div className="card">
          <h2>Info</h2>
          <p>{info}</p>
        </div>
      </div>
    </div>
  )
}
