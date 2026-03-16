import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Pool } from 'pg'

const sourceUrl = process.env.SOURCE_DATABASE_URL
const targetUrl = process.env.TARGET_DATABASE_URL

if (!sourceUrl || !targetUrl) {
  console.error('Missing SOURCE_DATABASE_URL or TARGET_DATABASE_URL')
  process.exit(1)
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const schemaPath = path.join(repoRoot, 'server', 'schema.sql')

const poolOptions = (connectionString) => ({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 5,
})

const sourcePool = new Pool(poolOptions(sourceUrl))
const targetPool = new Pool(poolOptions(targetUrl))
const skipTables = new Set(
  String(process.env.SKIP_TABLES || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean),
)

const TABLE_ORDER = [
  'cars',
  'parts',
  'app_users',
  'filter_options',
  'pricing_settings',
  'scraper_config',
  'admin_login_attempts',
  'car_images',
  'part_images',
  'app_user_sessions',
]

function quoteIdent(value) {
  return `"${String(value).replace(/"/g, '""')}"`
}

function quoteTable(tableName) {
  return `${quoteIdent('public')}.${quoteIdent(tableName)}`
}

async function runTargetSchema() {
  const schemaSql = await fs.readFile(schemaPath, 'utf8')
  await targetPool.query(schemaSql)
}

async function listPublicTables(pool) {
  const result = await pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `)
  return result.rows.map((row) => row.table_name)
}

function sortTablesForCopy(tables) {
  const filteredTables = tables.filter((name) => !skipTables.has(name))
  const known = TABLE_ORDER.filter((name) => filteredTables.includes(name))
  const rest = filteredTables.filter((name) => !known.includes(name))
  return [...known, ...rest]
}

async function truncateTargetTables(tables) {
  if (!tables.length) return
  const tableList = tables.map(quoteTable).join(', ')
  await targetPool.query(`TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE`)
}

async function loadColumnList(pool, table) {
  const result = await pool.query(
    `
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
      ORDER BY ordinal_position
    `,
    [table],
  )
  return result.rows
}

function defaultJsonValue(columnName) {
  if (/_diagnostics$/i.test(columnName)) return []
  if (/detail_flags$/i.test(columnName)) return {}
  if (/delivery_(countries|profiles)$/i.test(columnName)) return []
  return {}
}

function sanitizeJsonValue(value, columnName) {
  if (value === null || value === undefined) return null
  if (typeof value === 'object') return JSON.stringify(value)
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return JSON.stringify(defaultJsonValue(columnName))
    try {
      JSON.parse(trimmed)
      return trimmed
    } catch {
      return JSON.stringify(defaultJsonValue(columnName))
    }
  }
  return JSON.stringify(defaultJsonValue(columnName))
}

function chunkRows(rows, size) {
  const chunks = []
  for (let index = 0; index < rows.length; index += size) {
    chunks.push(rows.slice(index, index + size))
  }
  return chunks
}

async function copyTableData(table) {
  const sourceCols = await loadColumnList(sourcePool, table)
  const targetCols = await loadColumnList(targetPool, table)
  const sourceColNames = new Set(sourceCols.map((col) => col.column_name))
  const columnsMeta = targetCols.filter((col) => sourceColNames.has(col.column_name))
  if (!columnsMeta.length) return { table, copied: 0, skipped: true }

  const columnNames = columnsMeta.map((col) => col.column_name)
  const selectSql = `SELECT ${columnNames.map(quoteIdent).join(', ')} FROM ${quoteTable(table)}`
  const sourceRowsResult = await sourcePool.query(selectSql)
  const rows = sourceRowsResult.rows
  if (!rows.length) return { table, copied: 0, skipped: false }

  const insertCols = columnNames.map(quoteIdent).join(', ')
  const batches = chunkRows(rows, 300)

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex += 1) {
    const batch = batches[batchIndex]
    const values = []
    const placeholders = batch.map((row, rowIndex) => {
      const rowPlaceholders = columnsMeta.map((col, colIndex) => {
        const rawValue = row[col.column_name]
        const normalizedValue = (col.data_type === 'json' || col.data_type === 'jsonb')
          ? sanitizeJsonValue(rawValue, col.column_name)
          : rawValue
        values.push(normalizedValue)
        return `$${rowIndex * columnsMeta.length + colIndex + 1}`
      })
      return `(${rowPlaceholders.join(', ')})`
    })

    const insertSql = `
      INSERT INTO ${quoteTable(table)} (${insertCols})
      VALUES ${placeholders.join(', ')}
    `
    try {
      await targetPool.query(insertSql, values)
    } catch (error) {
      error.message = `${error.message} (table=${table}, batch=${batchIndex + 1}/${batches.length})`
      throw error
    }
  }

  return { table, copied: rows.length, skipped: false }
}

async function syncSequences(tables) {
  for (const table of tables) {
    const serialColsResult = await targetPool.query(
      `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = $1
          AND column_default LIKE 'nextval(%'
      `,
      [table],
    )

    for (const row of serialColsResult.rows) {
      const column = row.column_name
      const maxResult = await targetPool.query(
        `SELECT MAX(${quoteIdent(column)})::bigint AS max_id FROM ${quoteTable(table)}`,
      )
      const maxId = maxResult.rows[0]?.max_id
      const nextValue = Number(maxId || 0) + 1
      const sequenceNameResult = await targetPool.query(
        `SELECT pg_get_serial_sequence($1, $2) AS seq_name`,
        [`public.${table}`, column],
      )
      const seqName = sequenceNameResult.rows[0]?.seq_name
      if (!seqName) continue
      await targetPool.query(`SELECT setval($1::regclass, $2, false)`, [seqName, nextValue])
    }
  }
}

async function compareCounts(tables) {
  const summary = []
  for (const table of tables) {
    const src = await sourcePool.query(`SELECT COUNT(*)::bigint AS c FROM ${quoteTable(table)}`)
    const dst = await targetPool.query(`SELECT COUNT(*)::bigint AS c FROM ${quoteTable(table)}`)
    summary.push({
      table,
      source: Number(src.rows[0].c || 0),
      target: Number(dst.rows[0].c || 0),
    })
  }
  return summary
}

async function main() {
  try {
    console.log('Running schema on target database...')
    await runTargetSchema()

    const sourceTables = await listPublicTables(sourcePool)
    const targetTables = await listPublicTables(targetPool)
    const tablesToCopy = sortTablesForCopy(sourceTables.filter((name) => targetTables.includes(name)))

    console.log(`Truncating ${tablesToCopy.length} tables on target...`)
    await truncateTargetTables(tablesToCopy)

    console.log('Copying table data...')
    for (const table of tablesToCopy) {
      try {
        const result = await copyTableData(table)
        const marker = result.skipped ? 'skipped' : `${result.copied} rows`
        console.log(`- ${table}: ${marker}`)
      } catch (error) {
        console.error(`- ${table}: failed`)
        throw error
      }
    }

    console.log('Syncing sequences...')
    await syncSequences(tablesToCopy)

    console.log('Comparing row counts...')
    const counts = await compareCounts(tablesToCopy)
    let mismatch = false
    for (const row of counts) {
      const ok = row.source === row.target
      if (!ok) mismatch = true
      console.log(`- ${row.table}: source=${row.source}, target=${row.target}${ok ? '' : ' [MISMATCH]'}`)
    }

    if (mismatch) {
      console.error('Migration finished with count mismatches.')
      process.exitCode = 2
      return
    }

    console.log('Migration completed successfully.')
  } finally {
    await sourcePool.end()
    await targetPool.end()
  }
}

main().catch((error) => {
  console.error('Migration failed:', error.message)
  process.exit(1)
})
