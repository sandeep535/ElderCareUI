import { apiGet, apiPost, apiPut, apiDelete } from './apiService'
import axiosInstance from './axiosInstance'
import { MOCK_STATS, MOCK_ALERTS } from '../constants/mockData'

const USE_MOCK = true
const delay = (ms = 800) => new Promise((r) => setTimeout(r, ms))
const mock = async (data, ms = 800) => { await delay(ms); return { data, success: true } }

// Auth
export const loginApi = (credentials) => apiPost('/auth/login', credentials)

// Dashboard
export const fetchDashboardStats = () => apiGet('/dashboard/summary')
export const fetchDashboardTaskCount = (date) => apiGet('/dashboard/tasks/count', { date })
export const fetchAlerts = () => USE_MOCK ? mock(MOCK_ALERTS) : apiGet('/alerts')

// Patients
export const fetchPatients = () => apiGet('/patients')
export const fetchPatientById = (id) => apiGet(`/patients/${id}`)
export const fetchPatientMedical = (id) => apiGet(`/patients/${id}/medical`)
export const fetchPatientAdmission = (id) => apiGet(`/patients/${id}/admission`)
export const fetchLatestVitals = (id) => apiGet(`/patients/${id}/vitals/latest`)

export const createPatient = (data) =>
  apiPost('/patients', {
    firstName:     data.firstName,
    lastName:      data.lastName,
    dob:           data.dob,
    gender:        data.gender,
    enquireFromId: data.enquireFromId ?? null,
    consentForm:   data.consentForm  ?? false,
  })

export const updatePatientBasic = (id, data) =>
  apiPut(`/patients/${id}`, {
    firstName:     data.firstName,
    lastName:      data.lastName,
    dob:           data.dob,
    gender:        data.gender,
    enquireFromId: data.enquireFromId ?? null,
    consentForm:   data.consentForm  ?? false,
  })

export const updatePatient = (id, data) => apiPut(`/patients/${id}`, data)
export const deletePatient = (id) => apiDelete(`/patients/${id}`)

// NOK
export const fetchNokByPatientId = (patientId) => apiGet(`/patients/${patientId}/nok`)

const buildNokPayload = (nokList) => nokList.map(n => ({
  ...(n.id ? { id: n.id } : {}),
  firstName:      n.firstName,
  lastName:       n.lastName,
  relationship:   n.relationship,
  dob:            n.dob    || null,
  gender:         n.gender || null,
  phoneNumber:    n.phone,
  email:          n.email  || null,
  primaryContact: n.primaryContact  === 'yes' || n.primaryContact  === true,
  canMakeMedical: n.medicalDecisions === 'yes' || n.medicalDecisions === true,
  notes:          n.notes  || null,
}))

export const createNok = (patientId, nokList) => apiPost(`/patients/${patientId}/nok`, buildNokPayload(nokList))
export const updateNok = (patientId, nokList) => apiPut(`/patients/${patientId}/nok`, buildNokPayload(nokList))

// Masters
export const fetchMasterData = (type) => apiGet(`/masters/${type}`)
export const fetchUsers = () => apiGet('/users')

// Medical
export const fetchMedical = (patientId) => apiGet(`/patients/${patientId}/medical`)
export const saveMedical = (patientId, data) => apiPut(`/patients/${patientId}/medical`, data)
export const createMedical = (patientId, data) => apiPost(`/patients/${patientId}/medical`, data)

// Admission
export const fetchAdmission = (patientId) => apiGet(`/patients/${patientId}/admission`)
export const createAdmission = (patientId, data) => apiPost(`/patients/${patientId}/admission`, data)
export const updateAdmission = (patientId, data) => apiPut(`/patients/${patientId}/admission`, data)

// Patient Notes
export const savePatientNotes = (patientId, notes) => apiPost(`/patients/${patientId}/notes`, { notes })

// Vitals — real API
export const fetchVitals = (patientId) => apiGet(`/patients/${patientId}/vitals`)

