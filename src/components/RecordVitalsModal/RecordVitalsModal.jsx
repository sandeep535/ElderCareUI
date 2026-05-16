import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { fetchVitalMetricsDisplay } from '../../api/endpoints'
import '../UI/UI.css'
import '../UI/Form.css'
import './RecordVitalsModal.css'

// Map display API fieldKey → POST body key
const FIELD_KEY_MAP = {
  systolic_bp:                'systolic',
  diastolic_bp:               'diastolic',
  heart_rate:                 'bpHeartRate',
  temperature:                'temperature',
  spo2:                       'spo2',
  spo2_heart_rate:            'spo2HeartRate',
  height:                     'height',
  weight:                     'weight',
  bmi:                        'bmi',
  body_fat_percentage:        'bodyFatPercentage',
  body_fat_mass:              'bodyFatMass',
  skeletal_muscle_percentage: 'skeletalMusclePercentage',
  body_water_percentage:      'bodyWaterPercentage',
  total_moisture:             'totalMoisture',
  extracellular_water_pct:    'extracellularWaterPct',
  intracellular_water_pct:    'intracellularWaterPct',
  basal_metabolism:           'basalMetabolism',
  visceral_fat_level:         'visceralFatLevel',
  protein:                    'protein',
  mineral:                    'mineral',
  body_age:                   'bodyAge',
  overall:                    'overall',
}

function VitalBadge({ value, metric }) {
  if (value === '' || value === undefined || !metric) return null
  const num = parseFloat(value)
  if (isNaN(num)) return null
  const { lowValue, highValue } = metric
  let label, color, bg, border
  if (num < lowValue)       { label = 'Low';    color = '#1D4ED8'; bg = '#EFF6FF'; border = '#BFDBFE' }
  else if (num > highValue) { label = 'High';   color = '#B91C1C'; bg = '#FEF2F2'; border = '#FECACA' }
  else                      { label = 'Normal'; color = '#065F46'; bg = '#ECFDF5'; border = '#A7F3D0' }
  return (
    <span style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '2px 8px', borderRadius: 999, marginLeft: 6, color, background: bg, border: `1px solid ${border}` }}>
      {label}
    </span>
  )
}

export default function RecordVitalsModal({ onClose, onSave }) {
  const [metrics, setMetrics] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [saveError, setSaveError] = useState('')

  const { register, handleSubmit, setValue, control, formState: { errors } } = useForm()
  const fieldKeys = metrics.map(m => m.fieldKey)
  const watched   = useWatch({ control, name: fieldKeys })

  useEffect(() => {
    fetchVitalMetricsDisplay()
      .then(res => {
        const data = Array.isArray(res) ? res : res?.data || []
        setMetrics(data.filter(m => m.display && m.active).sort((a, b) => a.sortOrder - b.sortOrder))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const syncDevice = () => metrics.forEach(m => {
    const defaults = { systolic_bp: 120, diastolic_bp: 80, heart_rate: 72, temperature: 98.6, spo2: 98 }
    if (defaults[m.fieldKey] !== undefined) setValue(m.fieldKey, defaults[m.fieldKey])
  })

  const onSubmit = async (data) => {
    setSaving(true)
    setSaveError('')
    try {
      const payload = { notes: data.notes || null }
      metrics.forEach(m => {
        const apiKey = FIELD_KEY_MAP[m.fieldKey] || m.fieldKey
        const val = parseFloat(data[m.fieldKey])
        payload[apiKey] = isNaN(val) ? null : val
      })
      await onSave(payload)
      onClose()
    } catch (err) {
      setSaveError(err?.message || 'Unable to save vitals. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-container modal-large">
        <div className="modal-header">
          <h2 className="modal-title">Record Vital Signs</h2>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        <div className="modal-body">
          {saveError && <div className="save-status save-status--error">{saveError}</div>}

          <div className="vitals-sync-buttons">
            <button type="button" className="btn-sync btn-sync-device" onClick={syncDevice}>
              <svg viewBox="0 0 24 24" fill="none"><rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M12 18H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Sync from Device
            </button>
          </div>

          {loading ? (
            <p className="form-helper" style={{ textAlign: 'center', padding: '24px 0' }}>Loading vital fields...</p>
          ) : (
            <form id="vitalsForm" onSubmit={handleSubmit(onSubmit)}>
              <div className="form-row form-row-2">
                {metrics.map((metric, idx) => {
                  const val = watched[idx]
                  return (
                    <div className="form-group" key={metric.id}>
                      <label className="form-label">
                        {metric.displayName}{metric.mandatory ? ' *' : ''}
                        <VitalBadge value={val} metric={metric} />
                      </label>
                      <div className="form-input-group">
                        <input
                          type="number"
                          step="0.1"
                          className={`form-input${errors[metric.fieldKey] ? ' input-error' : ''}`}
                          placeholder={metric.normalRange || ''}
                          {...register(metric.fieldKey, {
                            required: metric.mandatory ? 'Required' : false,
                            valueAsNumber: true,
                          })}
                        />
                        {metric.unit && <span className="form-unit">{metric.unit}</span>}
                      </div>
                      {errors[metric.fieldKey] && (
                        <span className="error-msg">{errors[metric.fieldKey].message}</span>
                      )}
                      {metric.normalRange && (
                        <span className="form-helper">Normal: {metric.normalRange}</span>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="form-group">
                <label className="form-label">Notes (Optional)</label>
                <textarea className="form-textarea" placeholder="Add any additional notes..." rows="3" {...register('notes')} />
              </div>
            </form>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" form="vitalsForm" type="submit" disabled={saving || loading}>
            <svg viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {saving ? 'Saving...' : 'Save Vitals'}
          </button>
        </div>
      </div>
    </div>
  )
}
