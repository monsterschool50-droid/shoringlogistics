import { useEffect, useState } from 'react'
import { AuthContext } from './auth-context.js'

const AUTH_TOKEN_STORAGE_KEY = 'tlv-auth-token'

function readStoredToken() {
  if (typeof window === 'undefined') return ''
  return String(window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || '')
}

function persistToken(token) {
  if (typeof window === 'undefined') return

  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
    return
  }

  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
}

async function readJsonResponse(response) {
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload?.error || 'Ошибка авторизации')
  }

  return payload
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => readStoredToken())
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(() => Boolean(readStoredToken()))

  useEffect(() => {
    let active = true

    if (!token) {
      return () => {
        active = false
      }
    }

    fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(readJsonResponse)
      .then((payload) => {
        if (!active) return
        setUser(payload.user || null)
        setIsLoading(false)
      })
      .catch(() => {
        if (!active) return
        persistToken('')
        setToken('')
        setUser(null)
        setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [token])

  async function authenticate(path, credentials) {
    const response = await fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    const payload = await readJsonResponse(response)
    const nextToken = String(payload?.token || '')

    persistToken(nextToken)
    setToken(nextToken)
    setUser(payload?.user || null)
    setIsLoading(false)

    return payload?.user || null
  }

  async function login(credentials) {
    return authenticate('/api/auth/login', credentials)
  }

  async function register(credentials) {
    return authenticate('/api/auth/register', credentials)
  }

  async function logout() {
    const currentToken = token

    persistToken('')
    setToken('')
    setUser(null)
    setIsLoading(false)

    if (!currentToken) return

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      })
    } catch {
      // Ignore network errors during logout, local session is already cleared.
    }
  }

  return (
    <AuthContext.Provider value={{
      isAuthenticated: Boolean(user && token),
      isLoading,
      login,
      logout,
      register,
      token,
      user,
    }}
    >
      {children}
    </AuthContext.Provider>
  )
}