export const createVital = (patientId, data) =>
  apiPost(`/patients/${patientId}/vitals`, {
    // Clinical
    systolic:    data.systolic    ?? null,
    diastolic:   data.diastolic   ?? null,
    bpHeartRate: data.bpHeartRate ?? null,
    spo2:        data.spo2        ?? null,
    spo2HeartRate: data.spo2HeartRate ?? null,
    temperature: data.temperature ?? null,
    // Body Composition
    height:                   data.height                   ?? null,
    weight:                   data.weight                   ?? null,
    bmi:                      data.bmi                      ?? null,
    bodyFatPercentage:        data.bodyFatPercentage        ?? null,
    bodyFatMass:              data.bodyFatMass              ?? null,
    skeletalMusclePercentage: data.skeletalMusclePercentage ?? null,
    bodyWaterPercentage:      data.bodyWaterPercentage      ?? null,
    totalMoisture:            data.totalMoisture            ?? null,
    extracellularWaterPct:    data.extracellularWaterPct    ?? null,
    intracellularWaterPct:    data.intracellularWaterPct    ?? null,
    basalMetabolism:          data.basalMetabolism          ?? null,
    visceralFatLevel:         data.visceralFatLevel         ?? null,
    protein:                  data.protein                  ?? null,
    mineral:                  data.mineral                  ?? null,
    bodyAge:                  data.bodyAge                  ?? null,
    overall:                  data.overall                  ?? null,
    notes: data.notes || null,
  })

// Diagnoses
export const fetchDiagnoses = (patientId) => apiGet(`/patients/${patientId}/diagnoses`)
export const createDiagnosis = (patientId, data) => apiPost(`/patients/${patientId}/diagnoses`, data)
export const fetchDiagnosisMaster = () => apiGet('/diagnosis-master')


// Medications
export const fetchMedications = (patientId) => apiGet(`/patients/${patientId}/medications`)
export const createMedication = (patientId, data) => apiPost(`/patients/${patientId}/medications`, data)
export const fetchMedicationMaster = () => apiGet('/medication-master')

// Clinical Notes
export const fetchNotes = (patientId) => apiGet(`/patients/${patientId}/clinical-notes`)
export const createNote = (patientId, data) => apiPost(`/patients/${patientId}/clinical-notes`, data)

// Tasks master
export const fetchTasksMaster      = () => apiGet('/tasks')
export const fetchTaskGroupsMaster = () => apiGet('/task-groups')

// Tasks
export const fetchTasksRange = (patientId, from, to) => apiGet(`/patients/${patientId}/tasks/range`, { from, to })
export const createTasks = (patientId, data) => apiPost(`/patients/${patientId}/tasks`, data)
export const updateTask = (patientId, taskId, data) => apiPut(`/patients/${patientId}/tasks/${taskId}`, data)

// Check-in / Check-out
export const fetchActiveCheckin = (patientId) => apiGet(`/patients/${patientId}/checkin/active`)
export const fetchCheckinHistory = (patientId, from, to) => apiGet(`/patients/${patientId}/checkin/history`, { from, to })
export const checkInPatient = (patientId) => apiPost(`/patients/${patientId}/checkin`, {})
export const checkOutPatient = (patientId, checkinId) => apiPut(`/patients/${patientId}/checkin/${checkinId}/checkout`, {})

// Patient Photo
export const fetchPatientPhoto = (patientId) =>
  axiosInstance.get(`/patients/${patientId}/photo`, { responseType: 'blob' })

export const uploadPatientPhoto = (patientId, file) => {
  const formData = new FormData()
  formData.append('file', file)
  return axiosInstance.post(`/patients/${patientId}/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// Vital Metrics Master
export const fetchVitalMetrics = () => apiGet('/vital-metrics')
export const fetchVitalMetricsDisplay = () => apiGet('/vital-metrics/display')
export const updateVitalMetric = (id, data) => apiPut(`/vital-metrics/${id}`, data)
export const bulkUpdateVitalMetrics = (data) => apiPut('/vital-metrics/bulk', data)
export const fetchPagedAlerts = (page = 0, size = 10) => apiGet('/alerts/paged', { page, size })
export const fetchUnresolvedAlerts = (patientId) => apiGet(`/patients/${patientId}/alerts/unresolved`)
export const fetchSurgeries = (patientId) => apiGet(`/patients/${patientId}/medical-history`)
export const createSurgery = (patientId, data) => apiPost(`/patients/${patientId}/medical-history`, data)
