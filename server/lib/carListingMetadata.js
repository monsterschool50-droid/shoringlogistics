import pool from '../db.js'

let ensureCarListingMetadataColumnsPromise = null

export async function ensureCarListingMetadataColumns() {
  if (!ensureCarListingMetadataColumnsPromise) {
    ensureCarListingMetadataColumnsPromise = (async () => {
      await pool.query(`ALTER TABLE cars ADD COLUMN IF NOT EXISTS detail_flags JSONB NOT NULL DEFAULT '{}'::jsonb`)
      await pool.query(`ALTER TABLE cars ADD COLUMN IF NOT EXISTS inspection_formats TEXT[] NOT NULL DEFAULT '{}'::text[]`)
    })().catch((error) => {
      ensureCarListingMetadataColumnsPromise = null
      throw error
    })
  }

  return ensureCarListingMetadataColumnsPromise
}

export function normalizeDetailFlags(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

export function buildStoredDetailFlags(value) {
  return {
    ...normalizeDetailFlags(value),
    metaReady: true,
  }
}

export function normalizeInspectionFormats(value) {
  return Array.isArray(value)
    ? value.map((item) => String(item || '').trim()).filter(Boolean)
    : []
}
