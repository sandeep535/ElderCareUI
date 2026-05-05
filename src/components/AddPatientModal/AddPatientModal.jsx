import { useState, useEffect } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { createPatient, updatePatientBasic, createNok, updateNok, fetchMasterData, fetchPatientById, fetchNokByPatientId, fetchUsers, fetchMedical, saveMedical, createMedical, fetchAdmission, createAdmission, updateAdmission, savePatientNotes } from '../../api/endpoints'
import AutoComplete from '../AutoComplete/AutoComplete'
import '../UI/UI.css'
import '../UI/Form.css'
import './AddPatientModal.css'

const schema = yup.object({
  firstName:        yup.string().required('First name is required'),
  lastName:         yup.string().required('Last name is required'),
  dob:              yup.string().required('Date of birth is required'),
  gender:           yup.string().required('Gender is required'),
  patientId:        yup.string(),
  physician:        yup.string(),
  nurse:            yup.string(),
  allergies:        yup.string(),
  medicalAlerts:    yup.string(),
  medications:      yup.string(),
  bloodType:        yup.string(),
  admissionDate:    yup.string().required('Admission date is required'),
  room:             yup.string(),
  bed:              yup.string(),
  status:           yup.string(),
  emergencyContact: yup.string(),
  emergencyPhone:   yup.string(),
  notes:            yup.string(),
  nok: yup.array().of(yup.object({
    id:               yup.number().nullable(),
    firstName:        yup.string().required('First name required'),
    lastName:         yup.string().required('Last name required'),
    relationship:     yup.string().required('Relationship required'),
    phone:            yup.string().required('Phone required'),
    email:            yup.string().email('Invalid email').nullable(),
    dob:              yup.string(),
    gender:           yup.string(),
    primaryContact:   yup.string(),
    medicalDecisions: yup.string(),
    notes:            yup.string(),
  })),
})

const STEPS = ['Demographics', 'Medical', 'Admission', 'Notes']
const PROGRESS = ['25%', '50%', '75%', '100%']

