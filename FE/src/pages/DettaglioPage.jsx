import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getById, update } from '../api/documentApi'
import { STATO } from '../constants/stato'
import StatoBadge from '../components/StatoBadge'
import FileViewer from '../components/FileViewer'

export default function DettaglioPage() {
  const { id } = useParams()
  const [doc, setDoc] = useState(null)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [error, setError] = useState('')
  const [messaggio, setMessaggio] = useState('')

  useEffect(() => {
    setLoading(true)
    getById(id)
      .then((d) => {
        setDoc(d)
        setText(d.text || '')
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  async function onSave() {
    setSalvando(true)
    setError('')
    setMessaggio('')
    try {
      const aggiornato = await update(id, { text, stato: STATO.SALVATO })
      setDoc(aggiornato)
      setText(aggiornato.text || '')
      setMessaggio('Modifiche salvate')
    } catch (err) {
      setError(err.message)
    } finally {
      setSalvando(false)
    }
  }

  if (loading) return <div className="page"><p>Caricamento…</p></div>
  if (error && !doc) return <div className="page"><p className="alert">{error}</p></div>
  if (!doc) return null

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <Link className="link" to="/">← Archivio</Link>
          <h1>{doc.titolo}</h1>
          <StatoBadge stato={doc.stato} />
        </div>
        <button className="btn btn--primary" onClick={onSave} disabled={salvando}>
          {salvando ? 'Salvataggio…' : 'Salva modifiche'}
        </button>
      </div>

      <div className="detail">
        <div className="detail__col">
          <h2>File originale</h2>
          <FileViewer id={doc.id} contentType={doc.contentType} titolo={doc.titolo} />
        </div>

        <div className="detail__col">
          <h2>Testo (modificabile)</h2>
          <textarea
            className="textarea textarea--tall"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Correggi il testo…"
          />
        </div>
      </div>

      {messaggio && <p className="ok">{messaggio}</p>}
      {error && <p className="alert">{error}</p>}
    </div>
  )
}
