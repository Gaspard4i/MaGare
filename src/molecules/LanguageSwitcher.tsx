import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGlobe, faCheck } from '@fortawesome/free-solid-svg-icons'
import { availableLocales, changeLocale } from '../i18n'

/** Get native language name using Intl.DisplayNames, e.g. "fr-FR" → "Français (France)" */
function nativeName(code: string): string {
  try {
    const lang = code.split('-')[0]
    const dn = new Intl.DisplayNames([lang], { type: 'language' })
    const name = dn.of(code)
    if (name) return name.charAt(0).toUpperCase() + name.slice(1)
  } catch { /* fallback */ }
  return code
}

interface Props {
  /** "card" = full settings card, "compact" = small nav button with dropdown */
  variant?: 'card' | 'compact'
}

export default function LanguageSwitcher({ variant = 'card' }: Props) {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleChange = (code: string) => {
    if (code === i18n.language) { setOpen(false); return }
    changeLocale(code)
    setOpen(false)
  }

  const currentName = nativeName(i18n.language)

  if (variant === 'compact') {
    return (
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-sm text-primary-content/70 hover:text-primary-content hover:bg-primary-content/10 transition-colors"
          title={currentName}
        >
          <FontAwesomeIcon icon={faGlobe} size="sm" />
          <span className="hidden xl:inline text-xs font-medium uppercase">{i18n.language.split('-')[0]}</span>
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1 bg-base-100 rounded-xl shadow-xl border border-base-300 py-1 min-w-[160px] z-50">
            {availableLocales.map(code => (
              <button
                key={code}
                onClick={() => handleChange(code)}
                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-base-200 transition-colors ${
                  code === i18n.language ? 'text-primary font-semibold' : 'text-base-content'
                }`}
              >
                <span className="flex-1">{nativeName(code)}</span>
                {code === i18n.language && <FontAwesomeIcon icon={faCheck} size="xs" className="text-primary" />}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Card variant for Settings page
  return (
    <div className="card bg-base-100 shadow-sm border border-base-300 hover:shadow-md transition-shadow">
      <div className="card-body p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">
              <FontAwesomeIcon icon={faGlobe} className="text-primary" />
            </div>
            <div>
              <div className="font-semibold text-base-content text-sm">Langue</div>
              <div className="text-base-content/50 text-xs">{currentName}</div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {availableLocales.map(code => (
            <button
              key={code}
              onClick={() => handleChange(code)}
              className={`btn btn-sm ${
                code === i18n.language
                  ? 'btn-primary'
                  : 'btn-ghost border border-base-300'
              }`}
            >
              {nativeName(code)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
