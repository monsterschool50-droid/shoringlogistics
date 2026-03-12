import { applyTrimFixes, applyVehicleTitleFixes } from '../../shared/vehicleTextFixes.js'
import {
  extractTrimLevelFromTitle,
  inferDrive,
  normalizeColorName,
  normalizeDrive,
  normalizeInteriorColorName,
  normalizeLocationName,
  normalizeText,
  resolveBodyType,
  resolveVehicleClass,
  normalizeTrimLevel,
} from './vehicleData.js'
import { normalizeCarIdentityFields } from './carIdentityNormalization.js'

function normalizeNullableText(value, normalizer) {
  if (value === undefined) return undefined
  if (value === null) return null
  return normalizer(value)
}

export function normalizeCarTextFields(input = {}) {
  const normalizedName = normalizeNullableText(input.name, (value) => applyVehicleTitleFixes(normalizeText(value)))
  const normalizedModel = normalizeNullableText(input.model, (value) => applyVehicleTitleFixes(normalizeText(value)))
  const bodyColor = normalizeNullableText(input.body_color, (value) => normalizeColorName(value))
  const bodyColorForInterior = bodyColor === undefined ? (input.body_color ?? '') : (bodyColor ?? '')
  const rawTrimValue = input.trim_level
  const normalizedDirectTrim =
    (rawTrimValue === undefined || rawTrimValue === null
      ? ''
      : normalizeTrimLevel(rawTrimValue) || applyTrimFixes(rawTrimValue))
  const derivedTrim =
    extractTrimLevelFromTitle(
      normalizedName ?? input.name,
      normalizedModel ?? input.model,
      input.name,
      input.model,
    )
  const trimCandidate = normalizedDirectTrim || derivedTrim
  const normalizedTrim = trimCandidate || (rawTrimValue === null ? null : rawTrimValue === undefined ? undefined : '')
  const driveSource = input.drive_type
  const normalizedDriveValue = driveSource === undefined
    ? undefined
    : (normalizeDrive(driveSource) || inferDrive(
      driveSource,
      normalizedTrim ?? rawTrimValue ?? '',
      normalizedName ?? input.name ?? '',
      normalizedModel ?? input.model ?? '',
      input.tags ?? [],
    ))
  const identityNormalized = normalizeCarIdentityFields({
    name: normalizedName,
    model: normalizedModel,
    trim_level: normalizedTrim,
    drive_type: normalizedDriveValue,
  })
  const finalName = identityNormalized.name ?? normalizedName
  const finalModel = identityNormalized.model ?? normalizedModel
  const finalTrim = identityNormalized.trim_level ?? normalizedTrim
  const finalDrive = identityNormalized.drive_type === undefined ? normalizedDriveValue : identityNormalized.drive_type
  const normalizedBodyType = resolveBodyType(
    input.body_type ?? '',
    finalName ?? input.name ?? '',
    finalModel ?? input.model ?? '',
    finalTrim ?? rawTrimValue ?? '',
    input.name ?? '',
    input.model ?? '',
  )
  const normalizedVehicleClass = resolveVehicleClass(
    input.vehicle_class ?? '',
    input.body_type ?? normalizedBodyType ?? '',
    finalName ?? input.name ?? '',
    finalModel ?? input.model ?? '',
    finalTrim ?? rawTrimValue ?? '',
    input.name ?? '',
    input.model ?? '',
  )

  return {
    name: finalName,
    model: finalModel,
    drive_type: finalDrive,
    body_type: normalizedBodyType,
    vehicle_class: normalizedVehicleClass,
    trim_level: finalTrim,
    body_color: bodyColor,
    interior_color: normalizeNullableText(input.interior_color, (value) => normalizeInteriorColorName(value, bodyColorForInterior, { allowBodyDuplicate: true })),
    location: normalizeNullableText(input.location, (value) => normalizeLocationName(value)),
  }
}

export function diffNormalizedCarTextFields(input = {}) {
  const normalized = normalizeCarTextFields(input)
  const changes = {}

  for (const [field, after] of Object.entries(normalized)) {
    if (after === undefined) continue

    const before = input[field]
    if (before === after) continue

    changes[field] = { before, after }
  }

  return {
    normalized,
    changes,
    changedFields: Object.keys(changes),
  }
}
