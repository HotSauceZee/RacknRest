import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import './index.css'
import App from './App.jsx'

function Fallback({ error }) {
  return (
    <div role="alert" style={{ padding: '2rem', color: 'white', background: '#111', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h2 style={{ color: 'var(--accent)' }}>Something went wrong</h2>
      <pre style={{ color: 'red', marginTop: '1rem', whiteSpace: 'pre-wrap', maxWidth: '100%' }}>{error.message}</pre>
      <button className="btn" style={{ marginTop: '2rem' }} onClick={() => window.location.reload()}>Try again</button>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={Fallback}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`;
    navigator.serviceWorker.register(swUrl);
  });
}
