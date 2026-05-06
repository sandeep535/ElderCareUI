import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { StatusBadge, ErrorState } from '../../components/UI/UI'
import { PatientBannerSkeleton, VitalsTableSkeleton, NoteSkeleton } from '../../components/Skeletons/Skeletons'
import RecordVitalsModal from '../../components/RecordVitalsModal/RecordVitalsModal'
import ClinicalNoteModal from '../../components/ClinicalNoteModal/ClinicalNoteModal'
import AddDiagnosisModal from '../../components/AddDiagnosisModal/AddDiagnosisModal'
import AddSurgeryModal from '../../components/AddSurgeryModal/AddSurgeryModal'
import AddMedicationModal from '../../components/AddMedicationModal/AddMedicationModal'
import RecentActivity from '../../components/RecentActivity/RecentActivity'
import { useApi, useMutation } from '../../hooks/useApi'
import {
  fetchPatientById, fetchPatientMedical, fetchPatientAdmission,
  fetchNokByPatientId, fetchVitals, fetchDiagnoses,
  fetchMedications, fetchNotes, fetchSurgeries,
  createVital, createNote, createDiagnosis, createSurgery, createMedication,
  fetchUnresolvedAlerts,
} from '../../api/endpoints'
import './PatientDetail.css'
import '../../components/UI/UI.css'
import '../../components/UI/Form.css'

const TABS = [
  { key: 'overview',    label: 'Overview' },
  { key: 'vitals',      label: 'Vital Signs' },
  { key: 'medications', label: 'Medications' },
  { key: 'notes',       label: 'Clinical Notes' },
  { key: 'history',     label: 'Medical History' },
]

import { getVitalStatus, VITAL_STATUS_COLOR } from '../../utils/vitalsRange'

function VitalCell({ vitalKey, raw, display }) {
  const status = getVitalStatus(vitalKey, raw)
  const c = status ? VITAL_STATUS_COLOR[status] : null
  return (
    <span style={c ? { color: c.color, fontWeight: 600 } : {}}>{display}</span>
  )
}

const normalize = (res) => res?.data !== undefined ? res.data : res

