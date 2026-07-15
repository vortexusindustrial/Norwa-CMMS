// Minimal Frappe RPC helper. Deliberately not imported from the `frappe-ui`
// package: importing anything from its barrel export pulls in its entire
// component library at dev-time (Vite serves native ESM with no
// tree-shaking), and several of those components have CJS deps that break
// under native ESM loading. Production builds tree-shake it away, but dev
// breaks outright — so this stays self-contained.
export default async function call(method, args = {}) {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json; charset=utf-8',
    'X-Frappe-Site-Name': window.location.hostname,
  }

  if (window.csrf_token && window.csrf_token !== '{{ csrf_token }}') {
    headers['X-Frappe-CSRF-Token'] = window.csrf_token
  }

  const path = method.startsWith('/') ? method : `/api/method/${method}`
  const res = await fetch(path, {
    method: 'POST',
    headers,
    body: JSON.stringify(args),
  })

  if (!res.ok) {
    let serverError = {}
    try {
      serverError = await res.json()
    } catch {
      // response wasn't JSON, fall through with the empty object
    }
    const messages = serverError._server_messages
      ? JSON.parse(serverError._server_messages)
          .map((m) => {
            try {
              return JSON.parse(m).message
            } catch {
              return m
            }
          })
          .filter(Boolean)
      : []
    const error = new Error(
      messages[0] || serverError._error_message || serverError.exc_type || 'Request failed'
    )
    error.status = res.status
    error.messages = messages
    throw error
  }

  const data = await res.json()
  return method === 'login' ? data : data.message
}
