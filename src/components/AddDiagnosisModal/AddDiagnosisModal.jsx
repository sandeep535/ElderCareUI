import { useForm, Controller } from 'react-hook-form'
import { useState, useEffect, useRef } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { fetchMasterData, fetchDiagnosisMaster, fetchUsers } from '../../api/endpoints'
import AutoComplete from '../AutoComplete/AutoComplete'
import '../UI/UI.css'
import '../UI/Form.css'
import './AddDiagnosisModal.css'

const schema = yup.object({
  name:   yup.string().required('Diagnosis name is required'),
  date:   yup.string().required('Date is required'),
  status: yup.string(),
  notes:  yup.string(),
})

export default function AddDiagnosisModal({ onClose, onSave, viewData = null }) {
  const { register, handleSubmit, setValue, control, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { status: '' },
  })

  const [diagnosisList, setDiagnosisList] = useState([])
  const [statusOptions, setStatusOptions] = useState([])
  const [doctors,       setDoctors]       = useState([])
  const [selectedMasterId,  setSelectedMasterId]  = useState(null)
  const [selectedDoctorId,  setSelectedDoctorId]  = useState(null)
  const [suggestions,       setSuggestions]       = useState([])
  const [showSuggestions,   setShowSuggestions]   = useState(false)
  const [saving,            setSaving]            = useState(false)
  const [saveStatus,        setSaveStatus]        = useState(null)
  const [errorMsg,          setErrorMsg]          = useState('')
  const wrapperRef = useRef(null)

  useEffect(() => {
    fetchDiagnosisMaster()
      .then(data => setDiagnosisList(Array.isArray(data) ? data : (data?.data || [])))
      .catch(() => {})
    fetchMasterData('DIAGNOSIS_STATUS')
      .then(res => setStatusOptions(Array.isArray(res) ? res : (res?.data || [])))
      .catch(() => {})
    fetchUsers()
      .then(res => {
        const users = Array.isArray(res) ? res : (res?.data || [])
        setDoctors(users.filter(u => u.userType === 'DOCTOR').map(u => ({
          value: u.userId,
          label: [u.firstName, u.lastName].filter(Boolean).join(' '),
          sublabel: u.designation || '',
        })))
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target))
        setShowSuggestions(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleNameChange = (e) => {
    const val = e.target.value
    setSelectedMasterId(null)
    if (val.length > 0) {
      setSuggestions(diagnosisList.filter(d =>
        d.diagnosisName.toLowerCase().includes(val.toLowerCase()) && d.active
      ))
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  const selectSuggestion = (item) => {
    setValue('name', item.diagnosisName, { shouldValidate: true })
    setSelectedMasterId(item.id)
    setShowSuggestions(false)
  }

  if (viewData) return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">Diagnosis Details</h2>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
        <div className="modal-body">
          <div className="view-detail-grid">
            {[['Diagnosis Name', viewData.diagnosisName],
              ['ICD Code',       viewData.icdCode || '--'],
              ['Status',         viewData.statusDisplay || viewData.status],
              ['Diagnosis Date', viewData.diagnosisDate || '--'],
              ['Diagnosed By',   viewData.diagnosisBy
                ? `${viewData.diagnosisBy.firstName} ${viewData.diagnosisBy.lastName}${viewData.diagnosisBy.designation ? ` (${viewData.diagnosisBy.designation})` : ''}`
                : '--'],
              ['Notes',          viewData.notes || '--'],
            ].map(([label, value]) => (
              <div key={label} className="view-detail-row">
                <span className="view-detail-label">{label}</span>
                <span className="view-detail-value">{value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )

  const onSubmit = async (data) => {
    setSaving(true)
    setSaveStatus(null)
    try {
      await onSave({
        diagnosisName:     data.name,
        status:            data.status,
        diagnosisDate:     data.date,
        notes:             data.notes || null,
        diagnosisMasterId: selectedMasterId,
        diagnosisByUserId: selectedDoctorId,
      })
      setSaveStatus('success')
      setTimeout(onClose, 1500)
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to save diagnosis. Please try again.')
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">Add Diagnosis</h2>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
        <div className="modal-body">
          {saveStatus === 'success' && (
            <div className="save-status save-status--success">
              <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#10B981" strokeWidth="2"/><path d="M7 13L10 16L17 9" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Diagnosis saved successfully!
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="save-status save-status--error">
              <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="2"/><path d="M12 8V12M12 16H12.01" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/></svg>
              {errorMsg}
            </div>
          )}
          <form id="diagnosisForm" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group" ref={wrapperRef} style={{ position: 'relative' }}>
              <label className="form-label">Diagnosis Name *</label>
              <input
                type="text"
                className={`form-input${errors.name ? ' input-error' : ''}`}
                placeholder="e.g., Hypertension, Diabetes"
                {...register('name')}
                onChange={(e) => { register('name').onChange(e); handleNameChange(e) }}
                autoComplete="off"
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul className="autocomplete-list">
                  {suggestions.map(item => (
                    <li key={item.id} className="autocomplete-item" onMouseDown={() => selectSuggestion(item)}>
                      <span>{item.diagnosisName}</span>
                      <span className="autocomplete-icd">{item.icdCode}</span>
                    </li>
                  ))}
                </ul>
              )}
              {errors.name && <span className="error-msg">{errors.name.message}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" {...register('status')}>
                <option value="">Select status</option>
                {statusOptions.map(s => (
                  <option key={s.id} value={s.lookupCode}>{s.lookupItem}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Diagnosis Date *</label>
              <input type="date" className={`form-input${errors.date ? ' input-error' : ''}`} {...register('date')} />
              {errors.date && <span className="error-msg">{errors.date.message}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Diagnosed By</label>
              <AutoComplete
                value=""
                onChange={(label, opt) => setSelectedDoctorId(opt?.value || null)}
                options={doctors}
                placeholder="Search doctor..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Notes (Optional)</label>
              <textarea className="form-textarea" placeholder="Add any additional notes..." rows="4" {...register('notes')} />
            </div>
          </form>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" form="diagnosisForm" type="submit" disabled={saving}>
            {saving
              ? <span className="btn-spinner" />
              : <><svg viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Save Diagnosis</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}
