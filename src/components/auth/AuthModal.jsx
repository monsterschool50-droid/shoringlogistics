import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth.js'

const INITIAL_FORM = {
  login: '',
  password: '',
  confirmPassword: '',
}

export default function AuthModal({ open, onClose, onSuccess }) {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(INITIAL_FORM)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose, open])

  useEffect(() => {
    if (!open) return

    setError('')
    setBusy(false)
    setForm(INITIAL_FORM)
    setMode('login')
  }, [open])

  if (!open) return null

  const submitLabel = mode === 'login' ? 'Войти' : 'Зарегистрироваться'

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (mode === 'register' && form.password !== form.confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    setBusy(true)

    try {
      const payload = {
        login: form.login,
        password: form.password,
      }

      if (mode === 'login') {
        await login(payload)
      } else {
        await register(payload)
      }

      onSuccess?.()
      onClose?.()
    } catch (submitError) {
      setError(submitError.message || 'Ошибка авторизации')
    } finally {
      setBusy(false)
    }
  }

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  return (
    <div
      className="auth-modal-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.()
        }
      }}
      role="presentation"
    >
      <div className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
        <div className="auth-modal-header">
          <div>
            <p className="auth-modal-eyebrow">Личный кабинет</p>
            <h2 className="auth-modal-title" id="auth-modal-title">
              {mode === 'login' ? 'Вход' : 'Регистрация'}
            </h2>
          </div>
          <button className="auth-modal-close" onClick={onClose} type="button" aria-label="Закрыть">
            ×
          </button>
        </div>

        <div className="auth-modal-tabs">
          <button
            className={`auth-modal-tab${mode === 'login' ? ' auth-modal-tab-active' : ''}`}
            onClick={() => {
              setMode('login')
              setError('')
            }}
            type="button"
          >
            Вход
          </button>
          <button
            className={`auth-modal-tab${mode === 'register' ? ' auth-modal-tab-active' : ''}`}
            onClick={() => {
              setMode('register')
              setError('')
            }}
            type="button"
          >
            Регистрация
          </button>
        </div>

        <form className="auth-modal-form" onSubmit={handleSubmit}>
          <label className="auth-modal-field">
            <span>Логин</span>
            <input
              autoFocus
              className="auth-modal-input"
              type="text"
              value={form.login}
              onChange={(event) => updateField('login', event.target.value)}
              placeholder="Например, manager_01"
              autoComplete={mode === 'login' ? 'username' : 'new-username'}
              disabled={busy}
            />
          </label>

          <label className="auth-modal-field">
            <span>Пароль</span>
            <input
              className="auth-modal-input"
              type="password"
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              placeholder="Минимум 6 символов"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              disabled={busy}
            />
          </label>

          {mode === 'register' && (
            <label className="auth-modal-field">
              <span>Повторите пароль</span>
              <input
                className="auth-modal-input"
                type="password"
                value={form.confirmPassword}
                onChange={(event) => updateField('confirmPassword', event.target.value)}
                placeholder="Введите пароль ещё раз"
                autoComplete="new-password"
                disabled={busy}
              />
            </label>
          )}

          <p className="auth-modal-hint">
            Логин: 3-32 символа. Разрешены буквы, цифры, точка, подчёркивание и дефис.
          </p>

          {error && <div className="auth-modal-error">{error}</div>}

          <button className="auth-modal-submit" type="submit" disabled={busy}>
            {busy ? 'Подождите...' : submitLabel}
          </button>
        </form>
      </div>
    </div>
  )
}