// Calculate relative time (e.g., "5 min ago", "2 hours ago")
const getRelativeTime = (timestamp) => {
  if (!timestamp) return '--'
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now - then
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  
  return new Date(timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
}

// Map API vital response to display shape
const normalizeVital = (v) => {
  const recordedDate = v.recordedAt ? new Date(v.recordedAt) : null
  const formatDate = (date) => {
    if (!date) return '--'
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const mins = String(date.getMinutes()).padStart(2, '0')
    return `${day}-${month}-${year} ${hours}:${mins}`
  }
  return {
    id:          v.id,
    bp:          `${v.systolic}/${v.diastolic}`,
    hr:          `${v.hr} bpm`,
    temp:        `${v.temp}°F`,
    spo2:        `${v.spo2}%`,
    rawSystolic: v.systolic,
    rawHr:       v.hr,
    rawTemp:     v.temp,
    rawSpo2:     v.spo2,
    notes:       v.notes || '',
    hasAlert:    v.hasAlert,
    datetime:    formatDate(recordedDate),
    relativeTime: getRelativeTime(v.recordedAt),
    by:          'Nurse',
  }
}

export default function PatientDetail() {
  const { id } = useParams()
  const [activeTab,     setActiveTab]    = useState('overview')
  const [showVitals,    setShowVitals]   = useState(false)
  const [showNote,      setShowNote]     = useState(false)
  const [showDiagnosis, setShowDiagnosis] = useState(false)
  const [viewDiagnosis, setViewDiagnosis] = useState(null)
  const [showSurgery,    setShowSurgery]    = useState(false)
  const [viewSurgery,    setViewSurgery]    = useState(null)
  const [showMedication, setShowMedication] = useState(false)
  const [viewMedication, setViewMedication] = useState(null)
  const [showAllAlerts, setShowAllAlerts] = useState(false)
  const [alerts,        setAlerts]        = useState([])
  const [patientInfo,   setPatientInfo]  = useState(null)
  const [bannerLoading, setBannerLoading] = useState(true)
  const [bannerError,   setBannerError]  = useState(null)

  // fetch patient + medical + admission + NOK in parallel
  useEffect(() => {
    if (!id) return
    setBannerLoading(true)
    setBannerError(null)
    Promise.all([
      fetchPatientById(id),
      fetchPatientMedical(id).catch(() => null),
      fetchPatientAdmission(id).catch(() => null),
      fetchNokByPatientId(id).catch(() => null),
      fetchUnresolvedAlerts(id).catch(() => []),
    ])
      .then(([patientRes, medicalRes, admissionRes, nokRes, alertsRes]) => {
        const patient   = normalize(patientRes)
        const medical   = normalize(medicalRes)
        const admission = normalize(admissionRes)
        const nok       = normalize(nokRes)
        const alertList = Array.isArray(alertsRes) ? alertsRes : (alertsRes?.data || [])
        setAlerts(alertList)
        setPatientInfo({
          id:               patient.id,
          patientId:        patient.patientId || patient.id,
          firstName:        patient.firstName,
          lastName:         patient.lastName,
          name:             `${patient.firstName} ${patient.lastName}`,
          dob:              patient.dob,
          gender:           patient.gender,
          completionStatus: patient.completionStatus,
          bloodType:        medical?.bloodTypeDisplay || medical?.bloodType || '--',
          allergies:        medical?.allergies        || '--',
          medicalAlerts:    medical?.medicalAlerts    || '--',
          physician:        medical?.primaryPhysicianName || '--',
          nurse:            medical?.nurseName            || '--',
          room:             admission?.roomNumber  || '--',
          bed:              admission?.bed         || '--',
          status:           admission?.statusDisplay || admission?.status || 'stable',
          admissionDate:    admission?.admissionDate || '--',
          nok:              Array.isArray(nok) ? nok : [],
          vitals:           patient.vitals || null,
        })
      })
      .catch(err => setBannerError(err?.message || 'Failed to load patient data'))
      .finally(() => setBannerLoading(false))
  }, [id])

  // tab data
  const { data: rawVitals,    loading: vitalsLoading,      setData: setRawVitals }  = useApi(fetchVitals,      [id])
  const { data: diagnoses,   loading: diagnosesLoading,   setData: setDiagnoses } = useApi(fetchDiagnoses,   [id])
  const { data: medications, loading: medicationsLoading, setData: setMedications, execute: reloadMedications } = useApi(fetchMedications, [id])
  const { data: notes,       loading: notesLoading,       setData: setNotes,     execute: loadNotes } = useApi(fetchNotes, [id], false)
  const { data: surgeries,   loading: surgeriesLoading,   setData: setSurgeries } = useApi(fetchSurgeries,   [id])

  // normalize + sort vitals by createdOn desc (latest first)
  const vitals = rawVitals
    ? [...rawVitals]
        .sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn))
        .map(normalizeVital)
    : null

  const { mutate: saveVital }     = useMutation((data) => createVital(id, data))
  const { mutate: saveNote }      = useMutation((data) => createNote(id, data))
  const { mutate: saveDiagnosis }  = useMutation((data) => createDiagnosis(id, data))
  const { mutate: saveSurgery }    = useMutation((data) => createSurgery(id, data))
  const { mutate: saveMedication } = useMutation((data) => createMedication(id, data))

  const handleSaveVitals    = async (data) => {
    const v = await saveVital(data)
    if (v) {
      setRawVitals(prev => [v, ...(prev || [])])
      setShowVitals(false)
    }
  }
  const handleSaveNote = async (data) => {
    const n = await saveNote(data)
    if (n) {
      setNotes(prev => [n, ...(prev || [])])
    } else {
      throw new Error('Failed to save note')
    }
  }
  const handleSaveDiagnosis = async (data) => {
    const d = await saveDiagnosis(data)
    if (d) {
      setDiagnoses(prev => [...(prev || []), d])
    } else {
      throw new Error('Failed to save diagnosis')
    }
  }
  const handleSaveSurgery = async (data) => {
    const s = await saveSurgery(data)
    if (s) {
      setSurgeries(prev => [...(prev || []), s])
    } else {
      throw new Error('Failed to save surgery')
    }
  }

  const handleTabChange = (key) => {
    setActiveTab(key)
    if (key === 'notes' && !notes) loadNotes(id)
  }

  const currentVitals = vitals?.[0] || patientInfo?.vitals

  return (
    <>
      {/* Patient Banner */}
      {bannerLoading ? <PatientBannerSkeleton /> : bannerError ? <ErrorState message={bannerError} /> : patientInfo && (
        <section className="patient-banner">
          <div className="banner-content">
            <div className="banner-left">
              <div className="banner-left-column">
                <div className="patient-avatar-large">
                  <div className="patient-avatar-placeholder">
                    {patientInfo.firstName?.[0]}{patientInfo.lastName?.[0]}
                  </div>
                </div>
                <div className="banner-section">
                  <h4 className="banner-section-title">Demographics</h4>
                  {[['Gender', patientInfo.gender], ['DOB', patientInfo.dob], ['Blood Type', patientInfo.bloodType], ['Admission', patientInfo.admissionDate]].map(([l, v]) => (
                    <div key={l} className="banner-detail-row">
                      <span className="banner-detail-label">{l}</span>
                      <span className="banner-detail-value">{v || '--'}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="patient-info-main">
                <h2 className="patient-name-large">{patientInfo.name}</h2>
                <div className="patient-meta">
                  <span className="patient-id-badge">ID: {patientInfo.patientId}</span>
                  <StatusBadge status={patientInfo.completionStatus === 'INCOMPLETE' ? 'warning' : 'stable'} />
                </div>
                <div className="banner-sections-grid">
                  <div className="banner-section">
                    <h4 className="banner-section-title">Care Team</h4>
                    {[['Primary Physician', patientInfo.physician], ['Attending Nurse', patientInfo.nurse], ['Room / Bed', `${patientInfo.room} / ${patientInfo.bed}`]].map(([l, v]) => (
                      <div key={l} className="banner-detail-row">
                        <span className="banner-detail-label">{l}</span>
                        <span className="banner-detail-value">{v || '--'}</span>
                      </div>
                    ))}
                  </div>
                  <div className="banner-section">
                    <h4 className="banner-section-title">Medical Alerts</h4>
                    {alerts.length === 0 && (
                      <span style={{ fontSize: '0.8125rem', color: 'var(--color-gray)' }}>No active alerts</span>
                    )}
                    {alerts.slice(0, 1).map(a => (
                      <div key={a.id} className={`banner-alert-item ${a.priority === 'HIGH' ? 'alert-warning' : 'alert-info'}`}>
                        <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontWeight: 600, display: 'block' }}>{a.name}: {a.value}</span>
                          <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>{a.reason}</span>
                        </div>
                      </div>
                    ))}
                    {alerts.length > 1 && (
                      <button
                        onClick={() => setShowAllAlerts(true)}
                        style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0', textAlign: 'left' }}
                      >
                        +{alerts.length - 1} more alert{alerts.length - 1 > 1 ? 's' : ''}
                      </button>
                    )}
                    <div className="banner-detail-row"><span className="banner-detail-label">Medications</span><span className="banner-detail-value">{medications?.length ?? '--'}</span></div>
                    <div className="banner-detail-row"><span className="banner-detail-label">Diagnoses</span><span className="banner-detail-value">{diagnoses?.length ?? '--'}</span></div>
                    <div className="banner-detail-row"><span className="banner-detail-label">NOK</span><span className="banner-detail-value">{patientInfo.nok?.length ?? '--'}</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="banner-right">
              <div className="vital-signs-summary">
                <h3 className="vitals-title">Current Vitals</h3>
                <div className="vitals-grid">
                  {[['BP', currentVitals?.bp], ['HR', currentVitals?.hr], ['Temp', currentVitals?.temp], ['SpO₂', currentVitals?.spo2]].map(([l, v]) => (
                    <div key={l} className="vital-item">
                      <span className="vital-label">{l}</span>
                      <span className="vital-value">{v || '--'}</span>
                    </div>
                  ))}
                </div>
                <div className="vitals-footer">
                  <span className="vitals-updated">{currentVitals?.relativeTime}</span>
                  <button className="btn-record-vitals" onClick={() => setShowVitals(true)}>Record Vitals</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* EMR Tabs */}
      <div className="emr-content">
        <div className="emr-tabs">
          {TABS.map(t => (
            <button key={t.key} className={`emr-tab${activeTab === t.key ? ' active' : ''}`} onClick={() => handleTabChange(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="emr-grid">
            <div className="emr-card">
              <div className="emr-card-header">
                <h3 className="emr-card-title">Active Diagnoses</h3>
                <button className="btn-primary btn-sm" onClick={() => setShowDiagnosis(true)}>
                  <svg viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Add Diagnosis
                </button>
              </div>
              <div className="emr-card-body">
                {diagnosesLoading ? <VitalsTableSkeleton /> : diagnoses?.map((d, i) => (
                  <div key={d.id || i} className="diagnosis-item">
                    <div className="diagnosis-info">
                      <span className="diagnosis-name">{d.diagnosisName}</span>
                      {d.icdCode && <span className="autocomplete-icd">{d.icdCode}</span>}
                    </div>
                    <div className="diagnosis-actions">
                      <span className="diagnosis-date">{d.statusDisplay || d.status}</span>
                      <button className="btn-view-sm" onClick={() => setViewDiagnosis(d)}>
                        <svg viewBox="0 0 24 24" fill="none"><path d="M1 12C1 12 5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/></svg>
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <RecentActivity patientId={id} />
          </div>
        )}

        {activeTab === 'vitals' && (
          <div className="emr-card">
            <div className="emr-card-header">
              <h3 className="emr-card-title">Vital Signs History</h3>
              <button className="btn-primary btn-sm" onClick={() => setShowVitals(true)}>
                <svg viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Record Vitals
              </button>
            </div>
            <div className="emr-card-body">
              {vitalsLoading ? <VitalsTableSkeleton /> : (
                <div className="vitals-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>BP</th>
                        <th>HR</th>
                        <th>Temp</th>
                        <th>SpO₂</th>
                        <th>Alert</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vitals?.map((v, i) => (
                        <tr key={v.id || i}>
                          <td>{v.datetime}</td>
                          <td><VitalCell vitalKey="bpSystolic" raw={v.rawSystolic} display={v.bp} /></td>
                          <td><VitalCell vitalKey="heartRate"  raw={v.rawHr}       display={v.hr} /></td>
                          <td><VitalCell vitalKey="temperature" raw={v.rawTemp}    display={v.temp} /></td>
                          <td><VitalCell vitalKey="spo2"        raw={v.rawSpo2}    display={v.spo2} /></td>
                          <td>
                            {v.hasAlert
                              ? <span style={{ color: '#EF4444', fontWeight: 600 }}>Alert</span>
                              : <span style={{ color: '#10B981' }}>Normal</span>
                            }
                          </td>
                          <td>{v.notes || '--'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'medications' && (
          <div className="emr-card">
            <div className="emr-card-header">
              <h3 className="emr-card-title">Current Medications</h3>
              <button className="btn-primary btn-sm" onClick={() => setShowMedication(true)}>
                <svg viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Add Medication
              </button>
            </div>
            <div className="emr-card-body">
              {medicationsLoading ? <VitalsTableSkeleton /> : (
                <div className="medications-list">
                  {(!medications || medications.length === 0) && (
                    <p style={{ color: 'var(--color-gray)', fontSize: '0.875rem' }}>No medications recorded.</p>
                  )}
                  {medications?.map((m, i) => (
                    <div key={m.id || i} className="medication-item">
                      <div className="medication-info">
                        <h4 className="medication-name">{m.drugName}</h4>
                        <p className="medication-details">
                          {[`${m.strengthValue}${m.strengthUnit}`, m.doseForm, m.doseAmount, m.route, m.frequency].filter(Boolean).join(' · ')}
                        </p>
                        {m.sig && <p className="medication-details" style={{ marginTop: 4, fontStyle: 'italic' }}>{m.sig}</p>}
                        {m.indication && <p className="medication-details" style={{ marginTop: 2 }}>Indication: {m.indication}</p>}
                      </div>
                      <div className="medication-status">
                        <span className={`medication-status-badge ${m.active ? 'active' : ''}`}>
                          {m.active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="medication-next-dose">{m.orderPriority}</span>
                        {m.startDateTime && (
                          <span className="medication-next-dose">
                            From: {new Date(m.startDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                        {m.duration && <span className="medication-next-dose">{m.duration}</span>}
                        <button className="btn-view-sm" onClick={() => setViewMedication(m)}>
                          <svg viewBox="0 0 24 24" fill="none"><path d="M1 12C1 12 5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/></svg>
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="emr-card">
            <div className="emr-card-header">
              <h3 className="emr-card-title">Clinical Notes</h3>
              <button className="btn-primary btn-sm" onClick={() => setShowNote(true)}>
                <svg viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Add Note
              </button>
            </div>
            <div className="emr-card-body">
              {notesLoading ? [1,2,3].map(i => <NoteSkeleton key={i} />) : notes?.map((n, i) => (
                <div key={n.id || i} className="note-item">
                  <div className="note-header">
                    <span className="note-author">
                      {n.recordedBy ? `${n.recordedBy.firstName} ${n.recordedBy.lastName}` : n.author || '--'}
                    </span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {n.priorityDisplay && <span className="autocomplete-icd">{n.priorityDisplay}</span>}
                      {n.notesTypeDisplay && <span className="autocomplete-icd">{n.notesTypeDisplay}</span>}
                      <span className="note-date">{n.noteDate ? new Date(n.noteDate).toLocaleString() : n.date}</span>
                    </div>
                  </div>
                  {n.noteTitle && <p style={{ fontWeight: 600, color: 'var(--color-navy)', margin: '4px 0' }}>{n.noteTitle}</p>}
                  <p className="note-content">{n.notes || n.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="emr-grid">
            <div className="emr-card">
              <div className="emr-card-header">
                <h3 className="emr-card-title">Surgical History</h3>
                <button className="btn-primary btn-sm" onClick={() => setShowSurgery(true)}>
                  <svg viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Add Surgery
                </button>
              </div>
              <div className="emr-card-body">
                {surgeriesLoading ? <VitalsTableSkeleton /> : surgeries?.map((s, i) => (
                  <div key={s.id || i} className="history-item">
                    <div>
                      <span className="history-condition">{s.surgeryName}</span>
                      {s.surgeon && <span className="diagnosis-date" style={{ display: 'block', fontSize: '0.8rem' }}>{s.surgeon}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {s.surgeryTypeDisplay && <span className="autocomplete-icd">{s.surgeryTypeDisplay}</span>}
                      <span className="history-year">{s.surgeryDate || '--'}</span>
                      <button className="btn-view-sm" onClick={() => setViewSurgery(s)}>
                        <svg viewBox="0 0 24 24" fill="none"><path d="M1 12C1 12 5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/></svg>
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {showVitals    && <RecordVitalsModal onClose={() => setShowVitals(false)}    onSave={handleSaveVitals} />}
      {showNote      && <ClinicalNoteModal onClose={() => setShowNote(false)}      onSave={handleSaveNote} />}
      {showDiagnosis && <AddDiagnosisModal onClose={() => setShowDiagnosis(false)} onSave={handleSaveDiagnosis} />}
      {viewDiagnosis && <AddDiagnosisModal onClose={() => setViewDiagnosis(null)} viewData={viewDiagnosis} />}
      {showSurgery    && <AddSurgeryModal    onClose={() => setShowSurgery(false)}    onSave={handleSaveSurgery} />}
      {viewSurgery    && <AddSurgeryModal    onClose={() => setViewSurgery(null)}     viewData={viewSurgery} />}
      {showMedication && <AddMedicationModal onClose={() => setShowMedication(false)} onSave={async (data) => {
        const m = await saveMedication(data)
        if (m) reloadMedications(id)
        else throw new Error('Failed to save medication')
      }} />}
      {viewMedication && <AddMedicationModal onClose={() => setViewMedication(null)} viewData={viewMedication} />}

      {showAllAlerts && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAllAlerts(false)}>
          <div className="modal-container" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2 className="modal-title">All Alerts ({alerts.length})</h2>
              <button className="modal-close" onClick={() => setShowAllAlerts(false)}>
                <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {alerts.map(a => (
                <div key={a.id} className={`banner-alert-item ${a.priority === 'HIGH' ? 'alert-warning' : 'alert-info'}`} style={{ marginBottom: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: 600, display: 'block' }}>{a.name}: {a.value}</span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>{a.reason}</span>
                    <span style={{ fontSize: '0.7rem', color: 'inherit', opacity: 0.7, display: 'block', marginTop: 2 }}>{a.typeOfScreen} · {a.createdBy} · {new Date(a.createdOn).toLocaleDateString()}</span>
                  </div>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'rgba(0,0,0,0.08)' }}>{a.priority}</span>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAllAlerts(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
