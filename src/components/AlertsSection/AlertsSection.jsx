import { useState, useEffect } from 'react'
import { fetchPagedAlerts } from '../../api/endpoints'
import { AlertSkeleton } from '../Skeletons/Skeletons'
import { ErrorState } from '../UI/UI'
import './AlertsSection.css'

const PRIORITY_STYLE = {
  HIGH:   { cls: 'alert-critical', color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)'   },
  MEDIUM: { cls: 'alert-warning',  color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)'  },
  LOW:    { cls: 'alert-info',     color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.2)'  },
}
const getStyle = (p) => PRIORITY_STYLE[p] || PRIORITY_STYLE.LOW

const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M10.29 3.86L1.82 18C1.645 18.302 1.553 18.645 1.552 18.995C1.551 19.344 1.642 19.687 1.814 19.99C1.987 20.294 2.237 20.547 2.538 20.724C2.839 20.901 3.181 20.996 3.53 21H20.47C20.819 20.996 21.161 20.901 21.462 20.724C21.763 20.547 22.013 20.294 22.186 19.99C22.358 19.687 22.449 19.344 22.448 18.995C22.447 18.645 22.355 18.302 22.18 18L13.71 3.86C13.532 3.566 13.281 3.323 12.981 3.154C12.682 2.986 12.344 2.897 12 2.897C11.656 2.897 11.318 2.986 11.019 3.154C10.719 3.323 10.468 3.566 10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 9V13M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

