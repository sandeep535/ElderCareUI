import { useState, useEffect } from 'react'
import { apiGet, apiPost, apiPut } from '../../api/apiService'
import { useSetPageTitle } from '../../hooks/useSetPageTitle'
import '../../components/UI/UI.css'
import '../../components/UI/Form.css'
import './TaskMaster.css'

export default function TaskMaster() {
  useSetPageTitle('Task Master')

  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [taskName, setTaskName] = useState('')
  const [active, setActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadTasks = () => {
    setLoading(true)
    apiGet('/tasks')
      .then(res => setTasks(Array.isArray(res) ? res : (res?.data || [])))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadTasks()
  }, [])

  const resetForm = () => {
    setTaskName('')
    setActive(true)
    setEditId(null)
    setError('')
    setSuccess('')
  }

  const handleEdit = (task) => {
    setEditId(task.id)
    setTaskName(task.taskName || task.name || '')
    setActive(task.active !== false)
    setError('')
    setSuccess('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!taskName.trim()) {
      setError('Task name is required')
      return
    }
    setSaving(true)
    setError('')
    setSuccess('')

    const payload = { taskName: taskName.trim(), active }
    try {
      if (editId) {
        await apiPut(`/tasks/${editId}`, payload)
        setSuccess('Task updated successfully!')
      } else {
        await apiPost('/tasks', payload)
        setSuccess('Task created successfully!')
      }
      resetForm()
      loadTasks()
    } catch (err) {
      setError(err?.message || 'Failed to save task.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="task-page">
      <div className="task-form-card">
        <h2 className="task-form-title">{editId ? 'Edit Task' : 'Create Task'}</h2>

        {success && <div className="save-status save-status--success">{success}</div>}
        {error && <div className="save-status save-status--error">{error}</div>}

        <form className="task-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Task Name *</label>
            <input
              type="text"
              className="form-input"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g. Blood Pressure Check"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Active</label>
            <div className="task-radio-group">
              <label className="task-radio-label">
                <input type="radio" checked={active === true} onChange={() => setActive(true)} /> Yes
              </label>
              <label className="task-radio-label">
                <input type="radio" checked={active === false} onChange={() => setActive(false)} /> No
              </label>
            </div>
          </div>

          <div className="task-form-actions">
            {editId && <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>}
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editId ? 'Update Task' : 'Save Task'}
            </button>
          </div>
        </form>
      </div>

      <div className="task-list-card">
        <h2 className="task-form-title">All Tasks</h2>
        {loading ? (
          <div className="task-loading">Loading...</div>
        ) : tasks.length === 0 ? (
          <p className="task-empty">No tasks created yet.</p>
        ) : (
          <table className="task-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Task Name</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => (
                <tr key={task.id || index}>
                  <td>{index + 1}</td>
                  <td style={{ fontWeight: 600 }}>{task.taskName || task.name || '--'}</td>
                  <td>
                    <span className={`task-badge ${task.active ? 'task-badge--active' : 'task-badge--inactive'}`}>
                      {task.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-view-sm" onClick={() => handleEdit(task)}>
                      <svg viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
