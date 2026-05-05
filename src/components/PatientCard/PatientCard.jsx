import { useNavigate } from 'react-router-dom'
import { StatusBadge } from '../UI/UI'
import './PatientCard.css'

const VITALS = [
  { key: 'bp',   label: 'BP' },
  { key: 'hr',   label: 'HR' },
  { key: 'temp', label: 'Temp' },
  { key: 'spo2', label: 'SpO₂' },
]

const SECTION_LABELS = {
  MEDICAL:   'Medical',
  ADMISSION: 'Admission',
  NOTES:     'Notes',
  NOK:       'NOK',
}

export default function PatientCard({ patient, onCompleteProfile }) {
  const navigate  = useNavigate()
  const isDraft   = patient.completionStatus === 'INCOMPLETE'
  const fullName  = patient.name || `${patient.firstName} ${patient.lastName}`
  const patientId = patient.patientId || patient.id

  const getVitalClass = (key) => {
    if (patient.status === 'critical') return 'critical'
    if (patient.status === 'warning' && key === 'bp') return 'warning'
    return ''
  }

  const handleAction = () => {
    if (isDraft) {
      onCompleteProfile?.(patient)
    } else {
      navigate(`/patient/${patient.id}`)
    }
  }

  return (
    <div className={`patient-card${isDraft ? ' patient-card-draft' : ''}`}>
      <div className="patient-card-header">
        <div className="patient-card-info">
          <div className="patient-name-row">
            <h3 className="patient-name">{fullName}</h3>
            {isDraft && <span className="badge-draft">Draft</span>}
          </div>
          <span className="patient-id">ID: {patientId}</span>
        </div>
        {!isDraft && <StatusBadge status={patient.status} />}
      </div>

      {/* Pending sections for draft patients */}
      {isDraft && patient.pendingSections?.length > 0 && (
        <div className="pending-sections">
          <span className="pending-label">Pending:</span>
          {patient.pendingSections.map(s => (
            <span key={s} className="pending-tag">{SECTION_LABELS[s] || s}</span>
          ))}
        </div>
      )}

      {/* Vitals — only for completed patients */}
      {!isDraft && (
        <div className="patient-vitals">
          {VITALS.map(({ key, label }) => (
            <div key={key} className="vital-stat">
              <span className="vital-stat-label">{label}</span>
              <span className={`vital-stat-value ${getVitalClass(key)}`}>
                {patient.vitals?.[key] ?? '--'}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="patient-card-footer">
        <span className="last-updated">
          {isDraft ? 'Incomplete profile' : `Last updated: ${patient.vitals?.updatedAt}`}
        </span>
        <button
          className={`btn-view${patient.status === 'critical' ? ' urgent' : ''}${isDraft ? ' draft' : ''}`}
          onClick={handleAction}
        >
          {isDraft ? 'Complete Profile' : 'View Details'}
        </button>
      </div>
    </div>
  )
}
