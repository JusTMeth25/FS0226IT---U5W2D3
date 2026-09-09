import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAll } from '../api/documentApi'
import StatoBadge from '../components/StatoBadge'

function formatData(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('it-IT')
}

function formatPeso(bytes) {
  if (bytes == null) return '—'
  const kb = bytes / 1024
  return kb < 1024 ? `${kb.toFixed(1)} KB` : `${(kb / 1024).toFixed(1)} MB`
}

export default function ArchivioPage() {
  const [documenti, setDocumenti] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAll()
      .then(setDocumenti)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page"><p>Caricamento…</p></div>
  if (error) return <div className="page"><p className="alert">{error}</p></div>

  return (
    <div className="page">
      <h1>Archivio documenti</h1>

      {documenti.length === 0 ? (
        <p>Nessun documento archiviato. <Link to="/scan">Crea la prima scansione</Link>.</p>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Titolo</th>
                <th>Stato</th>
                <th>Peso</th>
                <th>Creato</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {documenti.map((d) => (
                <tr key={d.id}>
                  <td>{d.titolo}</td>
                  <td><StatoBadge stato={d.stato} /></td>
                  <td>{formatPeso(d.peso)}</td>
                  <td>{formatData(d.createdAt)}</td>
                  <td>
                    <Link className="btn btn--sm" to={`/document/${d.id}`}>
                      Apri
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
