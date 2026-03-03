import { useState } from 'react'

const ChevronIcon = ({ open }) => (
  <svg
    width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"
    style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
  >
    <polyline points="6 9 12 15 18 9" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const ChevronUpSmall = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="18 15 12 9 6 15" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const ChevronDownSmall = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="6 9 12 15 18 9" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const SearchIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" strokeWidth={2}/>
    <path d="m21 21-4.35-4.35" strokeWidth={2} strokeLinecap="round"/>
  </svg>
)

const CloseIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18" strokeWidth={2} strokeLinecap="round"/>
    <line x1="6" y1="6" x2="18" y2="18" strokeWidth={2} strokeLinecap="round"/>
  </svg>
)

/* ── Data ── */

const BRANDS = [
  { name: 'Kia', count: 20054 },
  { name: 'Hyundai', count: 17342 },
  { name: 'Genesis', count: 4821 },
  { name: 'Chevrolet', count: 5234 },
  { name: 'Renault Samsung', count: 3891 },
  { name: 'Ssangyong', count: 2456 },
  { name: 'BMW', count: 1923 },
  { name: 'Mercedes-Benz', count: 1654 },
  { name: 'Audi', count: 987 },
  { name: 'Toyota', count: 876 },
  { name: 'Honda', count: 654 },
  { name: 'Volkswagen', count: 543 },
]

const DRIVE_TYPES = [
  { name: 'Передний (FWD)', count: 37104 },
  { name: 'Полный (AWD)', count: 19370 },
  { name: 'Не указан', count: 8257 },
  { name: 'Полный (4WD)', count: 8031 },
  { name: 'Задний (RWD)', count: 3449 },
]

const FUEL_TYPES = [
  { name: 'Бензин', count: 44042 },
  { name: 'Дизель', count: 18029 },
  { name: 'Бензин(гибрид)', count: 8085 },
  { name: 'Электро', count: 3759 },
  { name: 'Газ(LPG/Частное владение)', count: 2091 },
  { name: 'Водород', count: 159 },
  { name: 'Бензин+Газ(пропан)', count: 32 },
  { name: 'Другое', count: 7 },
  { name: 'Дизель(гибрид)', count: 5 },
  { name: 'Бензин+Газ(метан)', count: 1 },
]

const BODY_TYPES = [
  { name: 'Внедорожники и кроссоверы', count: 34635 },
  { name: 'Седаны среднего класса', count: 10667 },
  { name: 'Бизнес и люкс седаны', count: 10090 },
  { name: 'Седаны компакт-класса', count: 5782 },
  { name: 'Минивэны', count: 4728 },
  { name: 'Малолитражки(Кей-кары)', count: 3338 },
  { name: 'Грузовики и пикапы', count: 1802 },
  { name: 'Купе и спорткары', count: 1782 },
  { name: 'Микроавтобусы/Фургоны', count: 1751 },
  { name: 'Седаны малого класса', count: 1598 },
  { name: 'Малые фургоны (Дамас)', count: 25 },
  { name: 'Другое', count: 13 },
]

const BODY_COLORS = [
  { name: 'Белый', count: 33022, color: '#f0f0f0', border: '#d1d5db' },
  { name: 'Чёрный', count: 18226, color: '#1a1a1a' },
  { name: 'Тёмно-серый', count: 12206, color: '#4b5563' },
  { name: 'Синий', count: 4289, color: '#1d4ed8' },
  { name: 'Светло-серый', count: 1608, color: '#9ca3af' },
  { name: 'Серебристый', count: 1385, color: '#d1d5db', border: '#9ca3af' },
  { name: 'Красный', count: 1088, color: '#dc2626' },
  { name: 'Белоснежный', count: 844, color: '#fafafa', border: '#d1d5db' },
  { name: 'Зелёный', count: 580, color: '#16a34a' },
  { name: 'Бирюзовый', count: 435, color: '#0d9488' },
  { name: 'Голубой', count: 391, color: '#60a5fa' },
  { name: 'Жёлтый', count: 284, color: '#eab308' },
]

const INTERIOR_COLORS = [
  { name: 'Чёрный', count: 40823, color: '#1a1a1a' },
  { name: 'Бежевый', count: 17298, color: '#d4a96a' },
  { name: 'Оранжевый', count: 9125, color: '#f97316' },
  { name: 'Светло-серый', count: 4179, color: '#d1d5db', border: '#9ca3af' },
  { name: 'Красный', count: 1963, color: '#dc2626' },
  { name: 'Светло-серый', count: 1014, color: '#e5e7eb', border: '#9ca3af' },
  { name: 'Синий', count: 801, color: '#1d4ed8' },
  { name: 'Зелёный', count: 549, color: '#16a34a' },
]

