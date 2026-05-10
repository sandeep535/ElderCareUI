import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { StatusBadge, ErrorState } from '../../components/UI/UI'
import { PatientBannerSkeleton, VitalsTableSkeleton, NoteSkeleton } from '../../components/Skeletons/Skeletons'
import RecordVitalsModal from '../../components/RecordVitalsModal/RecordVitalsModal'
import ClinicalNoteModal from '../../components/ClinicalNoteModal/ClinicalNoteModal'
import AddDiagnosisModal from '../../components/AddDiagnosisModal/AddDiagnosisModal'
import AddSurgeryModal from '../../components/AddSurgeryModal/AddSurgeryModal'
import AddMedicationModal from '../../components/AddMedicationModal/AddMedicationModal'
import AddTaskModal from '../../components/AddTaskModal/AddTaskModal'
import RecentActivity from '../../components/RecentActivity/RecentActivity'
import { useApi, useMutation } from '../../hooks/useApi'
import {
  fetchPatientById, fetchPatientMedical, fetchPatientAdmission,
  fetchNokByPatientId, fetchVitals, fetchDiagnoses,
  fetchMedications, fetchNotes, fetchSurgeries,
  createVital, createNote, createDiagnosis, createSurgery, createMedication,
  fetchUnresolvedAlerts, fetchTasksRange, createTasks, updateTask,
  fetchActiveCheckin, checkInPatient, checkOutPatient, fetchCheckinHistory,
  fetchPatientPhoto, uploadPatientPhoto,
} from '../../api/endpoints'
import './PatientDetail.css'
import '../../components/UI/UI.css'
import '../../components/UI/Form.css'

const TABS = [
  { key: 'overview',    label: 'Overview' },
  { key: 'vitals',      label: 'Vital Signs' },
  { key: 'tasks',       label: 'Tasks' },
  { key: 'medications', label: 'Medications' },
  { key: 'notes',       label: 'Clinical Notes' },
  { key: 'history',     label: 'Medical History' },
  { key: 'visits',      label: 'Visit History' },
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
    datetime:    formatDateTimeDisplay(recordedDate),
    relativeTime: getRelativeTime(v.recordedAt),
    by:          'Nurse',
  }
}

const formatDateTimeDisplay = (date) => {
  if (!date) return '--'
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const mins = String(d.getMinutes()).padStart(2, '0')
  return `${day}-${month}-${year} ${hours}:${mins}`
}

const formatDateTimeInput = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getDateOffset = (days) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return formatDateTimeInput(date)
}

