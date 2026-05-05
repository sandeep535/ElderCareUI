import './Skeletons.css'

export function StatCardSkeleton() {
  return (
    <div className="skeleton-stat-card">
      <div className="skeleton skeleton-stat-icon" />
      <div className="skeleton-stat-content">
        <div className="skeleton skeleton-stat-label" />
        <div className="skeleton skeleton-stat-value" />
        <div className="skeleton skeleton-stat-change" />
      </div>
    </div>
  )
}

export function PatientCardSkeleton() {
  return (
    <div className="skeleton-patient-card">
      <div className="skeleton-patient-header">
        <div>
          <div className="skeleton skeleton-patient-name" />
          <div className="skeleton skeleton-patient-id" style={{ marginTop: 6 }} />
        </div>
        <div className="skeleton skeleton-patient-badge" />
      </div>
      <div className="skeleton-patient-stats">
        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton skeleton-stat-box" />)}
      </div>
      <div className="skeleton-patient-footer">
        <div className="skeleton skeleton-patient-time" />
        <div className="skeleton skeleton-patient-btn" />
      </div>
    </div>
  )
}

export function AlertSkeleton() {
  return (
    <div className="skeleton-alert-item">
      <div className="skeleton skeleton-alert-icon" />
      <div className="skeleton-alert-content">
        <div className="skeleton skeleton-alert-title" />
        <div className="skeleton skeleton-alert-desc" />
        <div className="skeleton skeleton-alert-time" />
      </div>
    </div>
  )
}

export function PatientBannerSkeleton() {
  return (
    <div className="skeleton-banner">
      <div className="skeleton-banner-content">
        <div className="skeleton skeleton-avatar" />
        <div className="skeleton-banner-info">
          <div className="skeleton skeleton-banner-name" />
          <div className="skeleton-banner-meta">
            {[1, 2, 3].map(i => <div key={i} className="skeleton skeleton-banner-tag" />)}
          </div>
          <div className="skeleton-banner-grid">
            {[1, 2].map(i => <div key={i} className="skeleton skeleton-banner-section" />)}
          </div>
        </div>
        <div className="skeleton skeleton-vitals-box" />
      </div>
    </div>
  )
}

export function VitalsTableSkeleton() {
  return (
    <div>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="skeleton-table-row">
          {[1, 2, 3, 4, 5, 6].map(j => (
            <div key={j} className="skeleton skeleton-table-cell" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function NoteSkeleton() {
  return (
    <div className="skeleton-note">
      <div className="skeleton-note-header">
        <div className="skeleton skeleton-note-author" />
        <div className="skeleton skeleton-note-date" />
      </div>
      <div className="skeleton skeleton-note-line" />
      <div className="skeleton skeleton-note-line" />
      <div className="skeleton skeleton-note-line" />
    </div>
  )
}
