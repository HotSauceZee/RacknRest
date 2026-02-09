function ErrorFallback({ error }) {
  return (
    <div
      role="alert"
      style={{
        padding: '2rem',
        color: 'white',
        background: '#111',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <h2 style={{ color: 'var(--accent)' }}>Something went wrong</h2>
      <pre style={{ color: 'red', marginTop: '1rem', whiteSpace: 'pre-wrap', maxWidth: '100%' }}>
        {error.message}
      </pre>
      <button className="btn" style={{ marginTop: '2rem' }} onClick={() => window.location.reload()}>
        Try again
      </button>
    </div>
  )
}

export default ErrorFallback
