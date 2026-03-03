const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

const Stars = () => (
  <div className="review-stars">
    {[1,2,3,4,5].map(i => <StarIcon key={i} />)}
  </div>
)

const reviews = [
  {
    name: 'Алексей',
    text: '"Заказал Hyundai Sonata через TLV Auto. Машина пришла за 23 дня в отличном состоянии. Рекомендую!"',
  },
  {
    name: 'Марат',
    text: '"Уже второй автомобиль покупаю из Кореи. Качество корейских авто на высоте, а сервис TLV Auto безупречен."',
  },
  {
    name: 'Дмитрий',
    text: '"Очень доволен KIA K5. Пробег минимальный, состояние как новое. Спасибо команде за помощь!"',
  },
]

export default function Reviews() {
  return (
    <section className="reviews-section">
      <div className="section-inner">
        <h2 className="section-title">Отзывы наших клиентов</h2>
        <p className="section-subtitle">
          Что говорят люди, которые уже получили свои автомобили из Кореи
        </p>

        <div className="reviews-grid">
          {reviews.map(({ name, text }) => (
            <div className="review-card" key={name}>
              <Stars />
              <p className="review-name">{name}</p>
              <p className="review-text">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
