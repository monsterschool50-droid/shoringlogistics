import { Link } from 'react-router-dom'

export default function FinalCTA() {
  return (
    <section className="final-cta-section">
      <div className="section-inner">
        <h2 className="final-cta-title">Готовы выбрать автомобиль из Кореи?</h2>
        <p className="final-cta-subtitle">
          Начните поиск автомобиля мечты в нашем каталоге или свяжитесь с нами для консультации.
        </p>

        <div className="final-cta-btns">
          <Link to="/catalog" className="btn-cta-primary">
            Открыть каталог
          </Link>
          <Link to="/contacts" className="btn-cta-secondary">
            Связаться с нами
          </Link>
        </div>
      </div>
    </section>
  )
}
