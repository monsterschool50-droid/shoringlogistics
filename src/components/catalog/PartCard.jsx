import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const PlaceholderIcon = () => (
  <svg width="48" height="48" fill="none" stroke="#cbd5e1" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7h16v10H4z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V5h8v2M8 17l3-3 2 2 3-3 2 2" />
  </svg>
)

export default function PartCard({ part, detailsHref }) {
  const navigate = useNavigate()
  const [failed, setFailed] = useState(false)
  const firstImage = useMemo(() => (Array.isArray(part.images) ? part.images[0]?.url || '' : ''), [part.images])
  const imageUrl = failed ? '' : firstImage

  const openDetails = () => navigate(detailsHref)

  const onCardClick = (event) => {
    if (event.defaultPrevented) return
    if (event.target.closest('a, button, input, select, textarea, label')) return
    openDetails()
  }

  const onCardKeyDown = (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    if (event.target.closest('a, button, input, select, textarea, label')) return
    event.preventDefault()
    openDetails()
  }

  return (
    <article
      className="part-card"
      role="link"
      tabIndex={0}
      onClick={onCardClick}
      onKeyDown={onCardKeyDown}
    >
      <div className="part-card-media">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={part.title}
            className="part-card-image"
            loading="lazy"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="part-card-placeholder">
            <PlaceholderIcon />
          </div>
        )}
        <span className={`part-card-stock${part.in_stock ? ' is-in-stock' : ' is-out-of-stock'}`}>
          {part.availability_text || (part.in_stock ? 'В наличии' : 'Нет в наличии')}
        </span>
      </div>

      <div className="part-card-body">
        <div className="part-card-topline">
          <span className="part-card-category">{part.category || 'Запчасть'}</span>
          {part.article_number ? <span className="part-card-article">#{part.article_number}</span> : null}
        </div>
        <h3 className="part-card-title">{part.title}</h3>
        <p className="part-card-fitment">
          {[part.brand, part.model, part.generation_body, part.year_range].filter(Boolean).join(' • ') || 'Совместимость не указана'}
        </p>

        <div className="part-card-grid">
          <div>
            <span>Состояние</span>
            <strong>{part.condition || '-'}</strong>
          </div>
          <div>
            <span>Расположение</span>
            <strong>{part.side_location || '-'}</strong>
          </div>
          <div>
            <span>Донор</span>
            <strong>{part.donor_vehicle || '-'}</strong>
          </div>
          <div>
            <span>Фото</span>
            <strong>{Array.isArray(part.images) ? part.images.length : 0}</strong>
          </div>
        </div>

        {part.description ? <p className="part-card-description">{part.description}</p> : null}

        <div className="part-card-footer">
          <div className="part-card-price">${Number(part.price || 0).toLocaleString()}</div>
          <div className="part-card-actions">
            <Link to={detailsHref} className="btn-car-primary">Открыть</Link>
            <a
              href={`https://wa.me/821056650943?text=${encodeURIComponent(`Интересует запчасть: ${part.title}, артикул: ${part.article_number || '-'}`)}`}
              target="_blank"
              rel="noreferrer"
              className="btn-car-green"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}
