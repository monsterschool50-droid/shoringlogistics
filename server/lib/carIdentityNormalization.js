import { normalizeDrive } from './vehicleData.js'

const CANONICAL_DRIVE_TYPES = new Set([
  'Передний (FWD)',
  'Задний (RWD)',
  'Полный (AWD)',
  'Полный (4WD)',
])

const BRAND_RULES = Object.freeze([
  {
    brand: 'Honda',
    matcher: /\bHonda\b/i,
    replacements: [
      [/\bTueoring\b/gi, 'Touring'],
    ],
  },
  {
    brand: 'BMW',
    matcher: /\bBMW\b/i,
    replacements: [
      [/\bTueoring\b/gi, 'Touring'],
      [/\bOnrain\b/gi, 'Online'],
      [/\bxDrive\s+(\d{2,3}[A-Za-z]?)\b/g, 'xDrive$1'],
    ],
  },
  {
    brand: 'Chevrolet',
    matcher: /\bChevrolet\b/i,
    replacements: [
      [/\bPeurimi(?:eo|o)\b/gi, 'Premiere'],
    ],
  },
  {
    brand: 'Hyundai',
    matcher: /\bHyundai\b/i,
    replacements: [
      [/\bSantafe\b/gi, 'Santa Fe'],
    ],
  },
  {
    brand: 'Kia',
    matcher: /\bKia\b/i,
    replacements: [],
  },
])

const HONDA_ACCORD_HYBRID_TOURING_RE = /\bAccord\b.*\bHybrid\b.*\bTouring\b|\bTouring\b.*\bHybrid\b.*\bAccord\b/i
const HONDA_CRV_RE = /\bCR[\s-]?V\b/i
const HONDA_CRV_2WD_RE = /\b2WD\b/i
const BMW_IX3_RE = /\biX3\b/i
const KIA_CARNIVAL_RE = /\bCarnival\b/i
const KIA_CARNIVAL_FWD_HINT_RE = /\b(?:Gasoline|HEV|Signature|Noblesse|Prestige|Luxury|Gravity)\b|\bX\s*Line\b|\bHi[-\s]*Limousine\b|\b(?:4|7|9|11)\s*seats?\b/i
const HYUNDAI_INSPIRATION_RE = /\bInspiration\b/i
const HYUNDAI_INSPIRE_RE = /\bInspire\b/gi

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function normalizeNullableText(value, normalizer) {
  if (value === undefined) return undefined
  if (value === null) return null
  return normalizer(cleanText(value))
}

function detectBrand(...values) {
  const text = values.map((value) => cleanText(value)).filter(Boolean).join(' ')
  if (!text) return ''

  for (const rule of BRAND_RULES) {
    if (rule.matcher.test(text)) return rule.brand
  }

  return ''
}

function applyBrandReplacements(value, brand) {
  const text = cleanText(value)
  if (!text || !brand) return text

  const rule = BRAND_RULES.find((entry) => entry.brand === brand)
  if (!rule?.replacements?.length) return text

  return rule.replacements.reduce(
    (current, [pattern, replacement]) => current.replace(pattern, replacement),
    text,
  ).replace(/\s+/g, ' ').trim()
}

function normalizeTrimWithContext(value, brand, name, model) {
  const normalized = applyBrandReplacements(value, brand)
  if (!normalized || brand !== 'Hyundai') return normalized

  const hasInspirationContext = HYUNDAI_INSPIRATION_RE.test(cleanText(name)) || HYUNDAI_INSPIRATION_RE.test(cleanText(model))
  if (!hasInspirationContext) return normalized

  return normalized.replace(HYUNDAI_INSPIRE_RE, 'Inspiration')
}

function resolveIdentityDrive({ brand, name, model, trim_level, drive_type }) {
  const currentDrive = cleanText(drive_type)
  if (CANONICAL_DRIVE_TYPES.has(currentDrive)) return currentDrive

  const normalizedCurrentDrive = normalizeDrive(currentDrive)
  if (CANONICAL_DRIVE_TYPES.has(normalizedCurrentDrive)) return normalizedCurrentDrive

  const combined = [name, model, trim_level].map((value) => cleanText(value)).filter(Boolean).join(' ')
  if (!combined) return drive_type

  if (brand === 'Honda' && HONDA_ACCORD_HYBRID_TOURING_RE.test(combined)) {
    return 'Передний (FWD)'
  }

  if (brand === 'Honda' && HONDA_CRV_RE.test(combined) && HONDA_CRV_2WD_RE.test(combined)) {
    return 'Передний (FWD)'
  }

  if (brand === 'BMW' && BMW_IX3_RE.test(combined)) {
    return 'Задний (RWD)'
  }

  if (brand === 'Kia' && KIA_CARNIVAL_RE.test(combined) && KIA_CARNIVAL_FWD_HINT_RE.test(combined)) {
    return 'Передний (FWD)'
  }

  return drive_type
}

export function normalizeCarIdentityFields(input = {}) {
  const brand = detectBrand(input.name, input.model, input.trim_level)
  const name = normalizeNullableText(input.name, (value) => applyBrandReplacements(value, brand))
  const model = normalizeNullableText(input.model, (value) => applyBrandReplacements(value, brand))
  const trim_level = normalizeNullableText(input.trim_level, (value) => normalizeTrimWithContext(value, brand, name ?? input.name, model ?? input.model))

  return {
    name,
    model,
    trim_level,
    drive_type: resolveIdentityDrive({
      brand,
      name: name ?? input.name,
      model: model ?? input.model,
      trim_level: trim_level ?? input.trim_level,
      drive_type: input.drive_type,
    }),
  }
}
