import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const SearchIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const UserIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const MenuIcon = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const CloseIcon = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const TLVLogo = () => (
  <Link to="/" className="header-logo">
    <div>
      <div style={{ display: 'flex', alignItems: 'center', lineHeight: 1 }}>
        <span style={{ color: '#1a3c5e', fontWeight: 900, fontSize: '22px', letterSpacing: '-0.5px' }}>TL</span>
        <span style={{ color: '#00b894', fontWeight: 900, fontSize: '22px', letterSpacing: '-0.5px' }}>V</span>
      </div>
      <div style={{ color: '#1a3c5e', fontSize: '8px', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: '2px' }}>
        AUTO
      </div>
    </div>
  </Link>
)

const navLinks = [
  { label: 'Главная', to: '/' },
  { label: 'Каталог', to: '/catalog' },
  { label: 'Контакты', to: '/contacts' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`site-header${scrolled ? ' site-header-scrolled' : ''}`}>
      <div className="header-row">

        {/* Logo */}
        <TLVLogo />

        {/* Desktop Nav */}
        <nav className="header-nav">
          {navLinks.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className={location.pathname === to ? 'active' : ''}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop Search — flex:1 fills remaining space */}
        <div className="header-search">
          <span className="header-search-icon">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="VIN / Encar ID"
            className="search-input"
          />
        </div>

        {/* Desktop Login */}
        <button className="header-login">
          <UserIcon />
          Войти
        </button>

        {/* Mobile controls */}
        <div className="header-mobile-controls">
          <button
            className="header-icon-btn"
            onClick={() => setMobileOpen(v => v === 'search' ? false : 'search')}
          >
            <SearchIcon />
          </button>
          <button
            className="header-icon-btn"
            onClick={() => setMobileOpen(v => v === 'menu' ? false : 'menu')}
          >
            {mobileOpen === 'menu' ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile search dropdown */}
      {mobileOpen === 'search' && (
        <div className="header-mobile-menu">
          <div className="mobile-search-wrap">
            <span className="header-search-icon" style={{ top: '50%' }}>
              <SearchIcon />
            </span>
            <input
              autoFocus
              type="text"
              placeholder="VIN / Encar ID"
              className="search-input"
            />
          </div>
        </div>
      )}

      {/* Mobile nav dropdown */}
      {mobileOpen === 'menu' && (
        <div className="header-mobile-menu">
          {navLinks.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className={`mobile-nav-link${location.pathname === to ? ' active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </Link>
          ))}
          <button className="mobile-login-btn">
            <UserIcon />
            Войти
          </button>
        </div>
      )}
    </header>
  )
}
