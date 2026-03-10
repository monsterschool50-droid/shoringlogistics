import axios from 'axios'
import iconv from 'iconv-lite'
import { load } from 'cheerio'

const optionDictionaryClient = axios.create({
  baseURL: 'https://www.encar.com',
  timeout: 20000,
  responseType: 'arraybuffer',
  proxy: false,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
    Referer: 'https://www.encar.com/',
  },
})

const OPTION_DICTIONARY_TTL_MS = 6 * 60 * 60 * 1000
const OPTION_BUCKET_KEYS = ['standard', 'choice', 'etc', 'tuning']

let cachedDictionary = null
let cachedAt = 0
let loadingPromise = null

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function normalizeOptionCode(value) {
  const digits = String(value || '').trim().replace(/[^\d]/g, '')
  return digits
}

function registerOptionTitle(map, code, title) {
  const normalizedCode = normalizeOptionCode(code)
  const normalizedTitle = cleanText(title)
  if (!normalizedCode || !normalizedTitle) return

  if (!map.has(normalizedCode)) {
    map.set(normalizedCode, normalizedTitle)
  }

  const withoutLeadingZeros = normalizedCode.replace(/^0+(?=\d)/, '')
  if (withoutLeadingZeros && !map.has(withoutLeadingZeros)) {
    map.set(withoutLeadingZeros, normalizedTitle)
  }

  if (/^\d+$/.test(withoutLeadingZeros) && withoutLeadingZeros.length < 3) {
    const padded = withoutLeadingZeros.padStart(3, '0')
    if (!map.has(padded)) {
      map.set(padded, normalizedTitle)
    }
  }
}

async function fetchOptionDictionaryPage(carTypeCd) {
  const response = await optionDictionaryClient.get(`/dc/dc_carsearchpop.do?method=optionDic&carTypeCd=${encodeURIComponent(carTypeCd)}`)
  const html = iconv.decode(Buffer.from(response.data), 'euc-kr')
  const $ = load(html)
  const optionMap = new Map()

  $('div.view[id^="option_"]').each((_, element) => {
    const rawId = String($(element).attr('id') || '').replace(/^option_/, '')
    const baseCode = rawId.replace(/_g$/i, '')
    const title = cleanText($(element).find('strong.tit_subject').first().text())
    registerOptionTitle(optionMap, baseCode, title)

    $(element).find('input[name="suboption"]').each((__, input) => {
      registerOptionTitle(optionMap, $(input).attr('value'), title)
      registerOptionTitle(optionMap, $(input).attr('data-target'), title)
    })
  })

  return optionMap
}

async function loadOptionDictionary() {
  const dictionaries = await Promise.all([
    fetchOptionDictionaryPage(1),
    fetchOptionDictionaryPage(2).catch(() => new Map()),
  ])

  const combined = new Map()
  for (const dictionary of dictionaries) {
    for (const [code, title] of dictionary.entries()) {
      if (!combined.has(code)) combined.set(code, title)
    }
  }

  return combined
}

export async function getEncarOptionDictionary() {
  if (cachedDictionary && Date.now() - cachedAt < OPTION_DICTIONARY_TTL_MS) {
    return cachedDictionary
  }

  if (!loadingPromise) {
    loadingPromise = loadOptionDictionary()
      .then((dictionary) => {
        cachedDictionary = dictionary
        cachedAt = Date.now()
        return dictionary
      })
      .finally(() => {
        loadingPromise = null
      })
  }

  return loadingPromise
}

export function flattenEncarOptionCodes(options = {}) {
  if (Array.isArray(options)) {
    return [...new Set(options.map((item) => normalizeOptionCode(item)).filter(Boolean))]
  }

  const codes = []
  for (const key of OPTION_BUCKET_KEYS) {
    const values = Array.isArray(options?.[key]) ? options[key] : []
    for (const value of values) {
      const code = normalizeOptionCode(value)
      if (code) codes.push(code)
    }
  }

  return [...new Set(codes)]
}

export async function resolveEncarOptionTexts(options = {}) {
  const codes = flattenEncarOptionCodes(options)
  if (!codes.length) return []

  const dictionary = await getEncarOptionDictionary()
  const titles = []

  for (const code of codes) {
    const title = dictionary.get(code)
    if (title) titles.push(title)
  }

  return [...new Set(titles)].slice(0, 48)
}
