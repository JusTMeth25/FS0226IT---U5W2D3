const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/document'

async function parseError(res) {
  let message = `Errore ${res.status}`
  try {
    const body = await res.json()
    if (body?.message) message = body.message
    if (body?.details?.length) message += ': ' + body.details.join(', ')
  } catch {
    // corpo non JSON, tengo messaggio di default
  }
  return new Error(message)
}

async function handle(res) {
  if (!res.ok) throw await parseError(res)
  return res.json()
}

export async function getAll() {
  return handle(await fetch(`${BASE}/all`))
}

export async function getById(id) {
  return handle(await fetch(`${BASE}/${id}`))
}

export function fileUrl(id) {
  return `${BASE}/${id}/file`
}

export async function scan(file, language) {
  const form = new FormData()
  form.append('file', file)
  form.append('language', language)
  return handle(await fetch(`${BASE}/scan`, { method: 'POST', body: form }))
}

export async function create({ titolo, file, text, stato }) {
  const form = new FormData()
  form.append('titolo', titolo)
  form.append('file', file)
  if (text != null) form.append('text', text)
  form.append('stato', stato)
  return handle(await fetch(BASE, { method: 'POST', body: form }))
}

export async function update(id, { text, stato }) {
  return handle(
    await fetch(`${BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, stato }),
    }),
  )
}
