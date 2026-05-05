import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { loginApi } from '../../api/endpoints'
import './Login.css'

const schema = yup.object({
  username: yup.string().required('Username is required'),
  password: yup.string().min(4, 'Password must be at least 4 characters').required('Password is required'),
})

// All possible role cards
const ALL_ROLES = [
  {
    id: 'nurse',
    roleKey: 'ROLE_NURSE',
    name: 'Nurse',
    description: 'Caregiver access',
    route: '/nurse-dashboard',
    icon: <svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="20" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 38C12 32 17 28 24 28C31 28 36 32 36 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 16L24 12L28 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  {
    id: 'doctor',
    roleKey: 'ROLE_DOCTOR',
    name: 'Doctor',
    description: 'Medical professional',
    route: '/nurse-dashboard',
    icon: <svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="20" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="20" cy="18" r="1.5" fill="currentColor"/><circle cx="28" cy="18" r="1.5" fill="currentColor"/><path d="M20 24C20 24 22 26 24 26C26 26 28 24 28 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  {
    id: 'admin',
    roleKey: 'ROLE_ADMIN',
    name: 'Admin',
    description: 'Administrator',
    route: '/nurse-dashboard',
    icon: <svg viewBox="0 0 48 48" fill="none"><rect x="8" y="8" width="32" height="32" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="12" y="14" width="8" height="6" rx="1" fill="currentColor" opacity="0.3"/><rect x="22" y="14" width="8" height="6" rx="1" fill="currentColor" opacity="0.3"/><rect x="12" y="24" width="12" height="6" rx="1" fill="currentColor" opacity="0.3"/></svg>,
  },
  {
    id: 'nok',
    roleKey: 'ROLE_NOK',
    name: 'NOK',
    description: 'Next of Kin',
    route: '/nurse-dashboard',
    icon: <svg viewBox="0 0 48 48" fill="none"><circle cx="18" cy="18" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="30" cy="18" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 38C6 34 9 32 12 32C15 32 18 34 18 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M30 38C30 34 33 32 36 32C39 32 42 34 42 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
]

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [showRoles,    setShowRoles]    = useState(false)
  const [apiError,     setApiError]     = useState('')
  const [loading,      setLoading]      = useState(false)
  const [filteredRoles, setFilteredRoles] = useState([])
  const navigate = useNavigate()
  const { login } = useAuth()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data) => {
    setApiError('')
    setLoading(true)
    try {
      const res = await loginApi({ username: data.username, password: data.password })
      login(res)
      // filter role cards based on roles array from API response
      const matched = ALL_ROLES.filter(r => res.roles?.includes(r.roleKey))
      // if only one role → skip role selection, navigate directly
      if (matched.length === 1) {
        navigate(matched[0].route)
      } else {
        setFilteredRoles(matched.length > 0 ? matched : ALL_ROLES)
        setShowRoles(true)
      }
    } catch (err) {
      setApiError(err?.message || 'Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleSelect = (role) => navigate(role.route)

  return (
    <div className="login-page">
      <div className="login-container">

        {/* Left Branding */}
        <div className="login-branding">
          <div className="branding-content">
            <a href="#" className="login-logo">
              <img src="/VeoHome.png" alt="VeoHome" className="login-logo-icon" />
            </a>
            <h1 className="branding-title">Digitizing Care, Strengthening Connection</h1>
          </div>
        </div>

        {/* Right Form */}
        <div className="login-form-container">
          <div className="login-form-wrapper">
            {!showRoles ? (
              <>
                <div className="login-header">
                  <h2 className="login-title">Welcome Back</h2>
                  <p className="login-subtitle">Sign in to access your VeoHome dashboard</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <div className="input-wrapper">
                      <svg className="input-icon" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <input
                        type="text"
                        className={`form-input${errors.username ? ' input-error' : ''}`}
                        placeholder="Enter your username"
                        autoComplete="username"
                        {...register('username')}
                      />
                    </div>
                    {errors.username && <span className="error-msg">{errors.username.message}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <div className="input-wrapper">
                      <svg className="input-icon" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className={`form-input${errors.password ? ' input-error' : ''}`}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        {...register('password')}
                      />
                      <button type="button" className="password-toggle" onClick={() => setShowPassword(p => !p)}>
                        <svg className="eye-icon" viewBox="0 0 24 24" fill="none">
                          <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                    {errors.password && <span className="error-msg">{errors.password.message}</span>}
                  </div>

                  <div className="form-options">
                    <a href="#" className="forgot-password">Forgot password?</a>
                  </div>

                  {apiError && <p className="api-error-msg">{apiError}</p>}

                  <button type="submit" className="btn-login" disabled={loading}>
                    {loading
                      ? <span className="btn-spinner" />
                      : <>
                          <span>Sign In</span>
                          <svg className="btn-icon" viewBox="0 0 24 24" fill="none">
                            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </>
                    }
                  </button>
                </form>

                <div className="login-divider"><span>or</span></div>
                <div className="login-footer">
                  <p className="signup-text">Don&apos;t have an account? <a href="#" className="signup-link">Contact your administrator</a></p>
                </div>
              </>
            ) : (
              <div className="role-selection">
                <div className="role-selection-header">
                  <h2 className="role-title">Select Your Role</h2>
                  <p className="role-subtitle">Choose how you want to access VeoHome</p>
                </div>
                <div className="role-grid">
                  {filteredRoles.map(role => (
                    <button key={role.id} className="role-card" onClick={() => handleRoleSelect(role)}>
                      <div className="role-icon">{role.icon}</div>
                      <h3 className="role-name">{role.name}</h3>
                      <p className="role-description">{role.description}</p>
                    </button>
                  ))}
                </div>
                <div className="login-footer" style={{ marginTop: '1.5rem' }}>
                  <button className="back-link-btn" onClick={() => setShowRoles(false)}>
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Back to Login</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