const YEARS = Array.from({ length: 2026 - 1990 + 1 }, (_, i) => 2026 - i)

const SHOW_MORE_THRESHOLD = 5

/* ── Reusable checkbox list with expand ── */
function CheckboxList({ items, selected, onToggle }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? items : items.slice(0, SHOW_MORE_THRESHOLD)
  const hidden = items.length - SHOW_MORE_THRESHOLD

  return (
    <>
      {visible.map(({ name, count }) => (
        <label className="filter-brand-item" key={name + count}>
          <input
            type="checkbox"
            checked={selected.includes(name)}
            onChange={() => onToggle(name)}
            className="filter-checkbox"
          />
          <span className="filter-brand-name">{name}</span>
          <span className="filter-brand-count">{count.toLocaleString()}</span>
        </label>
      ))}
      {items.length > SHOW_MORE_THRESHOLD && (
        <button className="filter-show-more-btn" onClick={() => setExpanded(e => !e)}>
          {expanded
            ? <><ChevronUpSmall /> Скрыть</>
            : <><ChevronDownSmall /> Ещё {hidden}</>
          }
        </button>
      )}
    </>
  )
}

/* ── Color grid ── */
function ColorGrid({ colors, selected, onToggle, showMoreLabel }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? colors : colors.slice(0, 12)

  return (
    <>
      <div className="filter-color-grid">
        {visible.map(({ name, count, color, border }) => (
          <label
            key={name + count}
            className={`filter-color-item${selected.includes(name) ? ' selected' : ''}`}
          >
            <input
              type="checkbox"
              checked={selected.includes(name)}
              onChange={() => onToggle(name)}
              style={{ display: 'none' }}
            />
            <span
              className="filter-color-circle"
              style={{
                background: color,
                border: `2px solid ${border || color}`,
                outline: selected.includes(name) ? '2px solid #1a3c5e' : 'none',
                outlineOffset: '2px',
              }}
            />
            <span className="filter-color-name">{name}</span>
            <span className="filter-brand-count">{count.toLocaleString()}</span>
          </label>
        ))}
      </div>
      {colors.length > 12 && (
        <button className="filter-show-more-btn" onClick={() => setExpanded(e => !e)}>
          {expanded
            ? <><ChevronUpSmall /> Скрыть</>
            : <>+{colors.length - 12} {showMoreLabel || 'цветов'}</>
          }
        </button>
      )}
    </>
  )
}

