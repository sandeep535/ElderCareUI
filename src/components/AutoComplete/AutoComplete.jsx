import { useState, useRef, useEffect } from 'react'
import './AutoComplete.css'

/**
 * AutoComplete
 * @param {string}   value        - current input value
 * @param {Function} onChange     - called with selected display string
 * @param {Array}    options      - [{ label, sublabel, value }]
 * @param {string}   placeholder
 * @param {string}   className
 */
export default function AutoComplete({ value = '', onChange, options = [], placeholder = '', className = '' }) {
  const [query,       setQuery]       = useState(value)
  const [open,        setOpen]        = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const wrapperRef = useRef(null)

  // sync external value changes
  useEffect(() => { setQuery(value) }, [value])

  // close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(query.toLowerCase())
  )

  const handleInput = (e) => {
    setQuery(e.target.value)
    setOpen(true)
    setHighlighted(-1)
    onChange(e.target.value, null)
  }

  const handleSelect = (opt) => {
    setQuery(opt.label)
    onChange(opt.label, opt)
    setOpen(false)
  }

  const handleKeyDown = (e) => {
    if (!open) return
    if (e.key === 'ArrowDown') {
      setHighlighted(h => Math.min(h + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      setHighlighted(h => Math.max(h - 1, 0))
    } else if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault()
      handleSelect(filtered[highlighted])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="autocomplete-wrapper" ref={wrapperRef}>
      <input
        type="text"
        className={`form-input ${className}`}
        value={query}
        placeholder={placeholder}
        onChange={handleInput}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />
      {open && query.length > 0 && (
        <div className="autocomplete-dropdown">
          {filtered.length === 0 ? (
            <div className="autocomplete-empty">No results found</div>
          ) : (
            filtered.map((opt, i) => (
              <div
                key={opt.value}
                className={`autocomplete-item${highlighted === i ? ' highlighted' : ''}`}
                onMouseDown={() => handleSelect(opt)}
              >
                <span className="autocomplete-item-name">{opt.label}</span>
                {opt.sublabel && <span className="autocomplete-item-meta">{opt.sublabel}</span>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
