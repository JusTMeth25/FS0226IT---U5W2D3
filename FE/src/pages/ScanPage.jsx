import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { scan, create } from '../api/documentApi'
import { STATO } from '../constants/stato'
import WebcamCapture from '../components/WebcamCapture'

const LINGUE = [
  { value: 'ita+eng', label: 'Italiano + Inglese' },
  { value: 'ita', label: 'Italiano' },
  { value: 'eng', label: 'Inglese' },
]

export default function ScanPage() {
  const navigate = useNavigate()
  const [modo, setModo] = useState('file') // 'file' | 'camera'
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [language, setLanguage] = useState('ita+eng')
  const [titolo, setTitolo] = useState('')
  const [text, setText] = useState('')
  const [scansionato, setScansionato] = useState(false)
  const [ocrFallito, setOcrFallito] = useState(false)
  const [loadingOcr, setLoadingOcr] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [error, setError] = useState('')

  // anteprima immagine con cleanup dell'object URL
  useEffect(() => {
    if (!file || !file.type.startsWith('image/')) {
      setPreview('')
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  function selezionaFile(f) {
    setFile(f)
    setScansionato(false)
    setOcrFallito(false)
    setText('')
    setError('')
    if (f && !titolo) setTitolo(f.name)
  }

  function onFileChange(e) {
    selezionaFile(e.target.files?.[0] || null)
  }

  function onCapture(f) {
    selezionaFile(f)
    setTitolo(f.name)
  }

  async function onScan() {
    if (!file) return
    setLoadingOcr(true)
    setError('')
    setOcrFallito(false)
    try {
      const res = await scan(file, language)
      setText(res.text || '')
      setScansionato(true)
    } catch (err) {
      setOcrFallito(true)
      setScansionato(true)
      setError('OCR fallito: ' + err.message + '. Puoi inserire il testo a mano.')
    } finally {
      setLoadingOcr(false)
    }
  }

  async function onSave() {
    if (!file || !titolo.trim()) {
      setError('Titolo e file obbligatori')
      return
    }
    setSalvando(true)
    setError('')
    try {
      const stato = ocrFallito ? STATO.OCR_FALLITO : STATO.SALVATO
      const doc = await create({ titolo: titolo.trim(), file, text, stato })
      navigate(`/document/${doc.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="page">
      <h1>Nuova scansione</h1>

      <div className="card form">
        <div className="segmented">
          <button
            type="button"
            className={modo === 'file' ? 'active' : ''}
            onClick={() => setModo('file')}
          >
            📁 Carica file
          </button>
          <button
            type="button"
            className={modo === 'camera' ? 'active' : ''}
            onClick={() => setModo('camera')}
          >
            📷 Fotocamera
          </button>
        </div>

        {modo === 'file' ? (
          <label className="field">
            <span>File documento</span>
            <input type="file" accept="image/*,application/pdf" onChange={onFileChange} />
          </label>
        ) : (
          <WebcamCapture onCapture={onCapture} />
        )}

        {preview && (
          <div className="field">
            <span>Anteprima</span>
            <img className="preview" src={preview} alt="anteprima" />
          </div>
        )}
        {file && !preview && <p className="muted-note">File selezionato: {file.name}</p>}

        <label className="field">
          <span>Lingua OCR</span>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            {LINGUE.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </label>

        <button className="btn" onClick={onScan} disabled={!file || loadingOcr}>
          {loadingOcr ? 'OCR in corso…' : 'Esegui OCR'}
        </button>
      </div>

      {scansionato && (
        <div className="card form">
          <label className="field">
            <span>Titolo</span>
            <input value={titolo} onChange={(e) => setTitolo(e.target.value)} />
          </label>

          <label className="field">
            <span>Testo estratto (modificabile)</span>
            <textarea
              className="textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={16}
              placeholder="Correggi qui il testo prima di salvare…"
            />
          </label>

          <button className="btn btn--primary" onClick={onSave} disabled={salvando}>
            {salvando ? 'Salvataggio…' : 'Salva in archivio'}
          </button>
        </div>
      )}

      {error && <p className="alert">{error}</p>}
    </div>
  )
}
