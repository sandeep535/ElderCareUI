import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { fetchMasterData, fetchUsers } from '../../api/endpoints'
import AutoComplete from '../AutoComplete/AutoComplete'
import '../UI/UI.css'
import '../UI/Form.css'
import './ClinicalNoteModal.css'

const schema = yup.object({
  noteTitle: yup.string().required('Title is required'),
  noteDate:  yup.string().required('Date & time is required'),
  notes:     yup.string().required('Clinical note is required'),
  notesTypeId: yup.string().required('Note type is required'),
  priorityId:  yup.string(),
})

export default function ClinicalNoteModal({ onClose, onSave }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  })

  const [noteTypes,    setNoteTypes]    = useState([])
  const [priorities,   setPriorities]   = useState([])
  const [users,        setUsers]        = useState([])
  const [recordedById, setRecordedById] = useState(null)
  const [saving,       setSaving]       = useState(false)
  const [saveStatus,   setSaveStatus]   = useState(null)
  const [errorMsg,     setErrorMsg]     = useState('')

  useEffect(() => {
    fetchMasterData('NOTES_TYPE')
      .then(res => setNoteTypes(Array.isArray(res) ? res : (res?.data || [])))
      .catch(() => {})
    fetchMasterData('CLINICAL_NOTE_PRIORITY')
      .then(res => setPriorities(Array.isArray(res) ? res : (res?.data || [])))
      .catch(() => {})
    fetchUsers()
      .then(res => {
        const list = Array.isArray(res) ? res : (res?.data || [])
        setUsers(list.map(u => ({
          value: u.userId,
          label: [u.firstName, u.lastName].filter(Boolean).join(' '),
          sublabel: u.designation || u.userType || '',
        })))
      })
      .catch(() => {})
  }, [])

  const onSubmit = async (data) => {
    setSaving(true)
    setSaveStatus(null)
    try {
      await onSave({
        noteTitle:   data.noteTitle,
        noteDate:    data.noteDate,
        notes:       data.notes,
        notesTypeId: Number(data.notesTypeId),
        priorityId:  data.priorityId ? Number(data.priorityId) : null,
        recordedById,
      })
      setSaveStatus('success')
      setTimeout(onClose, 1500)
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to save note. Please try again.')
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">Add Clinical Note</h2>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
        <div className="modal-body">
          {saveStatus === 'success' && (
            <div className="save-status save-status--success">
              <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#10B981" strokeWidth="2"/><path d="M7 13L10 16L17 9" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Note saved successfully!
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="save-status save-status--error">
              <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="2"/><path d="M12 8V12M12 16H12.01" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/></svg>
              {errorMsg}
            </div>
          )}
          <form id="noteForm" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label className="form-label">Note Title *</label>
              <input type="text" className={`form-input${errors.noteTitle ? ' input-error' : ''}`} placeholder="Brief title for this note" {...register('noteTitle')} />
              {errors.noteTitle && <span className="error-msg">{errors.noteTitle.message}</span>}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Note Type *</label>
                <select className={`form-input${errors.notesTypeId ? ' input-error' : ''}`} {...register('notesTypeId')}>
                  <option value="">Select note type</option>
                  {noteTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.lookupItem}</option>
                  ))}
                </select>
                {errors.notesTypeId && <span className="error-msg">{errors.notesTypeId.message}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-input" {...register('priorityId')}>
                  <option value="">Select priority</option>
                  {priorities.map(p => (
                    <option key={p.id} value={p.id}>{p.lookupItem}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Date & Time *</label>
              <input type="datetime-local" className={`form-input${errors.noteDate ? ' input-error' : ''}`} {...register('noteDate')} />
              {errors.noteDate && <span className="error-msg">{errors.noteDate.message}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Clinical Note *</label>
              <textarea className={`form-textarea${errors.notes ? ' input-error' : ''}`} placeholder="Enter your clinical note here..." rows="5" {...register('notes')} />
              {errors.notes && <span className="error-msg">{errors.notes.message}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Recorded By</label>
              <AutoComplete
                value=""
                onChange={(label, opt) => setRecordedById(opt?.value || null)}
                options={users}
                placeholder="Search user..."
              />
            </div>
          </form>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" form="noteForm" type="submit" disabled={saving}>
            {saving
              ? <span className="btn-spinner" />
              : <><svg viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Save Note</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}
