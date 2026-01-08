import { useState, useEffect } from 'react'
import PlateCalculator from './components/PlateCalculator'
import RestTimer from './components/RestTimer'

function App() {
  const [activeTab, setActiveTab] = useState('plates')

  useEffect(() => {
    document.title = 'RacknRest';
  }, []);

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
        {activeTab === 'plates' ? <PlateCalculator /> : <RestTimer />}
      </main>

    </div>
  )
}

export default App
