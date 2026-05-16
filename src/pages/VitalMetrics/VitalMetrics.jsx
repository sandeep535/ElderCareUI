import { useState, useEffect } from 'react'
import { fetchVitalMetrics, bulkUpdateVitalMetrics } from '../../api/endpoints'
import { useSetPageTitle } from '../../hooks/useSetPageTitle'
import { ErrorState } from '../../components/UI/UI'
import '../../components/UI/UI.css'
import '../../components/UI/Form.css'
import './VitalMetrics.css'

const CATEGORIES = ['ALL', 'CLINICAL', 'BODY_COMPOSITION']

export default function VitalMetrics() {
  useSetPageTitle('Vital Metrics', 'Configure vital field settings')

  const [metrics,   setMetrics]   = useState([])
  const [edits,     setEdits]     = useState({})   // { [id]: { lowValue, highValue, normalRange, mandatory, display } }
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')
  const [saveMsg,   setSaveMsg]   = useState('')
  const [category,  setCategory]  = useState('ALL')

  useEffect(() => {
    fetchVitalMetrics()
      .then(res => {
        const data = res?.data !== undefined ? res.data : res
        const list = Array.isArray(data) ? data : []
        setMetrics(list.sort((a, b) => a.sortOrder - b.sortOrder))
        // seed edits with current values
        const initial = {}
        list.forEach(m => {
          initial[m.id] = {
            mandatory:   m.mandatory,
            display:     m.display,
            lowValue:    m.lowValue  ?? '',
            highValue:   m.highValue ?? '',
            normalRange: m.normalRange ?? '',
          }
        })
        setEdits(initial)
      })
      .catch(() => setError('Failed to load vital metrics'))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (id, field, value) => {
    setEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
    setSaveMsg('')
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveMsg('')
    setError('')
    try {
      const payload = Object.entries(edits).map(([id, vals]) => ({
        id: Number(id),
        mandatory:   vals.mandatory,
        display:     vals.display,
        lowValue:    vals.lowValue  !== '' ? Number(vals.lowValue)  : null,
        highValue:   vals.highValue !== '' ? Number(vals.highValue) : null,
        normalRange: vals.normalRange || null,
      }))
      await bulkUpdateVitalMetrics(payload)
      setSaveMsg('Saved successfully')
    } catch {
      setError('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const filtered = metrics.filter(m => category === 'ALL' || m.category === category)

  const grouped = filtered.reduce((acc, m) => {
    const cat = m.category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(m)
    return acc
  }, {})

  if (loading) return (
    <div className="vm-loading">
      <span className="btn-spinner" style={{ width: 32, height: 32, borderTopColor: 'var(--color-primary)', borderColor: 'var(--color-gray-light)', borderWidth: 3 }} />
    </div>
  )

  if (error && metrics.length === 0) return <ErrorState message={error} onRetry={() => window.location.reload()} />

  return (
    <div className="vm-page">
      {/* Toolbar */}
      <div className="vm-toolbar">
        <div className="vm-filters">
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`vm-filter-btn${category === c ? ' active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c === 'ALL' ? 'All' : c === 'CLINICAL' ? 'Clinical' : 'Body Composition'}
            </button>
          ))}
        </div>
        <div className="vm-toolbar-right">
          {saveMsg && <span className="vm-save-msg">✓ {saveMsg}</span>}
          {error   && <span className="vm-error-msg">{error}</span>}
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Table per category */}
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} className="vm-section">
          <h3 className="vm-section-title">
            {cat === 'CLINICAL' ? 'Clinical Vitals' : 'Body Composition'}
          </h3>
          <div className="vm-table-wrap">
            <table className="vm-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Field</th>
                  <th>Unit</th>
                  <th>Normal Range</th>
                  <th>Low Value</th>
                  <th>High Value</th>
                  <th>Normal Range Text</th>
                  <th>Mandatory</th>
                  <th>Display</th>
                </tr>
              </thead>
              <tbody>
                {items.map((m, i) => {
                  const e = edits[m.id] || {}
                  return (
                    <tr key={m.id} className={e.mandatory ? 'vm-row--mandatory' : ''}>
                      <td className="vm-cell-num">{i + 1}</td>
                      <td>
                        <span className="vm-field-name">{m.displayName}</span>
                        <span className="vm-field-key">{m.fieldKey}</span>
                      </td>
                      <td><span className="vm-unit">{m.unit}</span></td>
                      <td>
                        {m.normalRange
                          ? <span className="vm-range-badge">{m.normalRange}</span>
                          : <span className="vm-na">—</span>
                        }
                      </td>
                      <td>
                        <input
                          type="number"
                          className="vm-input"
                          value={e.lowValue ?? ''}
                          placeholder="—"
                          onChange={ev => handleChange(m.id, 'lowValue', ev.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="vm-input"
                          value={e.highValue ?? ''}
                          placeholder="—"
                          onChange={ev => handleChange(m.id, 'highValue', ev.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="vm-input vm-input--wide"
                          value={e.normalRange ?? ''}
                          placeholder="e.g. 90 - 139"
                          onChange={ev => handleChange(m.id, 'normalRange', ev.target.value)}
                        />
                      </td>
                      <td>
                        <label className="vm-toggle">
                          <input
                            type="checkbox"
                            checked={!!e.mandatory}
                            onChange={ev => handleChange(m.id, 'mandatory', ev.target.checked)}
                          />
                          <span className="vm-toggle-track" />
                        </label>
                      </td>
                      <td>
                        <label className="vm-toggle">
                          <input
                            type="checkbox"
                            checked={!!e.display}
                            onChange={ev => handleChange(m.id, 'display', ev.target.checked)}
                          />
                          <span className="vm-toggle-track" />
                        </label>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
