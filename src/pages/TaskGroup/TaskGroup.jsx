import { useState, useEffect } from 'react'
import { apiGet, apiPost, apiPut } from '../../api/apiService'
import { useSetPageTitle } from '../../hooks/useSetPageTitle'
import '../../components/UI/UI.css'
import '../../components/UI/Form.css'
import '../TaskMaster/TaskMaster.css'

export default function TaskGroup() {
  useSetPageTitle('Task Groups')

  const [groups, setGroups] = useState([])
  const [allTasks, setAllTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [groupName, setGroupName] = useState('')
  const [active, setActive] = useState(true)
  const [selectedIds, setSelectedIds] = useState([])
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadGroups = () => {
    setLoading(true)
    apiGet('/task-groups')
      .then(res => setGroups(Array.isArray(res) ? res : (res?.data || [])))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    apiGet('/tasks')
      .then(res => setAllTasks((Array.isArray(res) ? res : (res?.data || [])).filter((t) => t.active !== false)))
      .catch(() => {})
    loadGroups()
  }, [])

  const resetForm = () => {
    setGroupName('')
    setActive(true)
    setSelectedIds([])
    setEditId(null)
    setError('')
    setSuccess('')
  }

  const handleEdit = (group) => {
    setEditId(group.id)
    setGroupName(group.groupName || group.name || '')
    setActive(group.active !== false)
    setSelectedIds(group.tasks?.map((t) => t.id) || [])
    setError('')
    setSuccess('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleTask = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!groupName.trim()) {
      setError('Group name is required')
      return
    }
    if (selectedIds.length === 0) {
      setError('Select at least one task')
      return
    }
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const payload = { groupName: groupName.trim(), taskIds: selectedIds, active }
      if (editId) {
        await apiPut(`/task-groups/${editId}`, payload)
        setSuccess('Task group updated successfully!')
      } else {
        await apiPost('/task-groups', payload)
        setSuccess('Task group created successfully!')
      }
      resetForm()
      loadGroups()
    } catch (err) {
      setError(err?.message || 'Failed to save task group.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="task-page">
      <div className="task-form-card">
        <h2 className="task-form-title">{editId ? 'Edit Task Group' : 'Create Task Group'}</h2>

        {success && <div className="save-status save-status--success">{success}</div>}
        {error && <div className="save-status save-status--error">{error}</div>}

        <form className="task-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Group Name *</label>
            <input
              type="text"
              className="form-input"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Morning Vitals"
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
          <div className="form-group">
            <label className="form-label">Select Tasks *</label>
            {allTasks.length === 0 ? (
              <p className="form-helper">No active tasks available. Create tasks first.</p>
            ) : (
              <div className="task-checkbox-grid">
                {allTasks.map((task) => (
                  <label key={task.id} className={`task-checkbox-item${selectedIds.includes(task.id) ? ' selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(task.id)}
                      onChange={() => toggleTask(task.id)}
                    />
                    <span>{task.taskName || task.name || '--'}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="task-form-actions">
            {editId && <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>}
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editId ? 'Update Group' : 'Save Group'}
            </button>
          </div>
        </form>
      </div>

      <div className="task-list-card">
        <h2 className="task-form-title">All Task Groups</h2>
        {loading ? (
          <div className="task-loading">Loading...</div>
        ) : groups.length === 0 ? (
          <p className="task-empty">No task groups created yet.</p>
        ) : (
          <div className="task-group-list">
            {groups.map((group) => (
              <div key={group.id} className="task-group-item">
                <div className="task-group-header">
                  <div>
                    <span className="task-group-name">{group.groupName || group.name || '--'}</span>
                    <span className={`task-badge ${group.active ? 'task-badge--active' : 'task-badge--inactive'}`} style={{ marginLeft: 10 }}>
                      {group.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <button className="btn-view-sm" onClick={() => handleEdit(group)}>
                    <svg viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Edit
                  </button>
                </div>
                <div className="task-group-tasks">
                  {group.tasks?.map((task) => (
                    <span key={task.id} className="task-tag">{task.taskName || task.name || '--'}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
