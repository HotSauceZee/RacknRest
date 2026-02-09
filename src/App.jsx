import { useState, useEffect, useCallback } from 'react'
import PlateCalculator from './components/PlateCalculator'
import RestTimer from './components/RestTimer'

function App() {
  const [activeTab, setActiveTab] = useState('plates')
  const appVersion = import.meta.env.VITE_APP_VERSION || 'dev'
  const [hasUpdate, setHasUpdate] = useState(false)

  const checkForUpdate = useCallback(async () => {
    if (import.meta.env.DEV) return

    try {
      const response = await fetch(`${import.meta.env.BASE_URL}version.json`, {
        cache: 'no-store',
      })
      if (!response.ok) return

      const data = await response.json()
      if (data?.version && data.version !== appVersion) {
        setHasUpdate(true)
      }
    } catch {
      // Ignore connectivity/cache errors; we'll check again on next focus.
    }
  }, [appVersion])

  useEffect(() => {
    document.title = 'RacknRest';
  }, []);

  useEffect(() => {
    checkForUpdate()

    const onFocus = () => {
      checkForUpdate()
    }
    const onVisibilityChange = () => {
      if (!document.hidden) {
        checkForUpdate()
      }
    }

    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [checkForUpdate])

  return (
    <div className="fade-in">
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--accent)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '3px' }}>
          Rackn<span style={{ color: 'white' }}>Rest</span>
        </h1>

        <div className="flex-row" style={{ background: '#111', borderRadius: '1rem', padding: '4px' }}>
          <button
            className={`btn ${activeTab === 'plates' ? '' : 'btn-ghost'}`}
            style={{ borderRadius: '0.8rem', padding: '0.75rem 1rem', fontSize: '1rem' }}
            onClick={() => setActiveTab('plates')}
          >
            Plates
          </button>
          <button
            className={`btn ${activeTab === 'timer' ? '' : 'btn-ghost'}`}
            style={{ borderRadius: '0.8rem', padding: '0.75rem 1rem', fontSize: '1rem' }}
            onClick={() => setActiveTab('timer')}
          >
            Timer
          </button>
        </div>
      </header>

      <main>
        <div style={{ display: activeTab === 'plates' ? 'block' : 'none' }}>
          <PlateCalculator />
        </div>
        <div style={{ display: activeTab === 'timer' ? 'block' : 'none' }}>
          <RestTimer />
        </div>
      </main>
      <footer
        style={{
          marginTop: '0.5rem',
          textAlign: 'center',
          fontSize: '0.65rem',
          color: 'var(--text-dim)',
          opacity: 0.55,
          userSelect: 'none',
        }}
      >
        v{appVersion}
        {hasUpdate && (
          <div style={{ marginTop: '0.35rem' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'transparent',
                border: '1px solid #2a2a2a',
                borderRadius: '0.5rem',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                fontSize: '0.62rem',
                padding: '0.2rem 0.45rem',
              }}
            >
              New version available. Refresh
            </button>
          </div>
        )}
      </footer>

    </div>
  )
}

export default App
