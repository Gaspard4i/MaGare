#!/usr/bin/env node
/**
 * Pull all translations from Loco and save as src/i18n/{locale}.json
 * Usage: node scripts/pull-translations.js
 */
const fs = require('fs')
const path = require('path')

const LOCO_KEY = 'V5T2bzphasi05dH3Sn97ISTazq9DtVB7'
const API = 'https://localise.biz/api'
const I18N_DIR = path.join(__dirname, '..', 'src', 'i18n')

async function main() {
  // 1. Fetch available locales
  const localesRes = await fetch(`${API}/locales`, {
    headers: { Authorization: `Loco ${LOCO_KEY}` },
  })
  if (!localesRes.ok) throw new Error(`Failed to fetch locales: ${localesRes.status}`)
  const locales = await localesRes.json()

  console.log(`Found ${locales.length} locale(s): ${locales.map(l => l.code).join(', ')}`)

  // 2. Export each locale
  for (const loc of locales) {
    const res = await fetch(`${API}/export/locale/${loc.code}.json`, {
      headers: { Authorization: `Loco ${LOCO_KEY}` },
    })
    if (!res.ok) {
      console.error(`  ✗ ${loc.code}: HTTP ${res.status}`)
      continue
    }
    const data = await res.json()
    const file = path.join(I18N_DIR, `${loc.code}.json`)
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n')
    const keys = countKeys(data)
    console.log(`  ✓ ${loc.code} → ${path.relative(process.cwd(), file)} (${keys} keys)`)
  }

  // 3. Generate locales manifest
  const manifest = locales.map(l => l.code)
  const manifestFile = path.join(I18N_DIR, 'locales.json')
  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + '\n')
  console.log(`\nManifest → ${path.relative(process.cwd(), manifestFile)}`)
}

function countKeys(obj, count = 0) {
  for (const v of Object.values(obj)) {
    if (typeof v === 'object' && v !== null) count = countKeys(v, count)
    else count++
  }
  return count
}

main().catch(e => { console.error(e); process.exit(1) })