const normalizeTask = (task) => ({
  id: task.id,
  taskId: task.taskId || null,
  taskGroupId: task.taskGroupId || null,
  taskName: task.taskName || null,
  taskGroupName: task.taskGroupName || null,
  scheduledDateTime: task.scheduledDateTime || task.scheduledDate || null,
  formattedDate: task.scheduledDateTime ? new Date(task.scheduledDateTime) : null,
  status: task.status || 'PENDING',
  notes: task.notes || '',
})


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
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [editingStatus, setEditingStatus] = useState('')
  const tabsRef = useRef(null)
  const [canScrollLeft,  setCanScrollLeft]  = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollButtons = () => {
    const el = tabsRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }

  useEffect(() => {
    const el = tabsRef.current
    if (!el) return
    updateScrollButtons()
    el.addEventListener('scroll', updateScrollButtons)
    const ro = new ResizeObserver(updateScrollButtons)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', updateScrollButtons); ro.disconnect() }
  }, [])

  const scrollTabs = (dir) => {
    const el = tabsRef.current
    if (!el) return
    el.scrollBy({ left: dir * 160, behavior: 'smooth' })
  }
  const [taskFrom, setTaskFrom] = useState(getDateOffset(-7))
  const [taskTo, setTaskTo] = useState(getDateOffset(0))
  const [showAllAlerts, setShowAllAlerts] = useState(false)
  const [alerts,        setAlerts]        = useState([])
  const [patientInfo,   setPatientInfo]  = useState(null)
  const [bannerLoading, setBannerLoading] = useState(true)
  const [bannerError,   setBannerError]  = useState(null)

  // Patient photo
  const [photoUrl,       setPhotoUrl]       = useState(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [showCamera,     setShowCamera]     = useState(false)
  const photoInputRef = useRef(null)
  const videoRef      = useRef(null)
  const streamRef     = useRef(null)

  useEffect(() => {
    if (!id) return
    fetchPatientPhoto(id)
      .then(res => {
        // axiosInstance with responseType:'blob' returns the blob directly
        // (our interceptor returns response.data, so res is the Blob)
        const blob = res instanceof Blob ? res : res?.data
        if (blob && blob.size > 0) {
          setPhotoUrl(URL.createObjectURL(blob))
        }
      })
      .catch(() => {}) // no photo yet — show initials
  }, [id])

  const handlePhotoUpload = async (file) => {
    if (!file) return
    setPhotoUploading(true)
    try {
      await uploadPatientPhoto(id, file)
      // Show the uploaded file immediately as a local preview
      setPhotoUrl(URL.createObjectURL(file))
    } catch {
      // silently fail — keep existing photo/initials
    } finally {
      setPhotoUploading(false)
    }
  }

  const openCamera = () => {
    setShowCamera(true)
  }

  // Start camera stream once the video element is mounted
  useEffect(() => {
    if (!showCamera) return
    let active = true
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      .then(stream => {
        if (!active) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
      })
      .catch(() => {
        setShowCamera(false)
        alert('Camera access denied or not available.')
      })
    return () => {
      active = false
      streamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }, [showCamera])

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setShowCamera(false)
  }

  const capturePhoto = () => {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    canvas.toBlob(async (blob) => {
      closeCamera()
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' })
      await handlePhotoUpload(file)
    }, 'image/jpeg', 0.92)
  }

  // Check-in / Check-out
  const [checkin,         setCheckin]         = useState(null)   // active checkin record or null
  const [checkinLoading,  setCheckinLoading]  = useState(false)
  const [checkinError,    setCheckinError]    = useState('')
  const [liveDuration,    setLiveDuration]    = useState('')
  const timerRef = useRef(null)

  const calcDuration = (from, to) => {
    const diffMs = (to ? new Date(to) : new Date()) - new Date(from)
    if (diffMs < 0) return '0m'
    const totalMins = Math.floor(diffMs / 60000)
    const hrs  = Math.floor(totalMins / 60)
    const mins = totalMins % 60
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`
  }

  // fetch active checkin on load
  useEffect(() => {
    if (!id) return
    fetchActiveCheckin(id)
      .then(res => {
        const data = res?.data !== undefined ? res.data : res
        setCheckin(data || null)
      })
      .catch(() => setCheckin(null))
  }, [id])

  // live timer while checked in
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (checkin && !checkin.checkOutTime) {
      setLiveDuration(calcDuration(checkin.checkInTime))
      timerRef.current = setInterval(() => {
        setLiveDuration(calcDuration(checkin.checkInTime))
      }, 60000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [checkin])

  const handleCheckIn = async () => {
    setCheckinLoading(true)
    setCheckinError('')
    try {
      const res = await checkInPatient(id)
      const data = res?.data !== undefined ? res.data : res
      setCheckin(data)
    } catch (err) {
      setCheckinError(err?.message || 'Check-in failed')
    } finally {
      setCheckinLoading(false)
    }
  }

  const handleCheckOut = async () => {
    if (!checkin?.id) return
    setCheckinLoading(true)
    setCheckinError('')
    try {
      const res = await checkOutPatient(id, checkin.id)
      const data = res?.data !== undefined ? res.data : res
      setCheckin(data)
    } catch (err) {
      setCheckinError(err?.message || 'Check-out failed')
    } finally {
      setCheckinLoading(false)
    }
  }

  // Visit history
  const [visitFrom,      setVisitFrom]      = useState(getDateOffset(-30))
  const [visitTo,        setVisitTo]        = useState(getDateOffset(0))
  const [visitHistory,   setVisitHistory]   = useState(null)
  const [visitLoading,   setVisitLoading]   = useState(false)
  const [visitError,     setVisitError]     = useState('')

  const loadVisitHistory = async (from, to) => {
    setVisitLoading(true)
    setVisitError('')
    try {
      const res = await fetchCheckinHistory(id, from, to)
      const data = res?.data !== undefined ? res.data : res
      setVisitHistory(Array.isArray(data) ? data : [])
    } catch (err) {
      setVisitError(err?.message || 'Failed to load visit history')
    } finally {
      setVisitLoading(false)
    }
  }

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
  const { data: rawTasks,    loading: tasksLoading,       error: tasksError,    execute: loadTasks, setData: setTaskData } = useApi(fetchTasksRange, [id, taskFrom, taskTo], false)

  useEffect(() => {
    if (!id) return
    loadTasks(id, taskFrom, taskTo)
  }, [id, taskFrom, taskTo, loadTasks])

  // normalize + sort vitals by createdOn desc (latest first)
  const vitals = rawVitals
    ? [...rawVitals]
        .sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn))
        .map(normalizeVital)
    : null

  const tasks = rawTasks
    ? [...rawTasks]
        .sort((a, b) => new Date(a.scheduledDateTime || a.scheduledDate || 0) - new Date(b.scheduledDateTime || b.scheduledDate || 0))
        .map(normalizeTask)
    : null

  const { mutate: saveVital }     = useMutation((data) => createVital(id, data))
  const { mutate: saveNote }      = useMutation((data) => createNote(id, data))
  const { mutate: saveDiagnosis }  = useMutation((data) => createDiagnosis(id, data))
  const { mutate: saveSurgery }    = useMutation((data) => createSurgery(id, data))
  const { mutate: saveMedication } = useMutation((data) => createMedication(id, data))
  const { mutate: saveTask }       = useMutation((data) => createTasks(id, data))
  const { mutate: patchTask }      = useMutation((taskId, data) => updateTask(id, taskId, data))

  const handleSaveVitals    = async (data) => {
    const v = await saveVital(data)
    if (v) {
      setRawVitals(prev => [v, ...(prev || [])])
      setShowVitals(false)
    }
  }
  const handleSaveTask = async (data) => {
    const saved = await saveTask(data)
    if (saved) {
      setShowTaskModal(false)
      loadTasks(id, taskFrom, taskTo)
    }
    return saved
  }
  const handleUpdateTask = async (taskId, data) => {
    const updated = await patchTask(taskId, data)
    if (updated) {
      setTaskData(prev => prev?.map(item => item.id === updated.id ? updated : item))
    }
    return updated
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
    if (key === 'tasks') loadTasks(id, taskFrom, taskTo)
    if (key === 'visits' && !visitHistory) loadVisitHistory(visitFrom, visitTo)
  }

  const currentVitals = vitals?.[0] || patientInfo?.vitals

  return (
    <>
      {/* Patient Banner */}
      {bannerLoading ? <PatientBannerSkeleton /> : bannerError ? <ErrorState message={bannerError} /> : patientInfo && (
        <section className="patient-banner">
          <div className="banner-grid">

            {/* Row 1, Col 1-4: Avatar */}
            <div className="banner-cell banner-cell--avatar">
              <div className="patient-avatar-large">
                {photoUrl ? (
                  <img src={photoUrl} alt={patientInfo.name} className="patient-avatar-image" />
                ) : (
                  <div className="patient-avatar-placeholder">
                    {patientInfo.firstName?.[0]}{patientInfo.lastName?.[0]}
                  </div>
                )}

                {/* Upload overlay */}
                <div className="avatar-upload-overlay">
                  {photoUploading ? (
                    <span className="btn-spinner" style={{ width: 22, height: 22, borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)', borderWidth: 3 }} />
                  ) : (
                    <>
                      {/* Upload from gallery */}
                      <button
                        className="avatar-upload-btn"
                        title="Upload photo"
                        onClick={() => photoInputRef.current?.click()}
                      >
                        <svg viewBox="0 0 24 24" fill="none" style={{ width: 18, height: 18 }}>
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      {/* Camera capture */}
                      <button
                        className="avatar-upload-btn"
                        title="Take photo"
                        onClick={openCamera}
                      >
                        <svg viewBox="0 0 24 24" fill="none" style={{ width: 18, height: 18 }}>
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </>
                  )}
                </div>

                {/* Hidden file input for gallery upload */}
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handlePhotoUpload(e.target.files?.[0])}
                />
              </div>
            </div>

            {/* Webcam modal */}
            {showCamera && (
              <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeCamera()}>
                <div className="modal-container" style={{ maxWidth: 480 }}>
                  <div className="modal-header">
                    <h2 className="modal-title">Take Photo</h2>
                    <button className="modal-close" onClick={closeCamera}>
                      <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                  <div className="modal-body" style={{ padding: 0 }}>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      style={{ width: '100%', display: 'block', borderRadius: '0 0 4px 4px' }}
                    />
                  </div>
                  <div className="modal-footer">
                    <button className="btn-secondary" onClick={closeCamera}>Cancel</button>
                    <button className="btn-primary" onClick={capturePhoto}>
                      <svg viewBox="0 0 24 24" fill="none" style={{ width: 16, height: 16 }}>
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      Capture
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Row 1, Col 5-8: Name + ID + Status */}
            <div className="banner-cell banner-cell--identity">
              <h2 className="patient-name-large">{patientInfo.name}</h2>
              <div className="patient-meta">
                <span className="patient-id-badge">ID: {patientInfo.patientId}</span>
                <StatusBadge status={patientInfo.completionStatus === 'INCOMPLETE' ? 'warning' : 'stable'} />
              </div>
            </div>

            {/* Row 1, Col 9-12: Visit Tracking */}
            <div className="banner-cell banner-cell--tracker">
              <div className="visit-tracking-card">
                <div className="visit-tracking-header">
                  <svg viewBox="0 0 24 24" fill="none" style={{ width: 13, height: 13 }}>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Visit Tracking</span>
                </div>
                {checkinError && <p style={{ fontSize: '0.7rem', color: '#EF4444', margin: '2px 0 0' }}>{checkinError}</p>}
                {!checkin && (
                  <div className="visit-tracking-body">
                    <span className="visit-tracking-empty">No active visit</span>
                    <button className="visit-tracking-btn visit-tracking-btn--in" onClick={handleCheckIn} disabled={checkinLoading}>
                      {checkinLoading ? '...' : 'Check In'}
                    </button>
                  </div>
                )}
                {checkin && !checkin.checkOutTime && (
                  <div className="visit-tracking-body">
                    <div className="visit-tracking-info">
                      <span className="visit-tracking-label">Check-in</span>
                      <span className="visit-tracking-value visit-tracking-value--green">{formatDateTimeDisplay(new Date(checkin.checkInTime))}</span>
                    </div>
                    <div className="visit-tracking-info">
                      <span className="visit-tracking-label">Duration</span>
                      <span className="visit-tracking-value visit-tracking-value--primary">{liveDuration}</span>
                    </div>
                    <button className="visit-tracking-btn visit-tracking-btn--out" onClick={handleCheckOut} disabled={checkinLoading}>
                      {checkinLoading ? '...' : 'Check Out'}
                    </button>
                  </div>
                )}
                {checkin && checkin.checkOutTime && (
                  <div className="visit-tracking-body">
                    <div className="visit-tracking-info">
                      <span className="visit-tracking-label">In</span>
                      <span className="visit-tracking-value">{formatDateTimeDisplay(new Date(checkin.checkInTime))}</span>
                    </div>
                    <div className="visit-tracking-info">
                      <span className="visit-tracking-label">Out</span>
                      <span className="visit-tracking-value">{formatDateTimeDisplay(new Date(checkin.checkOutTime))}</span>
                    </div>
                    <div className="visit-tracking-info">
                      <span className="visit-tracking-label">Duration</span>
                      <span className="visit-tracking-value" style={{ fontWeight: 700 }}>{calcDuration(checkin.checkInTime, checkin.checkOutTime)}</span>
                    </div>
                    <button className="visit-tracking-btn visit-tracking-btn--in" onClick={handleCheckIn} disabled={checkinLoading}>
                      {checkinLoading ? '...' : 'New Check In'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Row 2, Col 1-3: Demographics */}
            <div className="banner-cell banner-cell--demographics">
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

            {/* Row 2, Col 4-6: Care Team */}
            <div className="banner-cell banner-cell--careteam">
              <div className="banner-section">
                <h4 className="banner-section-title">Care Team</h4>
                {[['Primary Physician', patientInfo.physician], ['Attending Nurse', patientInfo.nurse], ['Room / Bed', `${patientInfo.room} / ${patientInfo.bed}`]].map(([l, v]) => (
                  <div key={l} className="banner-detail-row">
                    <span className="banner-detail-label">{l}</span>
                    <span className="banner-detail-value">{v || '--'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 2, Col 7-9: Medical Alerts */}
            <div className="banner-cell banner-cell--alerts">
              <div className="banner-section">
                <h4 className="banner-section-title">Medical Alerts</h4>
                {alerts.length === 0 && <span style={{ fontSize: '0.8125rem', color: 'var(--color-gray)' }}>No active alerts</span>}
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
                  <button onClick={() => setShowAllAlerts(true)} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0', textAlign: 'left' }}>
                    +{alerts.length - 1} more alert{alerts.length - 1 > 1 ? 's' : ''}
                  </button>
                )}
                <div className="banner-detail-row"><span className="banner-detail-label">Medications</span><span className="banner-detail-value">{medications?.length ?? '--'}</span></div>
                <div className="banner-detail-row"><span className="banner-detail-label">Diagnoses</span><span className="banner-detail-value">{diagnoses?.length ?? '--'}</span></div>
                <div className="banner-detail-row"><span className="banner-detail-label">NOK</span><span className="banner-detail-value">{patientInfo.nok?.length ?? '--'}</span></div>
              </div>
            </div>

            {/* Row 2, Col 10-12: Current Vitals */}
            <div className="banner-cell banner-cell--vitals">
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
        <div className="emr-tabs-wrapper">
          {canScrollLeft && (
            <button className="emr-tabs-arrow emr-tabs-arrow--left" onClick={() => scrollTabs(-1)}>
              <svg viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )}
          <div className="emr-tabs" ref={tabsRef}>
            {TABS.map(t => (
              <button key={t.key} className={`emr-tab${activeTab === t.key ? ' active' : ''}`} onClick={() => handleTabChange(t.key)}>
                {t.label}
              </button>
            ))}
          </div>
          {canScrollRight && (
            <button className="emr-tabs-arrow emr-tabs-arrow--right" onClick={() => scrollTabs(1)}>
              <svg viewBox="0 0 24 24" fill="none"><path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )}
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

        {activeTab === 'tasks' && (
          <div className="emr-card">
            <div className="emr-card-header">
              <h3 className="emr-card-title">Patient Tasks</h3>
              <button className="btn-primary btn-sm" onClick={() => setShowTaskModal(true)}>
                <svg viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Add Task
              </button>
            </div>
            <div className="emr-card-body">
              <div className="task-filter-row">
                <label className="form-label">From</label>
                <input type="date" className="form-input" value={taskFrom} onChange={(e) => setTaskFrom(e.target.value)} />
                <label className="form-label">To</label>
                <input type="date" className="form-input" value={taskTo} onChange={(e) => setTaskTo(e.target.value)} />
              </div>
              {tasksLoading ? <VitalsTableSkeleton /> : (
                <div className="vitals-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Scheduled</th>
                        <th>Task</th>
                        <th>Group</th>
                        <th>Status</th>
                        <th>Notes</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks?.length ? tasks.map((task, i) => {
                        const isEditing = editingTaskId === task.id
                        return (
                          <tr key={task.id || i}>
                            <td>{task.formattedDate ? formatDateTimeDisplay(task.formattedDate) : '--'}</td>
                            <td>{task.taskName || '--'}</td>
                            <td>{task.taskGroupName || '--'}</td>
                            <td>
                              {isEditing ? (
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                  {['PENDING', 'IN_PROGRESS', 'COMPLETED'].map(s => (
                                    <button
                                      key={s}
                                      onClick={() => setEditingStatus(s)}
                                      style={{
                                        padding: '2px 8px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        borderRadius: '4px',
                                        border: '1.5px solid',
                                        cursor: 'pointer',
                                        borderColor: editingStatus === s ? 'var(--color-primary)' : 'var(--color-border)',
                                        background: editingStatus === s ? 'var(--color-primary)' : 'transparent',
                                        color: editingStatus === s ? '#fff' : 'var(--color-text)',
                                      }}
                                    >
                                      {s === 'IN_PROGRESS' ? 'In Progress' : s.charAt(0) + s.slice(1).toLowerCase()}
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <span>{task.status}</span>
                              )}
                            </td>
                            <td>{task.notes || '--'}</td>
                            <td>
                              {isEditing ? (
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button
                                    className="btn-primary btn-sm"
                                    onClick={async () => {
                                      await handleUpdateTask(task.id, {
                                        taskIds: task.taskId ? [task.taskId] : null,
                                        taskGroupIds: task.taskGroupId ? [task.taskGroupId] : null,
                                        scheduledDateTime: task.formattedDate ? formatDateTimeDisplay(task.formattedDate) : null,
                                        status: editingStatus,
                                        notes: task.notes || null,
                                      })
                                      setEditingTaskId(null)
                                    }}
                                  >
                                    Save
                                  </button>
                                  <button
                                    className="btn-secondary btn-sm"
                                    onClick={() => setEditingTaskId(null)}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : task.status === 'COMPLETED' ? (
                                <span style={{ color: '#10B981', fontWeight: 600 }}>Done</span>
                              ) : (
                                <button
                                  className="btn-secondary btn-sm"
                                  onClick={() => {
                                    setEditingTaskId(task.id)
                                    setEditingStatus(task.status)
                                  }}
                                >
                                  <svg viewBox="0 0 24 24" fill="none" style={{ width: 13, height: 13 }}>
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  Edit
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      }) : (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', color: 'var(--color-gray)' }}>
                            No tasks found for the selected date range.
                          </td>
                        </tr>
                      )}
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

        {activeTab === 'visits' && (
          <div className="emr-card">
            <div className="emr-card-header">
              <h3 className="emr-card-title">Visit History</h3>
            </div>
            <div className="emr-card-body">
              {/* Date range filter */}
              <div className="task-filter-row">
                <label className="form-label">From</label>
                <input
                  type="date"
                  className="form-input"
                  value={visitFrom}
                  onChange={(e) => setVisitFrom(e.target.value)}
                />
                <label className="form-label">To</label>
                <input
                  type="date"
                  className="form-input"
                  value={visitTo}
                  onChange={(e) => setVisitTo(e.target.value)}
                />
                <button
                  className="btn-primary btn-sm"
                  onClick={() => loadVisitHistory(visitFrom, visitTo)}
                  disabled={visitLoading}
                >
                  {visitLoading ? 'Loading...' : 'Search'}
                </button>
              </div>

              {visitError && (
                <p style={{ color: '#EF4444', fontSize: '0.875rem', margin: '8px 0' }}>{visitError}</p>
              )}

              {visitLoading ? <VitalsTableSkeleton /> : (
                <div className="vitals-table">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Check-in</th>
                        <th>Check-out</th>
                        <th>Duration</th>
                        <th>Recorded By</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visitHistory?.length ? visitHistory.map((v, i) => {
                        const isActive = !v.checkOutTime
                        const duration = v.checkInTime
                          ? calcDuration(v.checkInTime, v.checkOutTime || undefined)
                          : '--'
                        return (
                          <tr key={v.id || i}>
                            <td>{i + 1}</td>
                            <td>{v.checkInTime ? formatDateTimeDisplay(new Date(v.checkInTime)) : '--'}</td>
                            <td>
                              {isActive
                                ? <span style={{ color: '#10B981', fontWeight: 600 }}>Active</span>
                                : formatDateTimeDisplay(new Date(v.checkOutTime))
                              }
                            </td>
                            <td style={{ fontWeight: 600 }}>
                              {isActive
                                ? <span style={{ color: 'var(--color-primary)' }}>{calcDuration(v.checkInTime)} (ongoing)</span>
                                : duration
                              }
                            </td>
                            <td>{v.createdBy || '--'}</td>
                            <td>
                              {isActive
                                ? <span style={{ color: '#10B981', fontWeight: 600, fontSize: '0.8rem' }}>● Checked In</span>
                                : <span style={{ color: 'var(--color-gray)', fontSize: '0.8rem' }}>Completed</span>
                              }
                            </td>
                          </tr>
                        )
                      }) : (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', color: 'var(--color-gray)' }}>
                            No visits found for the selected date range.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
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
      {showTaskModal && <AddTaskModal onClose={() => setShowTaskModal(false)} onSave={handleSaveTask} />}

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
