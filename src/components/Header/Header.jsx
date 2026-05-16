import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Header.css'

export default function Header({ title, subtitle, showBack = false, onMenuClick }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <header className="dashboard-header">
      <div className="header-left">
        {/* Hamburger — mobile only */}
        <button className="header-menu-btn" onClick={onMenuClick}>
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {showBack && (
          <button className="btn-back" onClick={() => navigate(-1)}>
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
        )}
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
      </div>

      <div className="header-right">
        <button className="header-btn notification-btn">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M18 8A6 6 0 0 0 6 8C6 11.3137 9 12 9 12C9 12 12 11.3137 12 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 12L9 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15 12L15 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 16C9 17.6569 10.3431 19 12 19C13.6569 19 15 17.6569 15 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="notification-badge">3</span>
        </button>
        <div className="user-profile">
          <div className="profile-avatar">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 21V19C6 17.9391 6.42143 16.9217 7.17157 16.1716C7.92172 15.4214 8.93913 15 10 15H14C15.0609 15 16.0783 15.4214 16.8284 16.1716C17.5786 16.9217 18 17.9391 18 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="profile-info">
            <span className="profile-name">{user?.name || user?.username || 'User'}</span>
            <span className="profile-role">{user?.role || 'Nurse'}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
