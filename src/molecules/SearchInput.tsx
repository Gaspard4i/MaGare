import { useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons'

interface Props {
  value: string
  onChange: (v: string) => void
  onClear: () => void
  onFocus?: () => void
  loading?: boolean
  placeholder?: string
  autoFocus?: boolean
  variant?: 'dark' | 'light'
}

export default function SearchInput({ value, onChange, onClear, onFocus, loading, placeholder = 'Rechercher une gare...', autoFocus, variant = 'dark' }: Props) {
  const ref = useRef<HTMLInputElement>(null)

  const styles = variant === 'light'
    ? {
        icon: 'text-base-content/40',
        input: 'w-full pl-10 pr-9 py-2.5 rounded-xl bg-base-100 border border-base-300 text-base-content placeholder-base-content/40 focus:outline-none focus:border-info focus:ring-1 focus:ring-info/30 transition-all text-sm',
        spinner: 'text-base-content/60',
        clear: 'text-base-content/40 hover:text-base-content',
      }
    : {
        icon: 'text-primary-content/40',
        input: 'w-full pl-10 pr-9 py-2.5 rounded-xl bg-primary-content/10 border border-primary-content/20 text-primary-content placeholder-primary-content/40 focus:outline-none focus:border-primary-content/50 focus:bg-primary-content/15 transition-all text-sm',
        spinner: 'text-primary-content/60',
        clear: 'text-primary-content/40 hover:text-primary-content',
      }

  return (
    <div className="relative flex items-center">
      <FontAwesomeIcon icon={faSearch} className={`absolute left-3.5 z-10 pointer-events-none ${styles.icon}`} size="sm" />
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={styles.input}
      />
      {loading && (
        <span className={`absolute right-3 loading loading-spinner loading-xs z-10 ${styles.spinner}`} />
      )}
      {!loading && value && (
        <button onClick={onClear} className={`absolute right-3 z-10 transition-colors ${styles.clear}`}>
          <FontAwesomeIcon icon={faTimes} size="xs" />
        </button>
      )}
    </div>
  )
}
