// Central place for talking to the API. The base URL comes from the Vite env
// (VITE_API_URL); every request sends credentials so the httpOnly auth cookie
// rides along on cross-origin calls.
export const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    credentials: 'include', // send the auth cookie
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    let message = 'Something went wrong'
    try {
      message = (await res.json()).error || message
    } catch {
      /* response had no JSON body */
    }
    const err = new Error(message)
    err.status = res.status
    throw err
  }

  if (res.status === 204) return null
  return res.json()
}

// Upload a single file to the API, which streams it to Cloudinary and returns
// { url, type }. Sent as multipart/form-data, so we do not set Content-Type
// (the browser adds the boundary). The cookie still rides along.
async function uploadFile(file) {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${API}/api/upload`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  })
  if (!res.ok) {
    let message = 'Upload failed'
    try {
      message = (await res.json()).error || message
    } catch {
      /* no JSON body */
    }
    throw new Error(message)
  }
  return res.json()
}

export const api = {
  // uploads
  upload: uploadFile,

  // auth
  signup: (data) => request('/api/auth/signup', { method: 'POST', body: data }),
  login: (data) => request('/api/auth/login', { method: 'POST', body: data }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  me: () => request('/api/auth/me'),
  updateProfile: (data) => request('/api/auth/me', { method: 'PUT', body: data }),

  // apartments
  apartments: () => request('/api/apartments'),
  apartment: (id) => request(`/api/apartments/${id}`),
  addReview: (aptId, data) =>
    request(`/api/apartments/${aptId}/reviews`, { method: 'POST', body: data }),

  // reviews
  review: (id) => request(`/api/reviews/${id}`),
  updateReview: (id, data) =>
    request(`/api/reviews/${id}`, { method: 'PUT', body: data }),
  deleteReview: (id) => request(`/api/reviews/${id}`, { method: 'DELETE' }),
}

// Ask Cloudinary for a smaller, modern-format version by editing the URL. Only
// touches Cloudinary URLs; anything else is returned unchanged.
export function optimized(url, width = 500) {
  if (!url || !url.includes('/upload/')) return url
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`)
}