function AllAlertsModal({ onClose }) {
  const [page,       setPage]       = useState(0)
  const [data,       setData]       = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [filterPri,  setFilterPri]  = useState('ALL')

  const load = (p) => {
    setLoading(true)
    setError('')
    fetchPagedAlerts(p, 10)
      .then(res => { setData(res); setPage(p) })
      .catch(() => setError('Failed to load alerts'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(0) }, [])

  const allAlerts      = data?.content || []
  const totalPages     = data?.totalPages || 0
  const totalElements  = data?.totalElements || 0
  const highCount      = allAlerts.filter(a => a.priority === 'HIGH').length
  const medCount       = allAlerts.filter(a => a.priority === 'MEDIUM').length

  const filtered = filterPri === 'ALL' ? allAlerts : allAlerts.filter(a => a.priority === filterPri)

  const FILTERS = [
    { key: 'ALL',    label: 'All',    color: 'var(--color-navy)' },
    { key: 'HIGH',   label: 'High',   color: '#EF4444' },
    { key: 'MEDIUM', label: 'Medium', color: '#F59E0B' },
    { key: 'LOW',    label: 'Low',    color: '#3B82F6' },
  ]

  return (
    <div className="alerts-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="alerts-modal-panel">

        {/* Header */}
        <div className="alerts-modal-header">
          <div className="alerts-modal-header-left">
            <div className="alerts-modal-icon">
              <svg viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18C1.645 18.302 1.553 18.645 1.552 18.995C1.551 19.344 1.642 19.687 1.814 19.99C1.987 20.294 2.237 20.547 2.538 20.724C2.839 20.901 3.181 20.996 3.53 21H20.47C20.819 20.996 21.161 20.901 21.462 20.724C21.763 20.547 22.013 20.294 22.186 19.99C22.358 19.687 22.449 19.344 22.448 18.995C22.447 18.645 22.355 18.302 22.18 18L13.71 3.86C13.532 3.566 13.281 3.323 12.981 3.154C12.682 2.986 12.344 2.897 12 2.897C11.656 2.897 11.318 2.986 11.019 3.154C10.719 3.323 10.468 3.566 10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 9V13M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <h2 className="alerts-modal-title">Medical Alerts</h2>
              <p className="alerts-modal-subtitle">{totalElements} unresolved alerts across all patients</p>
            </div>
          </div>
          <button className="alerts-modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        {/* Stats bar */}
        <div className="alerts-modal-stats">
          <div className="alerts-stat-card" style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}>
            <span className="alerts-stat-value" style={{ color: '#EF4444' }}>{highCount}</span>
            <span className="alerts-stat-label">High Priority</span>
          </div>
          <div className="alerts-stat-card" style={{ borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.05)' }}>
            <span className="alerts-stat-value" style={{ color: '#F59E0B' }}>{medCount}</span>
            <span className="alerts-stat-label">Medium Priority</span>
          </div>
          <div className="alerts-stat-card" style={{ borderColor: 'rgba(0,151,167,0.3)', background: 'rgba(0,151,167,0.05)' }}>
            <span className="alerts-stat-value" style={{ color: 'var(--color-primary)' }}>{totalElements}</span>
            <span className="alerts-stat-label">Total Alerts</span>
          </div>
          <div className="alerts-stat-card" style={{ borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.05)' }}>
            <span className="alerts-stat-value" style={{ color: '#10B981' }}>{totalPages}</span>
            <span className="alerts-stat-label">Pages</span>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="alerts-modal-filters">
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`alerts-filter-btn${filterPri === f.key ? ' active' : ''}`}
              style={filterPri === f.key ? { borderColor: f.color, color: f.color, background: `${f.color}15` } : {}}
              onClick={() => setFilterPri(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="alerts-modal-body">
          {loading && <div style={{ padding: 32, display: 'flex', justifyContent: 'center' }}><span className="btn-spinner" style={{ width: 28, height: 28, borderTopColor: 'var(--color-primary)', borderColor: 'var(--color-gray-light)', borderWidth: 3 }} /></div>}
          {error   && <div style={{ padding: 24 }}><ErrorState message={error} onRetry={() => load(page)} /></div>}
          {!loading && !error && (
            <table className="alerts-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Patient</th>
                  <th>Alert</th>
                  <th>Value</th>
                  <th>Reason</th>
                  <th>Type</th>
                  <th>Priority</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--color-gray)', padding: 32 }}>No alerts found</td></tr>
                ) : filtered.map((a, i) => {
                  const s = getStyle(a.priority)
                  return (
                    <tr key={a.id}>
                      <td style={{ color: 'var(--color-gray)', fontSize: '0.8125rem' }}>{page * 10 + i + 1}</td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--color-navy)', display: 'block', fontSize: '0.875rem' }}>{a.patientName}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-gray)' }}>{a.patientId}</span>
                      </td>
                      <td style={{ fontWeight: 600, fontSize: '0.875rem' }}>{a.name}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: s.color, fontSize: '1rem', fontFamily: 'var(--font-heading)' }}>{a.value}</span>
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--color-gray)', maxWidth: 200 }}>{a.reason}</td>
                      <td>
                        <span style={{ fontSize: '0.75rem', background: 'var(--color-off-white)', padding: '3px 10px', borderRadius: 999, fontWeight: 500, border: '1px solid var(--color-gray-light)' }}>
                          {a.typeOfScreen}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: 999, color: s.color, background: s.bg, border: `1px solid ${s.border}`, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
                          {a.priority}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--color-gray)', whiteSpace: 'nowrap' }}>
                        {new Date(a.createdOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination footer */}
        <div className="alerts-modal-footer">
          <span className="alerts-page-info">Page {page + 1} of {totalPages} &nbsp;·&nbsp; {totalElements} total alerts</span>
          <div className="alerts-page-controls">
            <button className="alerts-page-btn" onClick={() => load(0)} disabled={loading || page === 0}>
              «
            </button>
            <button className="alerts-page-btn" onClick={() => load(page - 1)} disabled={loading || page === 0}>
              ‹ Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = page < 3 ? i : page - 2 + i
              if (p >= totalPages) return null
              return (
                <button key={p} className={`alerts-page-btn${p === page ? ' active' : ''}`} onClick={() => load(p)} disabled={loading}>
                  {p + 1}
                </button>
              )
            })}
            <button className="alerts-page-btn" onClick={() => load(page + 1)} disabled={loading || page >= totalPages - 1}>
              Next ›
            </button>
            <button className="alerts-page-btn" onClick={() => load(totalPages - 1)} disabled={loading || page >= totalPages - 1}>
              »
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default function AlertsSection() {
  const [alerts,  setAlerts]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    fetchPagedAlerts(0, 5)
      .then(res => setAlerts(res?.content || []))
      .catch(() => setError('Failed to load alerts'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <div className="alerts-section">
        <div className="alerts-section-header">
          <h2 className="alerts-section-title">Alerts</h2>
          {alerts.length > 0 && <span className="alert-count">{alerts.length}</span>}
        </div>
        <div className="alerts-list">
          {loading && [1,2,3].map(i => <AlertSkeleton key={i} />)}
          {error   && <ErrorState message={error} />}
          {!loading && !error && alerts.map(a => {
            const s = getStyle(a.priority)
            return (
              <div key={a.id} className={`alert-item ${s.cls}`}>
                <div className="alert-icon"><AlertIcon /></div>
                <div className="alert-content">
                  <h4 className="alert-title">{a.patientName} — {a.name}: {a.value}</h4>
                  <p className="alert-description">{a.reason}</p>
                  <span className="alert-time">{a.typeOfScreen} · {new Date(a.createdOn).toLocaleDateString()}</span>
                </div>
              </div>
            )
          })}
          {!loading && !error && (
            <button className="btn-view-all" style={{ width: '100%', marginTop: 4 }} onClick={() => setShowAll(true)}>
              View All Alerts
            </button>
          )}
        </div>
      </div>
      {showAll && <AllAlertsModal onClose={() => setShowAll(false)} />}
    </>
  )
}
