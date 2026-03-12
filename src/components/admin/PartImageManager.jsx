import { useRef, useState } from 'react'

export default function PartImageManager({ part, onClose, onUpload, onDelete, toast, renderIcon }) {
  const [images, setImages] = useState(part.images || [])
  const [busy, setBusy] = useState(false)
  const inputRef = useRef(null)

  const upload = async (event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return

    setBusy(true)
    try {
      const uploaded = await onUpload(part.id, files)
      if (Array.isArray(uploaded)) {
        setImages((prev) => [...prev, ...uploaded])
        toast('Фото загружены', 'success')
      } else {
        toast('Ошибка загрузки', 'error')
      }
    } catch {
      toast('Ошибка загрузки', 'error')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const remove = async (image) => {
    if (!window.confirm('Удалить изображение?')) return
    try {
      await onDelete(image.id)
      setImages((prev) => prev.filter((item) => item.id !== image.id))
      toast('Удалено', 'success')
    } catch {
      toast('Ошибка удаления', 'error')
    }
  }

  return (
    <div>
      <div className="adm-upload-zone" onClick={() => inputRef.current?.click()}>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          style={{ display: 'none' }}
          onChange={upload}
        />
        {renderIcon?.('photo', 32)}
        <div>{busy ? 'Загрузка...' : 'Нажмите для загрузки фото'}</div>
        <small>JPG/PNG/WebP до 30 шт</small>
      </div>

      <div className="adm-img-grid">
        {images.map((image, index) => (
          <div key={image.id || index} className="adm-img-item">
            <img src={image.url} alt="" loading="lazy" />
            <div className="adm-img-ov">
              <span>#{index + 1}</span>
              <button onClick={() => remove(image)}>{renderIcon?.('trash', 13)}</button>
            </div>
          </div>
        ))}
        {images.length === 0 ? <div className="adm-img-empty">Нет фото</div> : null}
      </div>

      <div style={{ textAlign: 'right', marginTop: 12 }}>
        <button className="adm-btn adm-btn-cancel" onClick={onClose}>Закрыть</button>
      </div>
    </div>
  )
}
