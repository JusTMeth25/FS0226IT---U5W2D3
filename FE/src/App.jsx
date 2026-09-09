import { Routes, Route, NavLink } from 'react-router-dom'
import ArchivioPage from './pages/ArchivioPage'
import ScanPage from './pages/ScanPage'
import DettaglioPage from './pages/DettaglioPage'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <header className="topbar">
        <span className="brand">📄 Archivio OCR</span>
        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Archivio
          </NavLink>
          <NavLink to="/scan" className={({ isActive }) => (isActive ? 'active' : '')}>
            Nuova scansione
          </NavLink>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<ArchivioPage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/document/:id" element={<DettaglioPage />} />
        </Routes>
      </main>
    </div>
  )
}
