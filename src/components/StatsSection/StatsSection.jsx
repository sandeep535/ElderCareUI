import { useApi } from '../../hooks/useApi'
import { fetchDashboardStats } from '../../api/endpoints'
import { StatCardSkeleton } from '../Skeletons/Skeletons'
import { ErrorState } from '../UI/UI'
import './StatsSection.css'

const STAT_CONFIG = [
  {
    key: 'totalPatients',
    label: 'Total Patients',
    change: 'All registered patients',
    type: 'primary',
    changeClass: 'positive',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 21V19C6 17.9391 6.42143 16.9217 7.17157 16.1716C7.92172 15.4214 8.93913 15 10 15H14C15.0609 15 16.0783 15.4214 16.8284 16.1716C17.5786 16.9217 18 17.9391 18 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    key: 'unresolvedAlerts',
    label: 'Unresolved Alerts',
    change: 'Require attention',
    type: 'warning',
    changeClass: 'warning',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M10.29 3.86L1.82 18C1.645 18.302 1.553 18.645 1.552 18.995C1.551 19.344 1.642 19.687 1.814 19.99C1.987 20.294 2.237 20.547 2.538 20.724C2.839 20.901 3.181 20.996 3.53 21H20.47C20.819 20.996 21.161 20.901 21.462 20.724C21.763 20.547 22.013 20.294 22.186 19.99C22.358 19.687 22.449 19.344 22.448 18.995C22.447 18.645 22.355 18.302 22.18 18L13.71 3.86C13.532 3.566 13.281 3.323 12.981 3.154C12.682 2.986 12.344 2.897 12 2.897C11.656 2.897 11.318 2.986 11.019 3.154C10.719 3.323 10.468 3.566 10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 9V13M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    key: 'completedToday',
    label: 'Completed Today',
    change: 'On track',
    type: 'success',
    changeClass: 'positive',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    key: 'pendingTasks',
    label: 'Pending Tasks',
    change: 'Due today',
    type: 'info',
    changeClass: '',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

export default function StatsSection() {
  const { data: stats, loading, error, execute: refetch } = useApi(fetchDashboardStats)

  if (loading) {
    return (
      <div className="stats-grid">
        {[1, 2, 3, 4].map(i => <StatCardSkeleton key={i} />)}
      </div>
    )
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />
  }

  return (
    <div className="stats-grid">
      {STAT_CONFIG.map(s => (
        <div key={s.key} className="stat-card">
          <div className={`stat-icon stat-icon-${s.type}`}>{s.icon}</div>
          <div className="stat-content">
            <h3 className="stat-label">{s.label}</h3>
            <p className="stat-value">{stats?.[s.key] ?? '--'}</p>
            <span className={`stat-change${s.changeClass ? ` ${s.changeClass}` : ''}`}>
              {s.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
