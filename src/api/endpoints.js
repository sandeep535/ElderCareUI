import { apiGet, apiPost, apiPut, apiDelete } from './apiService'
import { MOCK_STATS, MOCK_ALERTS } from '../constants/mockData'

const USE_MOCK = true
const delay = (ms = 800) => new Promise((r) => setTimeout(r, ms))
const mock = async (data, ms = 800) => { await delay(ms); return { data, success: true } }

// Auth
export const loginApi = (credentials) => apiPost('/auth/login', credentials)

// Dashboard
export const fetchDashboardStats = () => apiGet('/dashboard/summary')
export const fetchAlerts = () => USE_MOCK ? mock(MOCK_ALERTS) : apiGet('/alerts')

// Patients
export const fetchPatients = () => apiGet('/patients')
export const fetchPatientById = (id) => apiGet(`/patients/${id}`)
export const fetchPatientMedical = (id) => apiGet(`/patients/${id}/medical`)
export const fetchPatientAdmission = (id) => apiGet(`/patients/${id}/admission`)
export const fetchLatestVitals = (id) => apiGet(`/patients/${id}/vitals/latest`)

export const createPatient = (data) =>
  apiPost('/patients', {
    firstName: data.firstName,
    lastName:  data.lastName,
    dob:       data.dob,
    gender:    data.gender,
  })

export const updatePatientBasic = (id, data) =>
  apiPut(`/patients/${id}`, {
    firstName: data.firstName,
    lastName:  data.lastName,
    dob:       data.dob,
    gender:    data.gender,
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
    systolic:  data.bpSystolic,
    diastolic: data.bpDiastolic,
    hr:        data.heartRate,
    temp:      data.temperature,
    spo2:      data.spo2,
    notes:     data.notes || null,
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

// Alerts
export const fetchUnresolvedAlerts = (patientId) => apiGet(`/patients/${patientId}/alerts/unresolved`)
export const fetchPagedAlerts = (page = 0, size = 10) => apiGet('/alerts/paged', { page, size })
export const fetchSurgeries = (patientId) => apiGet(`/patients/${patientId}/medical-history`)
export const createSurgery = (patientId, data) => apiPost(`/patients/${patientId}/medical-history`, data)
