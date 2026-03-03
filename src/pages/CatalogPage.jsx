import { useState } from 'react'
import { Link } from 'react-router-dom'
import FilterSidebar from '../components/catalog/FilterSidebar'
import CarCard from '../components/catalog/CarCard'

const HomeIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22" strokeWidth={2}/>
  </svg>
)
const ChevronRightIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="9 18 15 12 9 6" strokeWidth={2} strokeLinecap="round"/>
  </svg>
)
const FilterIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <line x1="4" y1="6" x2="20" y2="6" strokeWidth={2} strokeLinecap="round"/>
    <line x1="8" y1="12" x2="16" y2="12" strokeWidth={2} strokeLinecap="round"/>
    <line x1="11" y1="18" x2="13" y2="18" strokeWidth={2} strokeLinecap="round"/>
  </svg>
)
const SortIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>
  </svg>
)
const EncarIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" strokeWidth={2}/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8M12 8l4 4-4 4"/>
  </svg>
)
const WaGroupIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
)

const MOCK_CARS = [
  {
    id: 1,
    name: 'Jeep Cherokee 3.6 Overland',
    model: 'WK2',
    year: '2021-01',
    mileage: 128697,
    tags: ['Внедорожники и кроссоверы', 'Автомат', 'Бензин', '4WD (Полный)'],
    bodyColor: 'Черный',
    bodyColorDots: ['#1c1c1c', '#2d2d2d'],
    interiorColor: 'Серия черного цвета',
    interiorColorDots: ['#1c1c1c', '#3d3d3d'],
    location: 'Incheon',
    vin: '1C4RJFCG9MC529077',
    priceKRW: 22300000,
    priceUSD: 15712,
    commission: 300,
    delivery: 1750,
    loading: 0,
    unloading: 100,
    storage: 310,
    vatRefund: 990,
    total: 17182,
    imageCount: 20,
    canNegotiate: true,
    encarUrl: 'https://www.encar.com',
  },
  {
    id: 2,
    name: 'Hyundai Sonata 2.0 Luxury',
    model: 'DN8',
    year: '2022-03',
    mileage: 45230,
    tags: ['Седан', 'Автомат', 'Бензин', 'FWD (Передний)'],
    bodyColor: 'Серебристый',
    bodyColorDots: ['#c0c0c0', '#a8a8a8'],
    interiorColor: 'Бежевый',
    interiorColorDots: ['#d4b483', '#c4a46e'],
    location: 'Seoul',
    vin: 'KMHL14JA6PA123456',
    priceKRW: 18500000,
    priceUSD: 13028,
    commission: 300,
    delivery: 1750,
    loading: 0,
    unloading: 100,
    storage: 200,
    vatRefund: 822,
    total: 14556,
    imageCount: 15,
    canNegotiate: false,
    encarUrl: 'https://www.encar.com',
  },
  {
    id: 3,
    name: 'Kia K5 2.5 GT-Line',
    model: 'DL3',
    year: '2023-06',
    mileage: 18500,
    tags: ['Седан', 'Автомат', 'Бензин', 'FWD (Передний)'],
    bodyColor: 'Белый',
    bodyColorDots: ['#f0f0f0', '#e0e0e0'],
    interiorColor: 'Черный',
    interiorColorDots: ['#1c1c1c', '#2d2d2d'],
    location: 'Busan',
    vin: 'KNAGM4A73P5234567',
    priceKRW: 25800000,
    priceUSD: 18169,
    commission: 300,
    delivery: 1750,
    loading: 0,
    unloading: 100,
    storage: 150,
    vatRefund: 1145,
    total: 19324,
    imageCount: 18,
    canNegotiate: true,
    encarUrl: 'https://www.encar.com',
  },
]

export default function CatalogPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sort, setSort] = useState('newest')

  return (
    <div className="catalog-page">

      {/* Breadcrumb */}
      <div className="cat-breadcrumb">
        <div className="cat-breadcrumb-inner">
          <Link to="/" className="cat-bc-link">
            <HomeIcon /> Главная
          </Link>
          <span className="cat-bc-sep"><ChevronRightIcon /></span>
          <span className="cat-bc-current">Каталог</span>
        </div>
      </div>

      <div className="cat-layout">

        {/* Sidebar — desktop always visible, mobile toggled */}
        <aside className={`cat-sidebar${sidebarOpen ? ' cat-sidebar-open' : ''}`}>
          <FilterSidebar onClose={() => setSidebarOpen(false)} />
        </aside>

        {/* Overlay behind mobile sidebar */}
        {sidebarOpen && (
          <div className="cat-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main content */}
        <main className="cat-main">

          {/* Mobile filter button */}
          <button className="cat-filter-btn" onClick={() => setSidebarOpen(true)}>
            <FilterIcon /> Фильтры
          </button>

          {/* Top action buttons */}
          <div className="cat-top-btns">
            <a href="https://www.encar.com" target="_blank" rel="noreferrer" className="btn-encar">
              <EncarIcon /> Encar
            </a>
            <a href="#" className="btn-wa-group">
              <WaGroupIcon /> WhatsApp группы
            </a>
          </div>

          {/* Title */}
          <h1 className="cat-title">Каталог автомобилей — Корея</h1>
          <p className="cat-subtitle">Список машин с Encar (переводы ru/en/ko)</p>

          {/* Results bar */}
          <div className="cat-results-bar">
            <div>
              <div className="cat-results-heading">Доступные автомобили</div>
              <div className="cat-results-count">Найдено: 76 211 • Показано: 50</div>
            </div>
            <div className="cat-sort-wrap">
              <SortIcon />
              <select
                className="cat-sort"
                value={sort}
                onChange={e => setSort(e.target.value)}
              >
                <option value="newest">Новые объявления</option>
                <option value="price_asc">Цена ↑</option>
                <option value="price_desc">Цена ↓</option>
                <option value="mileage_asc">Пробег ↑</option>
                <option value="year_desc">Год ↓</option>
              </select>
            </div>
          </div>

          {/* Car list */}
          <div className="cars-list">
            {MOCK_CARS.map(car => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>

        </main>
      </div>
    </div>
  )
}
