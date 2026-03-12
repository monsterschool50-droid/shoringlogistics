import { Router } from 'express'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import pool from '../db.js'
import { requireAdminSession } from '../lib/adminAuth.js'
import { upload } from '../middleware/upload.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const router = Router()
const adminMutationProtection = requireAdminSession()

function toNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeText(value, fallback = '') {
  const normalized = String(value || '').trim().replace(/\s+/g, ' ')
  return normalized || fallback
}

function normalizeNullableText(value) {
  const normalized = normalizeText(value)
  return normalized || null
}

function normalizeBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value
  const normalized = String(value || '').trim().toLowerCase()
  if (!normalized) return fallback
  return ['1', 'true', 'yes', 'in_stock', 'available', 'есть', 'available_now'].includes(normalized)
}

function decoratePartRow(row) {
  return {
    ...row,
    title: normalizeText(row.title),
    brand: normalizeText(row.brand),
    model: normalizeText(row.model),
    generation_body: normalizeText(row.generation_body),
    year_range: normalizeText(row.year_range),
    side_location: normalizeText(row.side_location),
    category: normalizeText(row.category),
    condition: normalizeText(row.condition),
    description: normalizeText(row.description),
    article_number: normalizeText(row.article_number),
    availability_text: normalizeText(row.availability_text, row.in_stock ? 'В наличии' : 'Нет в наличии'),
    donor_vehicle: normalizeText(row.donor_vehicle),
    in_stock: Boolean(row.in_stock),
    price: toNumber(row.price, 0),
    images: Array.isArray(row.images) ? row.images : [],
  }
}

async function assertPartExists(partId) {
  const result = await pool.query('SELECT id FROM parts WHERE id = $1', [partId])
  return Boolean(result.rows.length)
}

