import { useForm } from 'react-hook-form'
import { useState, useEffect, useRef } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { fetchMasterData } from '../../api/endpoints'
import '../UI/UI.css'
import '../UI/Form.css'
import './AddTaskModal.css'

const schema = yup.object({
  taskIds:           yup.array().min(1, 'Select at least one task'),
  taskGroupIds:      yup.array(),
  scheduledDateTime: yup.string().required('Scheduled date/time is required'),
  status:            yup.string().required('Status is required'),
  notes:             yup.string(),
})

export default function AddTaskModal({ onClose, onSave }) {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      taskIds: [],
      taskGroupIds: [],
      scheduledDateTime: '',
      status: 'PENDING',
      notes: '',
    },
  })

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [tasks, setTasks] = useState([])
  const [groups, setGroups] = useState([])
  const wrapperRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [taskRes, groupRes] = await Promise.all([
          fetchMasterData('tasks'),
          fetchMasterData('task-groups'),
        ])
        setTasks(Array.isArray(taskRes) ? taskRes : taskRes?.data || [])
        setGroups(Array.isArray(groupRes) ? groupRes : groupRes?.data || [])
      } catch (err) {
        // ignore load failure
      }
    }
    load()
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleCheckbox = (name, value) => {
    const current = watch(name) || []
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value]
    setValue(name, next, { shouldValidate: true })
  }

  const formatScheduledDateTime = (value) => {
    if (!value) return null
    // datetime-local gives "YYYY-MM-DDTHH:mm" → convert to "dd-mm-yyyy hh:mm"
    const [datePart, timePart] = value.split('T')
    if (!datePart) return null
    const [year, month, day] = datePart.split('-')
    return `${day}-${month}-${year} ${timePart || '00:00'}`
  }

  const onSubmit = async (data) => {
    setSaving(true)
    setSaveError('')
    try {
      await onSave({
        taskIds: data.taskIds,
        taskGroupIds: data.taskGroupIds,
        scheduledDateTime: formatScheduledDateTime(data.scheduledDateTime),
        status: data.status,
        notes: data.notes || null,
      })
      onClose()
    } catch (err) {
      setSaveError(err?.message || 'Unable to save task. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container modal-large" ref={wrapperRef}>
        <div className="modal-header">
          <h2 className="modal-title">Add Patient Task</h2>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        <div className="modal-body">
          {saveError && <div className="save-status save-status--error">{saveError}</div>}
          <form id="taskModalForm" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tasks *</label>
                <div className="task-checkbox-grid">
                  {tasks.length === 0 ? (
                    <p className="form-helper">No task definitions available.</p>
                  ) : tasks.map((task) => (
                    <label key={task.id} className="task-checkbox-item">
                      <input
                        type="checkbox"
                        checked={watch('taskIds')?.includes(task.id)}
                        onChange={() => handleCheckbox('taskIds', task.id)}
                      />
                      <span>{task.lookupItem || task.taskName || task.name}</span>
                    </label>
                  ))}
                </div>
                {errors.taskIds && <span className="error-msg">{errors.taskIds.message}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Task Groups</label>
                <div className="task-checkbox-grid">
                  {groups.length === 0 ? (
                    <p className="form-helper">No groups available.</p>
                  ) : groups.map((group) => (
                    <label key={group.id} className="task-checkbox-item">
                      <input
                        type="checkbox"
                        checked={watch('taskGroupIds')?.includes(group.id)}
                        onChange={() => handleCheckbox('taskGroupIds', group.id)}
                      />
                      <span>{group.lookupItem || group.groupName || group.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Scheduled Date / Time *</label>
                <input type="datetime-local" className={`form-input${errors.scheduledDateTime ? ' input-error' : ''}`} {...register('scheduledDateTime')} />
                {errors.scheduledDateTime && <span className="error-msg">{errors.scheduledDateTime.message}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Status *</label>
                <select className={`form-input${errors.status ? ' input-error' : ''}`} {...register('status')}>
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" rows="4" {...register('notes')} placeholder="Optional task notes" />
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" form="taskModalForm" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Task'}
          </button>
        </div>
      </div>
    </div>
  )
}
