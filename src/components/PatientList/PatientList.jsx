import { useApi, useMutation } from '../../hooks/useApi'
import { fetchPatients, createPatient, fetchLatestVitals } from '../../api/endpoints'
import PatientCard from '../PatientCard/PatientCard'
import AddPatientModal from '../AddPatientModal/AddPatientModal'
import { PatientCardSkeleton } from '../Skeletons/Skeletons'
import { ErrorState } from '../UI/UI'
import { useState, useEffect } from 'react'
import './PatientList.css'

export default function PatientList() {
  const [showAddPatient,      setShowAddPatient]      = useState(false)
  const [completePatientData,  setCompletePatientData] = useState(null)
  const [showDraft,      setShowDraft]      = useState(false)

  const {
    data: rawPatients,
    loading,
    error,
    execute: refetch,
    setData: setPatients,
  } = useApi(fetchPatients)

  const [vitalsMap, setVitalsMap] = useState({})

  useEffect(() => {
    if (!rawPatients?.length) return
    rawPatients.forEach(p => {
      fetchLatestVitals(p.id)
        .then(res => {
          const v = res?.data !== undefined ? res.data : res
          if (!v) return
          setVitalsMap(prev => ({
            ...prev,
            [p.id]: {
              bp:        v.systolic && v.diastolic ? `${v.systolic}/${v.diastolic}` : '--/--',
              hr:        v.hr   ? `${v.hr} bpm` : '-- bpm',
              temp:      v.temp ? `${v.temp}°F`  : '--°F',
              spo2:      v.spo2 ? `${v.spo2}%`   : '--%',
              updatedAt: v.recordedAt ? new Date(v.recordedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A',
            }
          }))
        })
        .catch(() => {})
    })
  }, [rawPatients])

  // normalize real API response to UI shape
  const patients = rawPatients?.map(p => ({
    ...p,
    name:   `${p.firstName} ${p.lastName}`,
    status: p.status || 'stable',
    vitals: vitalsMap[p.id] || { bp: '--/--', hr: '-- bpm', temp: '--°F', spo2: '--%', updatedAt: 'N/A' },
  }))

  const { mutate: addPatient, loading: addingPatient } = useMutation(createPatient)

  const handleAddPatient = async (data) => {
    const newPatient = await addPatient(data)
    if (newPatient) {
      setShowAddPatient(false)
      refetch()
    }
  }

  // filter based on toggle — show draft (INCOMPLETE) or completed only
  const filteredPatients = patients?.filter(p =>
    showDraft
      ? p.completionStatus === 'INCOMPLETE'
      : p.completionStatus !== 'INCOMPLETE'
  )

  const draftCount = patients?.filter(p => p.completionStatus === 'INCOMPLETE').length || 0

  return (
    <>
      <div className="patient-list-section">
        <div className="patient-list-header">
          <h2 className="patient-list-title">Patients</h2>
          <div className="patient-list-actions">
            {/* Draft Toggle */}
            <button
              className={`btn-draft-toggle${showDraft ? ' active' : ''}`}
              onClick={() => setShowDraft(p => !p)}
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Draft Patients
              {draftCount > 0 && <span className="draft-count">{draftCount}</span>}
            </button>

            <button className="btn-primary btn-sm" onClick={() => setShowAddPatient(true)}>
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Add Patient
            </button>
          </div>
        </div>

        <div className="patient-list-body">
          {loading && [1, 2, 3].map(i => <PatientCardSkeleton key={i} />)}

          {error && <ErrorState message={error} onRetry={refetch} />}

          {!loading && !error && filteredPatients?.length === 0 && (
            <div className="patient-list-empty">
              <p>{showDraft ? 'No draft patients found.' : 'No completed patients found.'}</p>
            </div>
          )}

          {!loading && !error && filteredPatients?.map(patient => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onCompleteProfile={(p) => setCompletePatientData(p)}
            />
          ))}
        </div>
      </div>

      {showAddPatient && (
        <AddPatientModal
          onClose={() => setShowAddPatient(false)}
          onSave={handleAddPatient}
          loading={addingPatient}
        />
      )}

      {completePatientData && (
        <AddPatientModal
          onClose={() => setCompletePatientData(null)}
          onSave={() => { setCompletePatientData(null); refetch() }}
          patientData={completePatientData}
        />
      )}
    </>
  )
}
