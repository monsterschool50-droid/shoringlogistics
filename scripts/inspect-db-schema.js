import { Client } from 'pg'

const sourceUrl = process.env.SOURCE_DATABASE_URL
const targetUrl = process.env.TARGET_DATABASE_URL
const table = process.env.TABLE_NAME || 'cars'

if (!sourceUrl || !targetUrl) {
  console.error('Missing SOURCE_DATABASE_URL or TARGET_DATABASE_URL')
  process.exit(1)
}

const source = new Client({ connectionString: sourceUrl, ssl: { rejectUnauthorized: false } })
const target = new Client({ connectionString: targetUrl, ssl: { rejectUnauthorized: false } })

try {
  await source.connect()
  await target.connect()

  const query = `
    SELECT column_name, data_type, udt_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = $1
    ORDER BY ordinal_position
  `

  const src = await source.query(query, [table])
  const dst = await target.query(query, [table])

  console.log(`SOURCE (${table})`)
  for (const row of src.rows) {
    console.log(`${row.column_name}|${row.data_type}|${row.udt_name}`)
  }

  console.log(`TARGET (${table})`)
  for (const row of dst.rows) {
    console.log(`${row.column_name}|${row.data_type}|${row.udt_name}`)
  }
} finally {
  await source.end()
  await target.end()
}
