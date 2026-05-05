import { useState, useEffect } from 'react'
import { apiGet } from '../../api/apiService'
import './RecentActivity.css'

const TYPE_CONFIG = {
  VITAL:          { label: 'Vital Signs Recorded', cls: 'activity-icon-vital' },
  CLINICAL_NOTE:  { label: 'Clinical Note Added',  cls: 'activity-icon-note' },
  DIAGNOSIS:      { label: 'Diagnosis Added',      cls: 'activity-icon-diagnosis' },
  MEDICAL_HISTORY:{ label: 'Medical History Added',cls: 'activity-icon-surgery' },
  NOTES:          { label: 'Note Added',           cls: 'activity-icon-note' },
  MEDICATION:     { label: 'Medication Added',     cls: 'activity-icon-medication' },
}

const getConfig = (type) => TYPE_CONFIG[type] || { label: type, cls: 'activity-icon-vital' }

const getDescription = (type, data) => {
  if (!data) return '--'
  if (type === 'VITAL')
    return `BP: ${data.systolic ?? '--'}/${data.diastolic ?? '--'}, HR: ${data.hr ?? '--'} bpm, Temp: ${data.temp ?? '--'}°F, SpO₂: ${data.spo2 ?? '--'}%`
  if (type === 'CLINICAL_NOTE') return data.notes || data.noteTitle || '--'
  if (type === 'DIAGNOSIS')     return data.diagnosisName || '--'
  if (type === 'MEDICAL_HISTORY') return data.surgeryName || '--'
  if (type === 'NOTES')         return data.notes || '--'
  return data.name || data.title || '--'
}

const formatTime = (dt) => {
  if (!dt) return '--'
  const now = new Date()
  const then = new Date(dt)
  const diffMs = now - then
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1)   return 'just now'
  if (diffMins < 60)  return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7)   return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return then.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
}

function ActivityIcon({ type }) {
  if (type === 'VITAL') return (
    <svg viewBox="0 0 24 24" fill="none"><path d="M12 2V6M12 18V22M6 12H2M22 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  )
  if (type === 'CLINICAL_NOTE' || type === 'NOTES') return (
    <svg viewBox="0 0 24 24" fill="none"><path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  )
  if (type === 'DIAGNOSIS') return (
    <svg viewBox="0 0 24 24" fill="none"><path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  )
  if (type === 'MEDICAL_HISTORY' || type === 'SURGERY') return (
    <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 3V9M15 3V9M3 15H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  )
  return (
    <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 3V9M15 3V9M3 15H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  )
}

function ActivityItem({ item }) {
  const type = item.typeScreen || item.type
  const data = (() => { try { return JSON.parse(item.dataJson) } catch { return null } })()
  const cfg  = getConfig(type)
  return (
    <div className="activity-item">
      <div className={`activity-icon ${cfg.cls}`}>
        <ActivityIcon type={type} />
      </div>
      <div className="activity-content">
        <h4 className="activity-title">{cfg.label}</h4>
        <p className="activity-description">{getDescription(type, data)}</p>
        <span className="activity-time">{formatTime(item.createdOn)}</span>
      </div>
    </div>
  )
}

const today = () => new Date().toISOString().split('T')[0]
const monthAgo = () => {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return d.toISOString().split('T')[0]
}

function AuditRangeModal({ patientId, onClose }) {
  const [from,    setFrom]    = useState(monthAgo())
  const [to,      setTo]      = useState(today())
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const load = () => {
    setLoading(true)
    setError('')
    apiGet(`/patients/${patientId}/audit/range`, { from, to })
      .then(res => setItems(Array.isArray(res) ? res : (res?.data || [])))
      .catch(() => setError('Failed to load activity'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-container modal-large">
        <div className="modal-header">
          <h2 className="modal-title">Activity History</h2>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
        <div className="modal-body">
          <div className="ra-range-filters">
            <div className="ra-range-field">
              <label className="form-label">From</label>
              <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="form-input" />
            </div>
            <div className="ra-range-field">
              <label className="form-label">To</label>
              <input type="date" value={to} onChange={e => setTo(e.target.value)} className="form-input" />
            </div>
            <button className="btn-primary" onClick={load}>Search</button>
          </div>
          {loading && (
            <div className="ra-loading">
              <span className="btn-spinner" style={{ borderTopColor: 'var(--color-primary)', borderColor: 'rgba(0,151,167,0.2)' }} />
              Loading...
            </div>
          )}
          {error && <div className="ra-error">{error}</div>}
          {!loading && !error && (
            items.length === 0
              ? <p className="ra-empty">No activity found for this period.</p>
              : <div className="activity-timeline">
                  {items.map((item, i) => <ActivityItem key={item.id || i} item={item} />)}
                </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

export default function RecentActivity({ patientId }) {
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    if (!patientId) return
    apiGet(`/patients/${patientId}/audit/last`, { count: 3 })
      .then(res => setItems(Array.isArray(res) ? res : (res?.data || [])))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [patientId])

  return (
    <>
      <div className="emr-card">
        <div className="emr-card-header">
          <h3 className="emr-card-title">Recent Activity</h3>
          <button className="btn-view-all" onClick={() => setShowAll(true)}>View All</button>
        </div>
        <div className="emr-card-body">
          {loading ? (
            <div className="ra-loading">
              <span className="btn-spinner" style={{ borderTopColor: 'var(--color-primary)', borderColor: 'rgba(0,151,167,0.2)' }} />
              Loading...
            </div>
          ) : items.length === 0 ? (
            <p className="ra-empty">No recent activity.</p>
          ) : (
            <div className="activity-timeline">
              {items.map((item, i) => <ActivityItem key={item.id || i} item={item} />)}
            </div>
          )}
        </div>
      </div>
      {showAll && <AuditRangeModal patientId={patientId} onClose={() => setShowAll(false)} />}
    </>
  )
}
