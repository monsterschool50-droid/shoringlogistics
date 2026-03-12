import crypto from 'crypto'

const ENV = globalThis.process?.env || {}
const DEFAULT_DEV_ADMIN_PASSWORD = 'admin123'
const ADMIN_SESSION_TTL_MS = 24 * 60 * 60 * 1000
export const ADMIN_SESSION_HEADER = 'x-admin-session'
export const ADMIN_SESSION_QUERY_PARAM = 'admin_token'

let hasWarnedAboutFallbackPassword = false
let hasWarnedAboutMissingPassword = false

function getAdminPasswordConfig() {
  const configuredPassword = String(ENV.ADMIN_PASSWORD || '').trim()
  if (configuredPassword) {
    return { password: configuredPassword, source: 'env' }
  }

  if (ENV.NODE_ENV === 'production') {
    if (!hasWarnedAboutMissingPassword) {
      console.error('ADMIN_PASSWORD_MISSING | ADMIN_PASSWORD is required in production')
      hasWarnedAboutMissingPassword = true
    }
    return { password: '', source: 'missing' }
  }

  if (!hasWarnedAboutFallbackPassword) {
    console.warn('ADMIN_PASSWORD_DEV_FALLBACK | Using development fallback admin password')
    hasWarnedAboutFallbackPassword = true
  }

  return { password: DEFAULT_DEV_ADMIN_PASSWORD, source: 'development_fallback' }
}

function getAdminSessionSecret() {
  const explicitSecret = String(ENV.ADMIN_SESSION_SECRET || '').trim()
  if (explicitSecret) return explicitSecret

  const { password } = getAdminPasswordConfig()
  if (!password) return ''

  return crypto
    .createHash('sha256')
    .update(`admin-session:${password}`)
    .digest('hex')
}

function normalizeTokenPart(value) {
  return globalThis.Buffer.from(String(value || ''), 'utf8').toString('base64url')
}

function signTokenPayload(encodedPayload, secret) {
  return crypto.createHmac('sha256', secret).update(encodedPayload).digest('base64url')
}

function safeCompareText(a, b) {
  const left = crypto.createHash('sha256').update(String(a || '')).digest()
  const right = crypto.createHash('sha256').update(String(b || '')).digest()
  return crypto.timingSafeEqual(left, right)
}

export function readAdminPassword() {
  return getAdminPasswordConfig().password
}

export function isAdminPasswordConfigured() {
  return Boolean(readAdminPassword())
}

export function normalizeAdminPasswordInput(value) {
  return String(value ?? '').slice(0, 256)
}

export function verifyAdminPassword(value) {
  const password = readAdminPassword()
  if (!password) return false
  return safeCompareText(normalizeAdminPasswordInput(value), password)
}

export function createAdminSessionToken({ ttlMs = ADMIN_SESSION_TTL_MS } = {}) {
  const secret = getAdminSessionSecret()
  if (!secret) return ''

  const issuedAt = Date.now()
  const payload = {
    iat: issuedAt,
    exp: issuedAt + Math.max(60 * 1000, Number(ttlMs) || ADMIN_SESSION_TTL_MS),
    v: 1,
  }

  const encodedPayload = normalizeTokenPart(JSON.stringify(payload))
  const signature = signTokenPayload(encodedPayload, secret)
  return `${encodedPayload}.${signature}`
}

export function verifyAdminSessionToken(token) {
  const secret = getAdminSessionSecret()
  const rawToken = String(token || '').trim()
  if (!secret || !rawToken.includes('.')) return null

  const [encodedPayload, signature] = rawToken.split('.', 2)
  if (!encodedPayload || !signature) return null

  const expectedSignature = signTokenPayload(encodedPayload, secret)
  if (!safeCompareText(signature, expectedSignature)) {
    return null
  }

  try {
    const payloadText = globalThis.Buffer.from(encodedPayload, 'base64url').toString('utf8')
    const payload = JSON.parse(payloadText)
    const expiresAt = Number(payload?.exp || 0)
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      return null
    }
    return payload
  } catch {
    return null
  }
}

export function extractAdminSessionToken(req, { allowQuery = false } = {}) {
  const headerToken = String(req.get?.(ADMIN_SESSION_HEADER) || '').trim()
  if (headerToken) return headerToken

  if (!allowQuery) return ''
  return String(req.query?.[ADMIN_SESSION_QUERY_PARAM] || '').trim()
}

export function requireAdminSession({ allowQuery = false } = {}) {
  return (req, res, next) => {
    const token = extractAdminSessionToken(req, { allowQuery })
    if (!token) {
      return res.status(401).json({ error: 'Требуется авторизация администратора' })
    }

    const session = verifyAdminSessionToken(token)
    if (!session) {
      return res.status(401).json({ error: 'Сессия администратора истекла или недействительна' })
    }

    req.adminSession = session
    return next()
  }
}
