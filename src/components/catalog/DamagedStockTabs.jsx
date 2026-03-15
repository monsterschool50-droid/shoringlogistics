import { Link } from 'react-router-dom'

export default function DamagedStockTabs({ active = 'cars' }) {
  return (
    <div className="damaged-tabs" role="tablist" aria-label="Раздел битых авто и запчастей">
      <Link
        to="/damaged-stock"
        className={`damaged-tab${active === 'cars' ? ' is-active' : ''}`}
        role="tab"
        aria-selected={active === 'cars'}
      >
        Битые авто
      </Link>
      <Link
        to="/damaged-stock/parts"
        className={`damaged-tab damaged-tab-parts${active === 'parts' ? ' is-active' : ''}`}
        role="tab"
        aria-selected={active === 'parts'}
      >
        Запчасти
      </Link>
    </div>
  )
}
