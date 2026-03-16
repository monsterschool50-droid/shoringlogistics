import { Client } from 'pg'

const sourceUrl = process.env.SOURCE_DATABASE_URL
const targetUrl = process.env.TARGET_DATABASE_URL

if (!sourceUrl || !targetUrl) {
  console.error('Missing SOURCE_DATABASE_URL or TARGET_DATABASE_URL')
  process.exit(1)
}

const tables = [
  'cars',
  'car_images',
  'parts',
  'part_images',
  'pricing_settings',
  'scraper_config',
  'filter_options',
  'app_users',
  'app_user_sessions',
]

const source = new Client({ connectionString: sourceUrl, ssl: { rejectUnauthorized: false } })
const target = new Client({ connectionString: targetUrl, ssl: { rejectUnauthorized: false } })

try {
  await source.connect()
  await target.connect()

  for (const table of tables) {
    const src = await source.query(`SELECT COUNT(*)::bigint AS c FROM public."${table}"`)
    const dst = await target.query(`SELECT COUNT(*)::bigint AS c FROM public."${table}"`)
    console.log(`${table}: src=${src.rows[0].c} dst=${dst.rows[0].c}`)
  }
} finally {
  await source.end()
  await target.end()
}
