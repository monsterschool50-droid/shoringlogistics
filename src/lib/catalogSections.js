import { CAR_LISTING_TYPES } from '../../shared/catalogTypes.js'

export const CAR_SECTION_CONFIG = {
  [CAR_LISTING_TYPES.main]: {
    id: CAR_LISTING_TYPES.main,
    listingType: CAR_LISTING_TYPES.main,
    navLabel: 'Каталог',
    path: '/catalog',
    title: 'Каталог автомобилей из Кореи',
    subtitle: 'Основной каталог машин с Encar и локальными объявлениями.',
    breadcrumbLabel: 'Каталог',
    resultsHeading: 'Доступные автомобили',
    emptyMessage: 'Автомобили не найдены. Измените фильтры.',
    loadingMessage: 'Загрузка автомобилей...',
    cardBadgeLabel: '',
    heroTone: 'main',
  },
  [CAR_LISTING_TYPES.urgent]: {
    id: CAR_LISTING_TYPES.urgent,
    listingType: CAR_LISTING_TYPES.urgent,
    navLabel: 'Срочная продажа',
    path: '/urgent-sale',
    title: 'Срочная продажа',
    subtitle: 'Отдельный каталог быстрых предложений с полной карточкой автомобиля.',
    breadcrumbLabel: 'Срочная продажа',
    resultsHeading: 'Срочные предложения',
    emptyMessage: 'Срочных предложений пока нет. Проверьте позже или измените фильтры.',
    loadingMessage: 'Загрузка срочных предложений...',
    cardBadgeLabel: 'Срочная продажа',
    heroTone: 'urgent',
  },
  [CAR_LISTING_TYPES.damaged]: {
    id: CAR_LISTING_TYPES.damaged,
    listingType: CAR_LISTING_TYPES.damaged,
    navLabel: 'Битые авто',
    path: '/damaged-stock',
    title: 'Битые авто',
    subtitle: 'Автомобили после повреждений с полной карточкой и техническими параметрами.',
    breadcrumbLabel: 'Битые авто',
    resultsHeading: 'Битые авто',
    emptyMessage: 'Битых авто пока нет. Проверьте позже или измените фильтры.',
    loadingMessage: 'Загрузка битых авто...',
    cardBadgeLabel: 'Битое авто',
    heroTone: 'damaged',
  },
}

export const PARTS_SECTION_CONFIG = {
  id: 'parts',
  navLabel: 'Запчасти',
  path: '/damaged-stock/parts',
  title: 'Запчасти',
  subtitle: 'Каталог деталей с отдельными карточками, фото и привязкой к моделям.',
  breadcrumbLabel: 'Запчасти',
}

export function buildCarDetailsPath(section, id) {
  return `${section.path}/${id}`
}

export function buildPartDetailsPath(id) {
  return `${PARTS_SECTION_CONFIG.path}/${id}`
}

export function getCarSectionByPath(pathname) {
  const path = String(pathname || '')
  if (path.startsWith(PARTS_SECTION_CONFIG.path)) return CAR_SECTION_CONFIG[CAR_LISTING_TYPES.damaged]
  if (path.startsWith(CAR_SECTION_CONFIG[CAR_LISTING_TYPES.urgent].path)) return CAR_SECTION_CONFIG[CAR_LISTING_TYPES.urgent]
  if (path.startsWith(CAR_SECTION_CONFIG[CAR_LISTING_TYPES.damaged].path)) return CAR_SECTION_CONFIG[CAR_LISTING_TYPES.damaged]
  return CAR_SECTION_CONFIG[CAR_LISTING_TYPES.main]
}

export function getSearchTargetPath(pathname) {
  const section = getCarSectionByPath(pathname)
  if (String(pathname || '').startsWith(PARTS_SECTION_CONFIG.path)) {
    return PARTS_SECTION_CONFIG.path
  }
  return section.path
}

export function isCatalogLikePath(pathname) {
  const path = String(pathname || '')
  return (
    path.startsWith('/catalog') ||
    path.startsWith('/urgent-sale') ||
    path.startsWith('/damaged-stock')
  )
}