router.get('/', async (req, res) => {
  try {
    const {
      q,
      brand,
      model,
      category,
      availability,
      minPrice,
      maxPrice,
      sort = 'newest',
      page = 1,
      limit = 20,
    } = req.query

    const conditions = []
    const params = []
    let p = 1
    const queryText = normalizeText(q)

    if (queryText) {
      conditions.push(`(
        COALESCE(p.title, '') ILIKE $${p}
        OR COALESCE(p.brand, '') ILIKE $${p}
        OR COALESCE(p.model, '') ILIKE $${p}
        OR COALESCE(p.generation_body, '') ILIKE $${p}
        OR COALESCE(p.year_range, '') ILIKE $${p}
        OR COALESCE(p.side_location, '') ILIKE $${p}
        OR COALESCE(p.category, '') ILIKE $${p}
        OR COALESCE(p.condition, '') ILIKE $${p}
        OR COALESCE(p.description, '') ILIKE $${p}
        OR COALESCE(p.article_number, '') ILIKE $${p}
        OR COALESCE(p.donor_vehicle, '') ILIKE $${p}
      )`)
      params.push(`%${queryText}%`)
      p += 1
    }

    if (normalizeText(brand)) {
      conditions.push(`COALESCE(p.brand, '') ILIKE $${p}`)
      params.push(`%${normalizeText(brand)}%`)
      p += 1
    }

    if (normalizeText(model)) {
      conditions.push(`COALESCE(p.model, '') ILIKE $${p}`)
      params.push(`%${normalizeText(model)}%`)
      p += 1
    }

    if (normalizeText(category)) {
      conditions.push(`COALESCE(p.category, '') ILIKE $${p}`)
      params.push(`%${normalizeText(category)}%`)
      p += 1
    }

    if (minPrice !== undefined && minPrice !== '') {
      conditions.push(`COALESCE(p.price, 0) >= $${p}`)
      params.push(toNumber(minPrice, 0))
      p += 1
    }

    if (maxPrice !== undefined && maxPrice !== '') {
      conditions.push(`COALESCE(p.price, 0) <= $${p}`)
      params.push(toNumber(maxPrice, 0))
      p += 1
    }

    const normalizedAvailability = String(availability || '').trim().toLowerCase()
    if (normalizedAvailability && normalizedAvailability !== 'all') {
      conditions.push(`p.in_stock = $${p}`)
      params.push(normalizeBoolean(availability, true))
      p += 1
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    const sortMap = {
      newest: 'p.created_at DESC',
      oldest: 'p.created_at ASC',
      price_asc: 'COALESCE(p.price, 0) ASC',
      price_desc: 'COALESCE(p.price, 0) DESC',
    }
    const orderBy = sortMap[sort] || sortMap.newest
    const safeLimit = Math.min(Math.max(Number.parseInt(String(limit), 10) || 20, 1), 100)
    const safePage = Math.max(Number.parseInt(String(page), 10) || 1, 1)
    const offset = (safePage - 1) * safeLimit

    const countResult = await pool.query(`SELECT COUNT(*)::int AS count FROM parts p ${where}`, params)
    const total = countResult.rows[0]?.count || 0
    const rowsResult = await pool.query(
      `SELECT p.*,
        COALESCE(
          json_agg(pi ORDER BY pi.position ASC) FILTER (WHERE pi.id IS NOT NULL),
          '[]'
        ) AS images
       FROM parts p
       LEFT JOIN part_images pi ON pi.part_id = p.id
       ${where}
       GROUP BY p.id
       ORDER BY ${orderBy}
       LIMIT $${p++} OFFSET $${p++}`,
      [...params, safeLimit, offset]
    )

    return res.json({
      total,
      page: safePage,
      limit: safeLimit,
      pages: Math.max(1, Math.ceil(total / safeLimit)),
      parts: rowsResult.rows.map(decoratePartRow),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Ошибка сервера' })
  }
})

router.post('/', adminMutationProtection, async (req, res) => {
  try {
    const title = normalizeText(req.body?.title)
    if (!title) return res.status(400).json({ error: 'Название запчасти обязательно' })

    const result = await pool.query(
      `INSERT INTO parts (
        title, brand, model, generation_body, year_range, side_location,
        category, condition, price, description, article_number,
        availability_text, in_stock, donor_vehicle
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11,
        $12, $13, $14
      )
      RETURNING *`,
      [
        title,
        normalizeNullableText(req.body?.brand),
        normalizeNullableText(req.body?.model),
        normalizeNullableText(req.body?.generation_body),
        normalizeNullableText(req.body?.year_range),
        normalizeNullableText(req.body?.side_location),
        normalizeNullableText(req.body?.category),
        normalizeNullableText(req.body?.condition),
        toNumber(req.body?.price, 0),
        normalizeNullableText(req.body?.description),
        normalizeNullableText(req.body?.article_number),
        normalizeNullableText(req.body?.availability_text) || (normalizeBoolean(req.body?.in_stock, true) ? 'В наличии' : 'Нет в наличии'),
        normalizeBoolean(req.body?.in_stock, true),
        normalizeNullableText(req.body?.donor_vehicle),
      ]
    )

    return res.status(201).json(decoratePartRow(result.rows[0]))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Ошибка сервера' })
  }
})

router.post('/:id/images', adminMutationProtection, upload.array('images', 30), async (req, res) => {
  try {
    const partId = req.params.id
    if (!await assertPartExists(partId)) return res.status(404).json({ error: 'Запчасть не найдена' })
    if (!req.files?.length) return res.status(400).json({ error: 'Файлы не переданы' })

    const posResult = await pool.query(
      'SELECT COALESCE(MAX(position), -1) AS maxpos FROM part_images WHERE part_id = $1',
      [partId]
    )
    let position = Number(posResult.rows[0]?.maxpos || 0) + 1
    const baseUrl = globalThis.process?.env?.BASE_URL || `http://localhost:${globalThis.process?.env?.PORT || 3001}`
    const inserted = []

    for (const file of req.files) {
      const url = `${baseUrl}/uploads/${file.filename}`
      const result = await pool.query(
        'INSERT INTO part_images (part_id, url, position) VALUES ($1, $2, $3) RETURNING *',
        [partId, url, position]
      )
      inserted.push(result.rows[0])
      position += 1
    }

    return res.status(201).json(inserted)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Ошибка сервера' })
  }
})

router.delete('/images/:imageId', adminMutationProtection, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM part_images WHERE id = $1 RETURNING *', [req.params.imageId])
    if (!result.rows.length) return res.status(404).json({ error: 'Изображение не найдено' })

    const filename = path.basename(result.rows[0].url || '')
    const filePath = path.join(__dirname, '..', 'uploads', filename)
    if (filename && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    return res.json({ deleted: result.rows[0].id })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Ошибка сервера' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*,
        COALESCE(
          json_agg(pi ORDER BY pi.position ASC) FILTER (WHERE pi.id IS NOT NULL),
          '[]'
        ) AS images
       FROM parts p
       LEFT JOIN part_images pi ON pi.part_id = p.id
       WHERE p.id = $1
       GROUP BY p.id`,
      [req.params.id]
    )

    if (!result.rows.length) return res.status(404).json({ error: 'Запчасть не найдена' })
    return res.json(decoratePartRow(result.rows[0]))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Ошибка сервера' })
  }
})

router.put('/:id', adminMutationProtection, async (req, res) => {
  try {
    const payload = { ...(req.body || {}) }
    const fields = [
      'title',
      'brand',
      'model',
      'generation_body',
      'year_range',
      'side_location',
      'category',
      'condition',
      'price',
      'description',
      'article_number',
      'availability_text',
      'in_stock',
      'donor_vehicle',
    ]

    const updates = []
    const params = []
    let p = 1

    for (const field of fields) {
      if (payload[field] === undefined) continue

      let value = payload[field]
      if (field === 'title') {
        value = normalizeText(value)
        if (!value) return res.status(400).json({ error: 'Название запчасти обязательно' })
      } else if (field === 'price') {
        value = toNumber(value, 0)
      } else if (field === 'in_stock') {
        value = normalizeBoolean(value, false)
      } else {
        value = normalizeNullableText(value)
      }

      updates.push(`${field} = $${p++}`)
      params.push(value)
    }

    if (!updates.length) return res.status(400).json({ error: 'Нет данных для обновления' })

    updates.push('updated_at = NOW()')
    params.push(req.params.id)

    const result = await pool.query(
      `UPDATE parts SET ${updates.join(', ')} WHERE id = $${p} RETURNING *`,
      params
    )

    if (!result.rows.length) return res.status(404).json({ error: 'Запчасть не найдена' })

    const refreshed = await pool.query(
      `SELECT p.*,
        COALESCE(
          json_agg(pi ORDER BY pi.position ASC) FILTER (WHERE pi.id IS NOT NULL),
          '[]'
        ) AS images
       FROM parts p
       LEFT JOIN part_images pi ON pi.part_id = p.id
       WHERE p.id = $1
       GROUP BY p.id`,
      [req.params.id]
    )

    return res.json(decoratePartRow(refreshed.rows[0]))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Ошибка сервера' })
  }
})

router.delete('/:id', adminMutationProtection, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM parts WHERE id = $1 RETURNING id', [req.params.id])
    if (!result.rows.length) return res.status(404).json({ error: 'Запчасть не найдена' })
    return res.json({ deleted: result.rows[0].id })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Ошибка сервера' })
  }
})

export default router
