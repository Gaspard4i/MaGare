# MaGare – Project Instructions

## i18n / Loco Integration
- Translation management: [Loco (localise.biz)](https://localise.biz/gaspard4i/magare)
- Loco readonly API key: `V5T2bzphasi05dH3Sn97ISTazq9DtVB7`
- Loco full access API key: `5jnK3kiLU6q6FBsIHEqlZvvV58Av8m8Aa`
- Source locale on Loco: `fr-FR`
- Loco API does NOT support CORS — translations are fetched at build time, not at runtime
- All locale files are in `src/i18n/{code}.json` + manifest `src/i18n/locales.json`
- `import.meta.glob` auto-loads all locale JSON files at build time
- Locale codes use BCP47 format (e.g. `fr-FR`, `en-GB`) — old `fr` code is auto-migrated
- Language names in the UI are auto-generated using `Intl.DisplayNames` (native names)
- localStorage key for language: `mg_lang`

## i18n Workflow
1. Add/edit translations on Loco (localise.biz)
2. Run `npm run i18n:pull` to download all translations locally
3. Build & deploy — translations are bundled in the JS bundle

## Key Rules
- Use `fr-FR` (not `fr`) as the French locale code everywhere
- When adding new translation keys, add them on Loco then run `npm run i18n:pull`
- To push local fr.json to Loco: `curl -X POST "https://localise.biz/api/import/json?locale=fr-FR" -H "Authorization: Loco 5jnK3kiLU6q6FBsIHEqlZvvV58Av8m8Aa" -H "Content-Type: application/json" --data-binary @src/i18n/fr-FR.json`