export default function AddPatientModal({ onClose, onSave, loading = false, patientData = null }) {
  const [step, setStep]                     = useState(1)
  const [stepLoading, setStepLoading]       = useState(false)
  const [stepError,   setStepError]         = useState('')
  const [fetchLoading, setFetchLoading]     = useState(!!patientData)
  const [saveSuccess,  setSaveSuccess]      = useState(false)
  const [createdPatient, setCreatedPatient] = useState(patientData ? { id: patientData.id } : null)
  const [nokSaved,      setNokSaved]        = useState(false)
  const [medicalSaved,  setMedicalSaved]    = useState(false)
  const [admissionSaved, setAdmissionSaved] = useState(false)
  const [admissionId,   setAdmissionId]     = useState(null)
  const [physicianId,   setPhysicianId]     = useState(null)
  const [nurseId,       setNurseId]         = useState(null)
  const [relationships, setRelationships]   = useState([])
  const [bloodTypes,    setBloodTypes]      = useState([])
  const [patientStatuses, setPatientStatuses] = useState([])
  const [doctors,       setDoctors]         = useState([])
  const [nurses,        setNurses]          = useState([])

  const { register, handleSubmit, control, trigger, getValues, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { status: 'stable', nok: [] },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'nok' })

  // fetch relationship master data and users on mount
  useEffect(() => {
    fetchMasterData('RELATIONSHIP')
      .then(res => {
        const list = Array.isArray(res) ? res : (res?.data || [])
        const seen = new Set()
        setRelationships(list.filter(r => {
          if (seen.has(r.lookupCode)) return false
          seen.add(r.lookupCode)
          return true
        }))
      })
      .catch(() => setRelationships([]))

    fetchMasterData('BLOOD_TYPE')
      .then(res => {
        const list = Array.isArray(res) ? res : (res?.data || [])
        // deduplicate by lookupCode
        const seen = new Set()
        const unique = list.filter(b => {
          if (seen.has(b.lookupCode)) return false
          seen.add(b.lookupCode)
          return true
        })
        setBloodTypes(unique)
      })
      .catch(() => setBloodTypes([]))

    fetchUsers()
      .then(res => {
        const users = Array.isArray(res) ? res : (res?.data || [])
        const getName = u => [u.firstName, u.lastName].filter(Boolean).join(' ') || u.username
        const toOption = u => ({ value: u.userId, label: getName(u), sublabel: u.designation || u.qualification || '' })
        setDoctors(users.filter(u => u.userType === 'DOCTOR').map(toOption))
        setNurses(users.filter(u => u.userType === 'NURSE').map(toOption))
      })
      .catch(() => {})

    const dedup = (list) => {
      const seen = new Set()
      return list.filter(s => {
        if (seen.has(s.lookupCode)) return false
        seen.add(s.lookupCode)
        return true
      })
    }

    fetchMasterData('PATIENT_STATUS')
      .then(res => setPatientStatuses(dedup(Array.isArray(res) ? res : (res?.data || []))))
      .catch(() => setPatientStatuses([]))
  }, [])

  // if editing existing patient — fetch patient + NOK in parallel and pre-fill form
  useEffect(() => {
    if (!patientData) return
    setFetchLoading(true)
    Promise.all([
      fetchPatientById(patientData.id),
      fetchNokByPatientId(patientData.id),
      fetchMedical(patientData.id).catch(() => null),
      fetchAdmission(patientData.id).catch(() => null),
    ])
      .then(([patientRes, nokRes, medicalRes, admissionRes]) => {
        const data      = patientRes?.data    !== undefined ? patientRes.data    : patientRes
        const nok       = nokRes?.data        !== undefined ? nokRes.data        : nokRes
        const medical   = medicalRes?.data    !== undefined ? medicalRes?.data   : medicalRes
        const admission = admissionRes?.data  !== undefined ? admissionRes?.data : admissionRes

        if (medical) {
          setPhysicianId(medical.primaryPhysicianId || null)
          setNurseId(medical.nurseId || null)
          setMedicalSaved(true)
        }

        if (admission) {
          setAdmissionId(admission.id || null)
          setAdmissionSaved(true)
        }

        reset({
          firstName:        data.firstName || '',
          lastName:         data.lastName  || '',
          dob:              data.dob       || '',
          gender:           data.gender    || '',
          patientId:        data.patientId || '',
          physician:        medical?.primaryPhysicianName || '',
          nurse:            medical?.nurseName            || '',
          allergies:        medical?.allergies            || '',
          medicalAlerts:    medical?.medicalAlerts        || '',
          medications:      medical?.currentMedication    || '',
          bloodType:        medical?.bloodType            || '',
          admissionDate:    admission?.admissionDate      || '',
          room:             admission?.roomNumber         || '',
          bed:              admission?.bed                || '',
          status:           admission?.status             || 'stable',
          emergencyContact: admission?.emrContactName     || '',
          emergencyPhone:   admission?.phoneNumber        || '',
          notes:            data.notes || '',
          nok: Array.isArray(nok) ? nok.map(n => ({
            id:               n.id            || null,
            firstName:        n.firstName    || '',
            lastName:         n.lastName     || '',
            relationship:     n.relationship || '',
            phone:            n.phoneNumber  || '',
            email:            n.email        || '',
            dob:              n.dob          || '',
            gender:           n.gender       || '',
            primaryContact:   n.primaryContact ? 'yes' : 'no',
            medicalDecisions: n.canMakeMedical ? 'yes' : 'no',
            notes:            n.notes        || '',
          })) : [],
        })
        if (Array.isArray(nok) && nok.length > 0) setNokSaved(true)
      })
      .catch(() => {})
      .finally(() => setFetchLoading(false))
  }, [patientData, reset])

  const addNok = () => append({ id: null, firstName: '', lastName: '', relationship: '', phone: '', email: '', dob: '', gender: '', primaryContact: 'no', medicalDecisions: 'no', notes: '' })

  // Step 1 Next — POST if new, PUT if already created (user went back)
  const handleStep1Next = async () => {
    const valid = await trigger(['firstName', 'lastName', 'dob', 'gender'])
    if (!valid) return
    setStepError('')
    setStepLoading(true)
    try {
      const values = getValues()
      const basicPayload = {
        firstName: values.firstName,
        lastName:  values.lastName,
        dob:       values.dob,
        gender:    values.gender,
      }

      let patient = createdPatient

      if (patient) {
        // already created — update instead
        await updatePatientBasic(patient.id, basicPayload)
      } else {
        // first time — create
        patient = await createPatient(basicPayload)
        setCreatedPatient(patient)
      }

      // NOK — if list has entries: PUT if already saved, POST if new
      if (values.nok?.length > 0) {
        if (nokSaved) {
          // PUT /patients/{id}/nok with full updated list
          await updateNok(patient.id, values.nok)
        } else {
          // POST /patients/{id}/nok first time
          await createNok(patient.id, values.nok)
          setNokSaved(true)
        }
      } else if (nokSaved) {
        // list was cleared — send empty array via PUT to remove all
        await updateNok(patient.id, [])
      }

      setStep(2)
    } catch (err) {
      setStepError(err?.message || 'Failed to save. Please try again.')
    } finally {
      setStepLoading(false)
    }
  }

  const onSubmit = async (data) => {
    const patientId = createdPatient?.id || patientData?.id
    if (data.notes && patientId) {
      try { await savePatientNotes(patientId, data.notes) } catch (_) {}
    }
    setSaveSuccess(true)
  }

  const handleStep2Next = async () => {
    setStepError('')
    setStepLoading(true)
    try {
      const values    = getValues()
      const patientId = createdPatient?.id || patientData?.id
      const payload = {
        primaryPhysicianId:   physicianId,
        primaryPhysicianName: values.physician    || null,
        nurseId:              nurseId,
        nurseName:            values.nurse         || null,
        bloodType:            values.bloodType     || null,
        allergies:            values.allergies     || null,
        medicalAlerts:        values.medicalAlerts || null,
        currentMedication:    values.medications   || null,
      }
      if (medicalSaved) {
        await saveMedical(patientId, payload)
      } else {
        await createMedical(patientId, payload)
        setMedicalSaved(true)
      }
      setStep(3)
    } catch (err) {
      setStepError(err?.message || 'Failed to save medical info. Please try again.')
    } finally {
      setStepLoading(false)
    }
  }

  // Step 3 Next — POST first time, PUT if already saved
  const handleStep3Next = async () => {
    const valid = await trigger(['admissionDate'])
    if (!valid) return
    setStepError('')
    setStepLoading(true)
    try {
      const values    = getValues()
      const patientId = createdPatient?.id || patientData?.id
      const payload = {
        admissionDate:  values.admissionDate    || null,
        roomNumber:     values.room             || null,
        bed:            values.bed              || null,
        status:         values.status           || null,
        emrContactName: values.emergencyContact || null,
        phoneNumber:    values.emergencyPhone   || null,
      }
      if (admissionSaved) {
        await updateAdmission(patientId, { id: admissionId, ...payload })
      } else {
        const res = await createAdmission(patientId, payload)
        const created = res?.data !== undefined ? res.data : res
        setAdmissionId(created?.id || null)
        setAdmissionSaved(true)
      }
      setStep(4)
    } catch (err) {
      setStepError(err?.message || 'Failed to save admission info. Please try again.')
    } finally {
      setStepLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-container modal-large">
        <div className="modal-header">
          <h2 className="modal-title">{patientData ? 'Complete Patient Profile' : 'Add New Patient'}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        <div className="modal-body">
          {saveSuccess ? (
            <div className="save-success">
              <div className="save-success-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="rgba(16,185,129,0.1)" stroke="#10B981" strokeWidth="2"/>
                  <path d="M7 13L10 16L17 9" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="save-success-title">Patient Details Saved!</h3>
              <p className="save-success-msg">The patient profile has been successfully saved.</p>
            </div>
          ) : fetchLoading ? (
            <div className="modal-fetch-loading">
              <span className="fetch-spinner" />
              <p>Loading patient data...</p>
            </div>
          ) : (
            <>
              {/* Wizard Progress */}
              <div className="wizard-progress">
                <div className="wizard-progress-bar">
                  <div className="wizard-progress-bar-fill" style={{ width: PROGRESS[step - 1] }} />
                </div>
                <div className="wizard-progress-steps">
                  {STEPS.map((label, i) => (
                    <div key={label} className={`wizard-progress-step${step === i + 1 ? ' active' : ''}${step > i + 1 ? ' completed' : ''}`}>
                      <span className="step-number">{step > i + 1 ? '✓' : i + 1}</span>
                      <span className="step-label">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <form id="patientForm" onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1 */}
            {step === 1 && (
              <>
                <div className="form-section">
                  <h3 className="form-section-title">Personal Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">First Name *</label>
                      <input type="text" className={`form-input${errors.firstName ? ' input-error' : ''}`} placeholder="Enter first name" {...register('firstName')} />
                      {errors.firstName && <span className="error-msg">{errors.firstName.message}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last Name *</label>
                      <input type="text" className={`form-input${errors.lastName ? ' input-error' : ''}`} placeholder="Enter last name" {...register('lastName')} />
                      {errors.lastName && <span className="error-msg">{errors.lastName.message}</span>}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Date of Birth *</label>
                      <input type="date" className={`form-input${errors.dob ? ' input-error' : ''}`} {...register('dob')} />
                      {errors.dob && <span className="error-msg">{errors.dob.message}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Gender *</label>
                      <div className="gender-options">
                        <label className="gender-option">
                          <input type="radio" value="male" {...register('gender')} />
                          <span className="gender-icon"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/><path d="M6 20C6 17.7909 7.79086 16 10 16H14C16.2091 16 18 17.7909 18 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></span>
                          <span className="gender-label">Male</span>
                        </label>
                        <label className="gender-option">
                          <input type="radio" value="female" {...register('gender')} />
                          <span className="gender-icon"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/><path d="M12 11V21M8 17H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></span>
                          <span className="gender-label">Female</span>
                        </label>
                      </div>
                      {errors.gender && <span className="error-msg">{errors.gender.message}</span>}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Patient ID</label>
                    <input type="text" className="form-input" placeholder="Auto-generated if left empty" {...register('patientId')} />
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-header">
                    <h3 className="form-section-title">Next of Kin (NOK)</h3>
                    <button type="button" className="btn-add-nok" onClick={addNok}>
                      <svg viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Add NOK
                    </button>
                  </div>
                  {fields.map((field, index) => (
                    <div key={field.id} className="nok-entry">
                      <div className="nok-entry-header">
                        <h4 className="nok-entry-title">Next of Kin {index + 1}</h4>
                        <button type="button" className="btn-delete-nok" onClick={() => remove(index)}>
                          <svg viewBox="0 0 24 24" fill="none"><path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">First Name *</label>
                          <input type="text" className={`form-input${errors.nok?.[index]?.firstName ? ' input-error' : ''}`} placeholder="First name" {...register(`nok.${index}.firstName`)} />
                          {errors.nok?.[index]?.firstName && <span className="error-msg">{errors.nok[index].firstName.message}</span>}
                        </div>
                        <div className="form-group">
                          <label className="form-label">Last Name *</label>
                          <input type="text" className={`form-input${errors.nok?.[index]?.lastName ? ' input-error' : ''}`} placeholder="Last name" {...register(`nok.${index}.lastName`)} />
                          {errors.nok?.[index]?.lastName && <span className="error-msg">{errors.nok[index].lastName.message}</span>}
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Relationship *</label>
                          <select className={`form-input${errors.nok?.[index]?.relationship ? ' input-error' : ''}`} {...register(`nok.${index}.relationship`)}>
                            <option value="">Select relationship</option>
                            {relationships.map(r => (
                              <option key={r.id} value={r.lookupCode}>{r.lookupItem}</option>
                            ))}
                          </select>
                          {errors.nok?.[index]?.relationship && <span className="error-msg">{errors.nok[index].relationship.message}</span>}
                        </div>
                        <div className="form-group">
                          <label className="form-label">Phone *</label>
                          <input type="tel" className={`form-input${errors.nok?.[index]?.phone ? ' input-error' : ''}`} placeholder="(555) 123-4567" {...register(`nok.${index}.phone`)} />
                          {errors.nok?.[index]?.phone && <span className="error-msg">{errors.nok[index].phone.message}</span>}
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Email</label>
                          <input type="email" className="form-input" placeholder="email@example.com" {...register(`nok.${index}.email`)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Date of Birth</label>
                          <input type="date" className="form-input" {...register(`nok.${index}.dob`)} />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Gender</label>
                          <select className="form-input" {...register(`nok.${index}.gender`)}>
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Primary Contact</label>
                          <select className="form-input" {...register(`nok.${index}.primaryContact`)}>
                            <option value="no">No</option>
                            <option value="yes">Yes</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Can Make Medical Decisions</label>
                          <select className="form-input" {...register(`nok.${index}.medicalDecisions`)}>
                            <option value="no">No</option>
                            <option value="yes">Yes</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Notes</label>
                        <textarea className="form-textarea" rows="2" placeholder="Additional notes..." {...register(`nok.${index}.notes`)} />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="form-section">
                <h3 className="form-section-title">Medical Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Primary Physician</label>
                    <Controller
                      name="physician"
                      control={control}
                      render={({ field }) => (
                        <AutoComplete
                          value={field.value || ''}
                          onChange={(label, opt) => {
                            field.onChange(label)
                            setPhysicianId(opt?.value || null)
                          }}
                          options={doctors}
                          placeholder="Search doctor..."
                        />
                      )}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Attending Nurse</label>
                    <Controller
                      name="nurse"
                      control={control}
                      render={({ field }) => (
                        <AutoComplete
                          value={field.value || ''}
                          onChange={(label, opt) => {
                            field.onChange(label)
                            setNurseId(opt?.value || null)
                          }}
                          options={nurses}
                          placeholder="Search nurse..."
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Allergies</label>
                  <textarea className="form-textarea" placeholder="List any known allergies" rows="2" {...register('allergies')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Medical Alerts</label>
                  <textarea className="form-textarea" placeholder="Important medical alerts or warnings" rows="2" {...register('medicalAlerts')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Current Medications</label>
                  <textarea className="form-textarea" placeholder="List current medications and dosages" rows="3" {...register('medications')} />
                </div>
                <div className="form-group" style={{ maxWidth: '50%' }}>
                  <label className="form-label">Blood Type</label>
                  <select className="form-input" {...register('bloodType')}>
                    <option value="">Select blood type</option>
                    {bloodTypes.map(b => (
                      <option key={b.id} value={b.lookupCode}>{b.lookupItem}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="form-section">
                <h3 className="form-section-title">Admission Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Admission Date *</label>
                    <input type="date" className={`form-input${errors.admissionDate ? ' input-error' : ''}`} {...register('admissionDate')} />
                    {errors.admissionDate && <span className="error-msg">{errors.admissionDate.message}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Room Number</label>
                    <input type="text" className="form-input" placeholder="e.g., 204" {...register('room')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bed</label>
                    <input type="text" className="form-input" placeholder="e.g., A" {...register('bed')} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-input" {...register('status')}>
                      <option value="">Select status</option>
                      {patientStatuses.map(s => (
                        <option key={s.id} value={s.lookupCode}>{s.lookupItem}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Emergency Contact Name</label>
                    <input type="text" className="form-input" placeholder="Contact name" {...register('emergencyContact')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Emergency Contact Phone</label>
                    <input type="tel" className="form-input" placeholder="(555) 123-4567" {...register('emergencyPhone')} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <div className="form-section">
                <h3 className="form-section-title">Additional Notes</h3>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-textarea" placeholder="Any additional information about the patient" rows="6" {...register('notes')} />
                </div>
              </div>
            )}
          </form>
              {stepError && <p className="step-api-error">{stepError}</p>}
            </>
          )}
        </div>

        <div className="modal-footer wizard-footer">
          {saveSuccess ? (
            <button className="btn-primary" onClick={() => { onSave({}); onClose() }}>
              <svg viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Done
            </button>
          ) : (
            <>
              <button className="btn-secondary" onClick={onClose}>Cancel</button>
              <div className="wizard-footer-actions">
                {step > 1 && <button type="button" className="btn-secondary" onClick={() => setStep(s => s - 1)}>Back</button>}
                {step === 1 && (
                  <button type="button" className="btn-primary" onClick={handleStep1Next} disabled={stepLoading}>
                    {stepLoading ? <span className="btn-spinner" /> : 'Next'}
                  </button>
                )}
                {step > 1 && step < 4 && (
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={step === 2 ? handleStep2Next : step === 3 ? handleStep3Next : () => setStep(s => s + 1)}
                    disabled={stepLoading}
                  >
                    {stepLoading && (step === 2 || step === 3) ? <span className="btn-spinner" /> : 'Next'}
                  </button>
                )}
                {step === 4 && (
                  <button className="btn-primary" form="patientForm" type="submit" disabled={loading}>
                    {loading ? <span className="btn-spinner" /> : <><svg viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Save Patient</>}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
