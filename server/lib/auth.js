import crypto from 'crypto'
import { Buffer } from 'buffer'

const PASSWORD_KEY_LENGTH = 64
const SESSION_TOKEN_BYTES = 32
const SESSION_TTL_DAYS = (() => {
  const parsed = Number.parseInt(globalThis.process?.env?.AUTH_SESSION_TTL_DAYS || '30', 10)
  if (!Number.isFinite(parsed)) return 30
  return Math.min(Math.max(parsed, 1), 365)
})()

const LOGIN_RE = /^[a-zA-Z0-9._-]{3,32}$/

function scryptAsync(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, PASSWORD_KEY_LENGTH, (error, derivedKey) => {
      if (error) {
        reject(error)
        return
      }

      resolve(derivedKey)
    })
  })
}

export function normalizeAuthLogin(value) {
  return String(value || '').trim().toLowerCase()
}

export function validateAuthLogin(login) {
  const normalized = normalizeAuthLogin(login)
  if (!normalized) return 'Введите логин'
  if (!LOGIN_RE.test(normalized)) {
    return 'Логин: 3-32 символа, только буквы, цифры, ".", "_" и "-"'
  }
  return ''
}

export function validateAuthPassword(password) {
  const raw = String(password || '')
  if (!raw) return 'Введите пароль'
  if (raw.length < 6) return 'Пароль должен быть не короче 6 символов'
  if (raw.length > 128) return 'Пароль слишком длинный'
  return ''
}

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const derivedKey = await scryptAsync(String(password || ''), salt)
  return `scrypt:${salt}:${derivedKey.toString('hex')}`
}

export async function verifyPassword(password, passwordHash) {
  const rawHash = String(passwordHash || '')
  const [scheme, salt, storedHash] = rawHash.split(':')
  if (scheme !== 'scrypt' || !salt || !storedHash) return false

  const derivedKey = await scryptAsync(String(password || ''), salt)
  const storedBuffer = Buffer.from(storedHash, 'hex')
  if (storedBuffer.length !== derivedKey.length) return false

  return crypto.timingSafeEqual(storedBuffer, derivedKey)
}

export function createSessionToken() {
  return crypto.randomBytes(SESSION_TOKEN_BYTES).toString('hex')
}

export function hashSessionToken(token) {
  return crypto.createHash('sha256').update(String(token || '')).digest('hex')
}

export function createSessionExpiryDate() {
  return new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000)
}

export function extractBearerToken(req) {
  const authHeader = String(req.get('authorization') || '').trim()
  if (!authHeader.toLowerCase().startsWith('bearer ')) return ''
  return authHeader.slice(7).trim()
}