/* ── Main component ── */
export default function FilterSidebar({ onClose }) {
  const [open, setOpen] = useState({
    price: true, year: true, mileage: true, brands: true,
    drive: true, characteristics: true, body: true,
    bodyColor: true, interiorColor: true,
  })
  const [brandSearch, setBrandSearch] = useState('')
  const [selected, setSelected] = useState({
    brands: [], drive: [], fuel: [], body: [], bodyColor: [], interiorColor: [],
  })

  const toggle = (key) => setOpen(s => ({ ...s, [key]: !s[key] }))

  const toggleItem = (group, name) => {
    setSelected(s => ({
      ...s,
      [group]: s[group].includes(name)
        ? s[group].filter(x => x !== name)
        : [...s[group], name],
    }))
  }

  const filteredBrands = BRANDS.filter(b =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  )

  return (
    <div className="filter-sidebar">
      <div className="filter-sidebar-hd">
        <span className="filter-sidebar-title">Фильтры</span>
        {onClose && (
          <button className="filter-close-btn" onClick={onClose} aria-label="Закрыть">
            <CloseIcon />
          </button>
        )}
      </div>

      {/* Цена */}
      <div className="filter-section">
        <button className="filter-section-hd" onClick={() => toggle('price')}>
          <span>Цена ($)</span>
          <ChevronIcon open={open.price} />
        </button>
        {open.price && (
          <div className="filter-section-body">
            <div className="filter-range">
              <div className="filter-range-col">
                <label className="filter-label">От ($)</label>
                <input type="number" className="filter-input" placeholder="775 014" />
              </div>
              <div className="filter-range-col">
                <label className="filter-label">До ($)</label>
                <input type="number" className="filter-input" placeholder="14 091 155" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Год */}
      <div className="filter-section">
        <button className="filter-section-hd" onClick={() => toggle('year')}>
          <span>Год</span>
          <ChevronIcon open={open.year} />
        </button>
        {open.year && (
          <div className="filter-section-body">
            <div className="filter-range">
              <div className="filter-range-col">
                <label className="filter-label">От</label>
                <select className="filter-select" defaultValue="2019">
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="filter-range-col">
                <label className="filter-label">До</label>
                <select className="filter-select" defaultValue="2026">
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Пробег */}
      <div className="filter-section">
        <button className="filter-section-hd" onClick={() => toggle('mileage')}>
          <span>Пробег (км)</span>
          <ChevronIcon open={open.mileage} />
        </button>
        {open.mileage && (
          <div className="filter-section-body">
            <div className="filter-range">
              <div className="filter-range-col">
                <label className="filter-label">От</label>
                <input type="number" className="filter-input" placeholder="4" />
              </div>
              <div className="filter-range-col">
                <label className="filter-label">До</label>
                <input type="number" className="filter-input" placeholder="200 000" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Марки */}
      <div className="filter-section">
        <button className="filter-section-hd" onClick={() => toggle('brands')}>
          <span>Марки</span>
          <ChevronIcon open={open.brands} />
        </button>
        {open.brands && (
          <div className="filter-section-body">
            <div className="filter-brand-search-wrap">
              <span className="filter-brand-search-icon"><SearchIcon /></span>
              <input
                type="text"
                className="filter-brand-search"
                placeholder="Поиск марки..."
                value={brandSearch}
                onChange={e => setBrandSearch(e.target.value)}
              />
            </div>
            <div className="filter-brands-list">
              <CheckboxList
                items={filteredBrands}
                selected={selected.brands}
                onToggle={name => toggleItem('brands', name)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Привод */}
      <div className="filter-section">
        <button className="filter-section-hd" onClick={() => toggle('drive')}>
          <span>Привод</span>
          <ChevronIcon open={open.drive} />
        </button>
        {open.drive && (
          <div className="filter-section-body">
            <CheckboxList
              items={DRIVE_TYPES}
              selected={selected.drive}
              onToggle={name => toggleItem('drive', name)}
            />
          </div>
        )}
      </div>

      {/* Характеристики — Топливо */}
      <div className="filter-section">
        <button className="filter-section-hd" onClick={() => toggle('characteristics')}>
          <span>Характеристики</span>
          <ChevronIcon open={open.characteristics} />
        </button>
        {open.characteristics && (
          <div className="filter-section-body">
            <div className="filter-subsection-title">Топливо</div>
            <CheckboxList
              items={FUEL_TYPES}
              selected={selected.fuel}
              onToggle={name => toggleItem('fuel', name)}
            />
          </div>
        )}
      </div>

      {/* Кузов */}
      <div className="filter-section">
        <button className="filter-section-hd" onClick={() => toggle('body')}>
          <span>Кузов</span>
          <ChevronIcon open={open.body} />
        </button>
        {open.body && (
          <div className="filter-section-body">
            <CheckboxList
              items={BODY_TYPES}
              selected={selected.body}
              onToggle={name => toggleItem('body', name)}
            />
          </div>
        )}
      </div>

      {/* Цвет кузова */}
      <div className="filter-section">
        <button className="filter-section-hd" onClick={() => toggle('bodyColor')}>
          <span>Цвет кузова</span>
          <ChevronIcon open={open.bodyColor} />
        </button>
        {open.bodyColor && (
          <div className="filter-section-body">
            <ColorGrid
              colors={BODY_COLORS}
              selected={selected.bodyColor}
              onToggle={name => toggleItem('bodyColor', name)}
              showMoreLabel="цветов"
            />
          </div>
        )}
      </div>

      {/* Цвет салона */}
      <div className="filter-section">
        <button className="filter-section-hd" onClick={() => toggle('interiorColor')}>
          <span>Цвет салона</span>
          <ChevronIcon open={open.interiorColor} />
        </button>
        {open.interiorColor && (
          <div className="filter-section-body">
            <ColorGrid
              colors={INTERIOR_COLORS}
              selected={selected.interiorColor}
              onToggle={name => toggleItem('interiorColor', name)}
              showMoreLabel="цветов"
            />
          </div>
        )}
      </div>
    </div>
  )
}
