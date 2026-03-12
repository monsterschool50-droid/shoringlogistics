export const CAR_LISTING_TYPES = {
  main: 'main',
  urgent: 'urgent',
  damaged: 'damaged',
}

export const CAR_LISTING_TYPE_VALUES = Object.freeze(Object.values(CAR_LISTING_TYPES))

const CAR_LISTING_TYPE_ALIASES = {
  [CAR_LISTING_TYPES.main]: CAR_LISTING_TYPES.main,
  default: CAR_LISTING_TYPES.main,
  catalog: CAR_LISTING_TYPES.main,
  base: CAR_LISTING_TYPES.main,
  [CAR_LISTING_TYPES.urgent]: CAR_LISTING_TYPES.urgent,
  urgent_sale: CAR_LISTING_TYPES.urgent,
  'urgent-sale': CAR_LISTING_TYPES.urgent,
  sale: CAR_LISTING_TYPES.urgent,
  [CAR_LISTING_TYPES.damaged]: CAR_LISTING_TYPES.damaged,
  damaged_car: CAR_LISTING_TYPES.damaged,
  'damaged-car': CAR_LISTING_TYPES.damaged,
  broken: CAR_LISTING_TYPES.damaged,
  salvage: CAR_LISTING_TYPES.damaged,
}

export function normalizeCarListingType(value, fallback = CAR_LISTING_TYPES.main) {
  const normalized = String(value || '').trim().toLowerCase()
  if (!normalized) return fallback
  return CAR_LISTING_TYPE_ALIASES[normalized] || fallback
}
