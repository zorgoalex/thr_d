import './App.css'

function App() {
  return (
    <main className="app-shell">
      <section className="hero-panel">
        <p className="eyebrow">MVP v0.5 foundation</p>
        <h1>thr_d 3D furniture constructor</h1>
        <p className="hero-copy">
          Frontend shell is online. Stage 0 provides the application scaffold,
          local tooling, and smoke coverage before editor features land.
        </p>
        <div className="hero-grid" role="list" aria-label="Foundation checklist">
          <article className="hero-card" role="listitem">
            <h2>Frontend</h2>
            <p>React + TypeScript + Vite with ESLint and Vitest smoke coverage.</p>
          </article>
          <article className="hero-card" role="listitem">
            <h2>Backend</h2>
            <p>FastAPI, trace-aware error handling, healthcheck, and database bootstrap.</p>
          </article>
          <article className="hero-card" role="listitem">
            <h2>Contracts</h2>
            <p>Canonical project models and API DTOs aligned with the product spec.</p>
          </article>
        </div>
      </section>
    </main>
  )
}

export default App
