import { useState } from 'react'

const BLANK_PART = {
  title: '',
  brand: '',
  model: '',
  generation_body: '',
  year_range: '',
  side_location: '',
  category: '',
  condition: '',
  price: '',
  description: '',
  article_number: '',
  availability_text: 'В наличии',
  in_stock: true,
  donor_vehicle: '',
}

function Field({ label, name, value, onChange, type = 'text', full = false, ...props }) {
  return (
    <div className={`adm-field${full ? ' adm-field-full' : ''}`}>
      <label className="adm-label">{label}</label>
      <input
        className="adm-input"
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        {...props}
      />
    </div>
  )
}

export default function PartForm({ init = BLANK_PART, onSave, onCancel, busy }) {
  const [form, setForm] = useState(() => ({ ...BLANK_PART, ...init }))

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const submit = (event) => {
    event.preventDefault()
    onSave({
      ...form,
      price: Number(form.price || 0),
      in_stock: Boolean(form.in_stock),
      availability_text: String(form.availability_text || '').trim() || (form.in_stock ? 'В наличии' : 'Нет в наличии'),
    })
  }

  return (
    <form className="adm-form" onSubmit={submit}>
      <div className="adm-sec-title">Запчасть</div>

      <div className="adm-fields-row">
        <Field
          label="Название"
          name="title"
          value={form.title}
          onChange={(event) => setField('title', event.target.value)}
          placeholder="Передняя левая фара"
        />
        <Field
          label="Категория"
          name="category"
          value={form.category}
          onChange={(event) => setField('category', event.target.value)}
          placeholder="Фара"
        />
      </div>

      <div className="adm-fields-row">
        <Field
          label="Марка"
          name="brand"
          value={form.brand}
          onChange={(event) => setField('brand', event.target.value)}
          placeholder="Hyundai"
        />
        <Field
          label="Модель"
          name="model"
          value={form.model}
          onChange={(event) => setField('model', event.target.value)}
          placeholder="Sonata"
        />
      </div>

      <div className="adm-fields-row">
        <Field
          label="Поколение / кузов"
          name="generation_body"
          value={form.generation_body}
          onChange={(event) => setField('generation_body', event.target.value)}
          placeholder="DN8 / седан"
        />
        <Field
          label="Годы"
          name="year_range"
          value={form.year_range}
          onChange={(event) => setField('year_range', event.target.value)}
          placeholder="2020-2023"
        />
      </div>

      <div className="adm-fields-row">
        <Field
          label="Сторона / расположение"
          name="side_location"
          value={form.side_location}
          onChange={(event) => setField('side_location', event.target.value)}
          placeholder="Передняя левая"
        />
        <Field
          label="Состояние"
          name="condition"
          value={form.condition}
          onChange={(event) => setField('condition', event.target.value)}
          placeholder="Б/у, оригинал"
        />
      </div>

      <div className="adm-fields-row">
        <Field
          label="Цена, USD"
          name="price"
          type="number"
          min="0"
          value={form.price}
          onChange={(event) => setField('price', event.target.value)}
          placeholder="350"
        />
        <Field
          label="Артикул / номер"
          name="article_number"
          value={form.article_number}
          onChange={(event) => setField('article_number', event.target.value)}
          placeholder="P-1042"
        />
      </div>

      <div className="adm-fields-row">
        <Field
          label="Статус наличия"
          name="availability_text"
          value={form.availability_text}
          onChange={(event) => setField('availability_text', event.target.value)}
          placeholder="В наличии"
        />
        <Field
          label="Снята с автомобиля"
          name="donor_vehicle"
          value={form.donor_vehicle}
          onChange={(event) => setField('donor_vehicle', event.target.value)}
          placeholder="Hyundai Sonata 2.5 2021"
        />
      </div>

      <div className="adm-field adm-field-full">
        <label className="adm-label">Описание</label>
        <textarea
          className="adm-input"
          rows={5}
          value={form.description}
          onChange={(event) => setField('description', event.target.value)}
          placeholder="Укажите дефекты, совместимость, номер кузова и другие детали."
        />
      </div>

      <label className="adm-chk-row">
        <input
          type="checkbox"
          checked={Boolean(form.in_stock)}
          onChange={(event) => setField('in_stock', event.target.checked)}
        />
        <span>Запчасть в наличии</span>
      </label>

      <div className="adm-form-actions">
        <button type="button" className="adm-btn adm-btn-cancel" onClick={onCancel}>Отмена</button>
        <button type="submit" className="adm-btn adm-btn-primary" disabled={busy}>
          {busy ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </form>
  )
}
