import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On first load, ask the API who we are. The cookie rides along, so a logged
  // in user stays logged in across refreshes.
  useEffect(() => {
    api
      .me()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    const data = await api.login({ email, password })
    setUser(data.user)
    return data.user
  }

  async function signup(name, email, password) {
    const data = await api.signup({ name, email, password })
    setUser(data.user)
    return data.user
  }

  async function logout() {
    try {
      await api.logout()
    } catch {
      /* clearing the cookie failed server-side; drop the user locally anyway */
    }
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, setUser, login, signup, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
