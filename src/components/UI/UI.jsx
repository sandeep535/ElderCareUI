import './UI.css'

export function Button({ children, variant = 'primary', size = '', loading = false, onClick, type = 'button', className = '', ...rest }) {
  return (
    <button type={type} className={`btn-${variant}${size ? ` btn-${size}` : ''} ${className}`} onClick={onClick} disabled={loading} {...rest}>
      {loading ? <span className="btn-spinner" /> : children}
    </button>
  )
}

export function StatusBadge({ status }) {
  const map = {
    stable:      { label: 'Stable',      cls: 'status-stable' },
    warning:     { label: 'Monitor',     cls: 'status-warning' },
    critical:    { label: 'Critical',    cls: 'status-critical' },
    observation: { label: 'Observation', cls: 'status-observation' },
    active:      { label: 'Active',      cls: 'status-stable' },
    resolved:    { label: 'Resolved',    cls: 'status-warning' },
    chronic:     { label: 'Chronic',     cls: 'status-critical' },
  }
  const { label, cls } = map[status] || { label: status, cls: '' }
  return <span className={`patient-status ${cls}`}>{label}</span>
}

export function EmptyState({ message = 'No data found' }) {
  return <div className="empty-state"><p className="empty-state-msg">{message}</p></div>
}

export function ErrorState({ message = 'Failed to load data', onRetry }) {
  return (
    <div className="error-state">
      <p className="error-state-msg">{message}</p>
      {onRetry && <button className="btn-primary btn-sm" onClick={onRetry}>Retry</button>}
    </div>
  )
}
