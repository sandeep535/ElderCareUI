import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useSetPageTitle } from '../../hooks/useSetPageTitle'
import StatsSection from '../../components/StatsSection/StatsSection'
import PatientList from '../../components/PatientList/PatientList'
import AlertsSection from '../../components/AlertsSection/AlertsSection'
import RecordVitalsModal from '../../components/RecordVitalsModal/RecordVitalsModal'
import ClinicalNoteModal from '../../components/ClinicalNoteModal/ClinicalNoteModal'
import './NurseDashboard.css'
import '../../components/UI/UI.css'
import '../../components/UI/Form.css'

const QUICK_ACTIONS = [
  { label: 'Record Vitals', key: 'vitals', icon: <svg viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { label: 'Add Notes',     key: 'notes',  icon: <svg viewBox="0 0 24 24" fill="none"><path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { label: 'Upload Photo',  key: 'photo',  icon: <svg viewBox="0 0 24 24" fill="none"><path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H17.5C18.163 17 18.7989 17.2634 19.2678 17.7322C19.7366 18.2011 20 18.837 20 19.5C20 20.163 19.7366 20.7989 19.2678 21.2678C18.7989 21.7366 18.163 22 17.5 22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 9L12 4L17 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 4V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { label: 'View Location', key: 'location', icon: <svg viewBox="0 0 24 24" fill="none"><path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
]

export default function NurseDashboard() {
  const [searchParams]  = useSearchParams()
  const isPatientsView  = searchParams.get('view') === 'patients'
  const [showVitals, setShowVitals] = useState(false)
  const [showNote,   setShowNote]   = useState(false)

  const handleActionClick = (key) => {
    if (key === 'vitals') setShowVitals(true)
    if (key === 'notes')  setShowNote(true)
  }

  return (
    <>
      {isPatientsView ? (
        <PatientList />
      ) : (
        <>
          <StatsSection />
          <div className="nurse-dashboard-grid">
            <PatientList />
            <div className="nurse-dashboard-sidebar-content">
              <AlertsSection />
              <div className="quick-actions-section">
                <div className="quick-actions-header">
                  <h2 className="quick-actions-title">Quick Actions</h2>
                </div>
                <div className="actions-grid">
                  {QUICK_ACTIONS.map(a => (
                    <button key={a.key} className="action-btn" onClick={() => handleActionClick(a.key)}>
                      {a.icon}
                      <span>{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {showVitals && <RecordVitalsModal onClose={() => setShowVitals(false)} onSave={() => {}} />}
      {showNote   && <ClinicalNoteModal onClose={() => setShowNote(false)}   onSave={() => {}} />}
    </>
  )
}
