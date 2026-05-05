import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { fetchMasterData } from '../../api/endpoints'
import '../UI/UI.css'
import '../UI/Form.css'
import './AddSurgeryModal.css'

const schema = yup.object({
  name:          yup.string().required('Surgery name is required'),
  date:          yup.string().required('Date is required'),
  type:          yup.string(),
  surgeon:       yup.string(),
  facility:      yup.string(),
  procedureCode: yup.string(),
  notes:         yup.string(),
})

export default function AddSurgeryModal({ onClose, onSave, viewData = null }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { type: '' },
  })

  const [surgeryTypes, setSurgeryTypes] = useState([])
  const [saving,       setSaving]       = useState(false)
  const [saveStatus,   setSaveStatus]   = useState(null)
  const [errorMsg,     setErrorMsg]     = useState('')

  useEffect(() => {
    fetchMasterData('SURGERY_TYPE')
      .then(res => setSurgeryTypes(Array.isArray(res) ? res : (res?.data || [])))
      .catch(() => {})
  }, [])

  if (viewData) return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">Surgery Details</h2>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
        <div className="modal-body">
          <div className="view-detail-grid">
            {[['Surgery Name',    viewData.surgeryName],
              ['Surgery Date',    viewData.surgeryDate || '--'],
              ['Surgery Type',    viewData.surgeryTypeDisplay || viewData.surgeryType || '--'],
              ['Surgeon',         viewData.surgeon || '--'],
              ['Hospital',        viewData.hospital || '--'],
              ['Procedure Code',  viewData.procedureCode || '--'],
              ['Notes',           viewData.notes || '--'],
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
        surgeryName:   data.name,
        surgeryDate:   data.date,
        surgeryTypeId: data.type ? Number(data.type) : null,
        surgeon:       data.surgeon       || null,
        hospital:      data.facility      || null,
        procedureCode: data.procedureCode || null,
        notes:         data.notes         || null,
      })
      setSaveStatus('success')
      setTimeout(onClose, 1500)
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to save surgery. Please try again.')
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">Add Surgery</h2>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
        <div className="modal-body">
          {saveStatus === 'success' && (
            <div className="save-status save-status--success">
              <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#10B981" strokeWidth="2"/><path d="M7 13L10 16L17 9" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Surgery saved successfully!
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="save-status save-status--error">
              <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="2"/><path d="M12 8V12M12 16H12.01" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/></svg>
              {errorMsg}
            </div>
          )}
          <form id="surgeryForm" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label className="form-label">Surgery Name *</label>
              <input type="text" className={`form-input${errors.name ? ' input-error' : ''}`} placeholder="e.g., Hip Replacement, Cataract Surgery" {...register('name')} />
              {errors.name && <span className="error-msg">{errors.name.message}</span>}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Surgery Date *</label>
                <input type="date" className={`form-input${errors.date ? ' input-error' : ''}`} {...register('date')} />
                {errors.date && <span className="error-msg">{errors.date.message}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Surgery Type</label>
                <select className="form-input" {...register('type')}>
                  <option value="">Select type</option>
                  {surgeryTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.lookupItem}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Surgeon</label>
              <input type="text" className="form-input" placeholder="e.g., Dr. John Smith" {...register('surgeon')} />
            </div>
            <div className="form-group">
              <label className="form-label">Hospital / Facility</label>
              <input type="text" className="form-input" placeholder="e.g., General Hospital" {...register('facility')} />
            </div>
            <div className="form-group">
              <label className="form-label">Procedure Code (Optional)</label>
              <input type="text" className="form-input" placeholder="e.g., CPT code" {...register('procedureCode')} />
            </div>
            <div className="form-group">
              <label className="form-label">Notes (Optional)</label>
              <textarea className="form-textarea" placeholder="Add any additional notes..." rows="4" {...register('notes')} />
            </div>
          </form>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" form="surgeryForm" type="submit" disabled={saving}>
            {saving
              ? <span className="btn-spinner" />
              : <><svg viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Save Surgery</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}
