import { useEffect, useRef, useState } from 'react'

/** Anteprima webcam + scatto. Ritorna un File PNG via onCapture. */
export default function WebcamCapture({ onCapture }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [attiva, setAttiva] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let annullato = false

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('getUserMedia non supportato dal browser')
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        })
        if (annullato) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
        setAttiva(true)
      } catch (err) {
        setError('Fotocamera non disponibile: ' + err.message)
      }
    }

    start()

    return () => {
      annullato = true
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
    }
  }, [])

  function scatta() {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    canvas.toBlob((blob) => {
      if (!blob) return
      const file = new File([blob], `webcam-${Date.now()}.png`, { type: 'image/png' })
      onCapture(file)
    }, 'image/png')
  }

  if (error) return <p className="alert">{error}</p>

  return (
    <div className="webcam">
      <video ref={videoRef} autoPlay playsInline muted className="webcam__video" />
      <button type="button" className="btn" onClick={scatta} disabled={!attiva}>
        📷 Scatta foto
      </button>
    </div>
  )
}
