import { Router } from 'express'
import pool from '../db.js'
import {
  createSessionExpiryDate,
  createSessionToken,
  extractBearerToken,
  hashPassword,
  hashSessionToken,
  normalizeAuthLogin,
  validateAuthLogin,
  validateAuthPassword,
  verifyPassword,
} from '../lib/auth.js'

const router = Router()

function toAuthUser(row) {
  if (!row) return null

  return {
    id: row.id,
    login: row.login,
    created_at: row.created_at,
  }
}

async function cleanupExpiredSessions() {
  await pool.query('DELETE FROM app_user_sessions WHERE expires_at <= NOW()')
}

async function createUserSession(userId) {
  const token = createSessionToken()
  const tokenHash = hashSessionToken(token)
  const expiresAt = createSessionExpiryDate()

  await pool.query(
    `INSERT INTO app_user_sessions (
       user_id,
       token_hash,
       expires_at,
       created_at,
       last_used_at
     )
     VALUES ($1, $2, $3, NOW(), NOW())`,
    [userId, tokenHash, expiresAt],
  )

  return {
    token,
    expires_at: expiresAt.toISOString(),
  }
}

async function findUserSession(token) {
  const tokenHash = hashSessionToken(token)
  const result = await pool.query(
    `SELECT
       u.id,
       u.login,
       u.created_at,
       s.id AS session_id,
       s.expires_at
     FROM app_user_sessions s
     JOIN app_users u ON u.id = s.user_id
     WHERE s.token_hash = $1
       AND s.expires_at > NOW()
     LIMIT 1`,
    [tokenHash],
  )

  const row = result.rows[0] || null
  if (!row) return null

  await pool.query(
    'UPDATE app_user_sessions SET last_used_at = NOW() WHERE id = $1',
    [row.session_id],
  )

  return row
}

router.post('/register', async (req, res) => {
  const login = normalizeAuthLogin(req.body?.login)
  const password = String(req.body?.password || '')

  const loginError = validateAuthLogin(login)
  if (loginError) {
    return res.status(400).json({ ok: false, error: loginError })
  }

  const passwordError = validateAuthPassword(password)
  if (passwordError) {
    return res.status(400).json({ ok: false, error: passwordError })
  }

  try {
    await cleanupExpiredSessions()
    const passwordHash = await hashPassword(password)
    const userResult = await pool.query(
      `INSERT INTO app_users (
         login,
         password_hash,
         created_at,
         updated_at
       )
       VALUES ($1, $2, NOW(), NOW())
       RETURNING id, login, created_at`,
      [login, passwordHash],
    )

    const user = userResult.rows[0]
    const session = await createUserSession(user.id)

    return res.status(201).json({
      ok: true,
      user: toAuthUser(user),
      token: session.token,
      expires_at: session.expires_at,
    })
  } catch (error) {
    if (error?.code === '23505') {
      return res.status(409).json({
        ok: false,
        error: 'Пользователь с таким логином уже существует',
      })
    }

    console.error('AUTH_REGISTER_ERROR |', error?.message || error)
    return res.status(500).json({ ok: false, error: 'Не удалось зарегистрировать пользователя' })
  }
})

router.post('/login', async (req, res) => {
  const login = normalizeAuthLogin(req.body?.login)
  const password = String(req.body?.password || '')

  const loginError = validateAuthLogin(login)
  if (loginError) {
    return res.status(400).json({ ok: false, error: loginError })
  }

  const passwordError = validateAuthPassword(password)
  if (passwordError) {
    return res.status(400).json({ ok: false, error: passwordError })
  }

  try {
    await cleanupExpiredSessions()
    const userResult = await pool.query(
      `SELECT id, login, password_hash, created_at
       FROM app_users
       WHERE login = $1
       LIMIT 1`,
      [login],
    )

    const user = userResult.rows[0] || null
    if (!user) {
      return res.status(401).json({ ok: false, error: 'Неверный логин или пароль' })
    }

    const passwordMatches = await verifyPassword(password, user.password_hash)
    if (!passwordMatches) {
      return res.status(401).json({ ok: false, error: 'Неверный логин или пароль' })
    }

    const session = await createUserSession(user.id)

    return res.json({
      ok: true,
      user: toAuthUser(user),
      token: session.token,
      expires_at: session.expires_at,
    })
  } catch (error) {
    console.error('AUTH_LOGIN_ERROR |', error?.message || error)
    return res.status(500).json({ ok: false, error: 'Не удалось выполнить вход' })
  }
})

router.get('/me', async (req, res) => {
  const token = extractBearerToken(req)
  if (!token) {
    return res.status(401).json({ ok: false, error: 'Требуется авторизация' })
  }

  try {
    await cleanupExpiredSessions()
    const session = await findUserSession(token)
    if (!session) {
      return res.status(401).json({ ok: false, error: 'Сессия истекла или не найдена' })
    }

    return res.json({
      ok: true,
      user: toAuthUser(session),
      expires_at: session.expires_at,
    })
  } catch (error) {
    console.error('AUTH_ME_ERROR |', error?.message || error)
    return res.status(500).json({ ok: false, error: 'Не удалось получить профиль' })
  }
})

router.post('/logout', async (req, res) => {
  const token = extractBearerToken(req)
  if (!token) {
    return res.json({ ok: true })
  }

  try {
    await pool.query('DELETE FROM app_user_sessions WHERE token_hash = $1', [hashSessionToken(token)])
    return res.json({ ok: true })
  } catch (error) {
    console.error('AUTH_LOGOUT_ERROR |', error?.message || error)
    return res.status(500).json({ ok: false, error: 'Не удалось завершить сессию' })
  }
})

export default router
