import { fileUrl } from '../api/documentApi'

/** Mostra file originale: immagine inline oppure PDF/altro in iframe. */
export default function FileViewer({ id, contentType, titolo }) {
  const url = fileUrl(id)
  const isImage = (contentType || '').startsWith('image/')

  return (
    <div className="viewer">
      {isImage ? (
        <img className="viewer__img" src={url} alt={titolo || 'documento'} />
      ) : (
        <iframe className="viewer__frame" src={url} title={titolo || 'documento'} />
      )}
      <a className="viewer__link" href={url} target="_blank" rel="noreferrer">
        Apri file originale
      </a>
    </div>
  )
}
