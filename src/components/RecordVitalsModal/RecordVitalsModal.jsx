import { useForm, useWatch } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { getVitalStatus, VITAL_STATUS_LABEL, VITAL_STATUS_COLOR } from '../../utils/vitalsRange'
import '../UI/UI.css'
import '../UI/Form.css'
import './RecordVitalsModal.css'

const schema = yup.object({
  bpSystolic:  yup.number().min(0).max(300).required('Required').typeError('Enter a number'),
  bpDiastolic: yup.number().min(0).max(200).required('Required').typeError('Enter a number'),
  heartRate:   yup.number().min(0).max(300).required('Required').typeError('Enter a number'),
  temperature: yup.number().max(110, 'Must be ≤ 110°F').required('Required').typeError('Enter a number'),
  spo2:        yup.number().min(0).max(100).required('Required').typeError('Enter a number'),
  notes:       yup.string(),
})

function VitalBadge({ vitalKey, value }) {
  const status = getVitalStatus(vitalKey, value)
  if (!status) return null
  const c = VITAL_STATUS_COLOR[status]
  return (
    <span style={{
      fontSize: '0.6875rem', fontWeight: 600, padding: '2px 8px',
      borderRadius: '999px', marginLeft: 6,
      color: c.color, background: c.bg, border: `1px solid ${c.border}`,
    }}>
      {VITAL_STATUS_LABEL[status]}
    </span>
  )
}

export default function RecordVitalsModal({ onClose, onSave }) {
  const { register, handleSubmit, setValue, control, formState: { errors } } = useForm({ resolver: yupResolver(schema) })

  const watched = useWatch({ control, name: ['bpSystolic', 'bpDiastolic', 'heartRate', 'temperature', 'spo2'] })
  const [sys, dia, hr, temp, spo2] = watched

  const syncDevice = () => { setValue('bpSystolic', 120); setValue('bpDiastolic', 80); setValue('heartRate', 72); setValue('temperature', 98.6); setValue('spo2', 98) }
  const syncAI     = () => { setValue('bpSystolic', 118); setValue('bpDiastolic', 78); setValue('heartRate', 70); setValue('temperature', 98.4); setValue('spo2', 99) }

  const onSubmit = (data) => { onSave(data); onClose() }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">Record Vital Signs</h2>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
        <div className="modal-body">
          <div className="vitals-sync-buttons">
            <button type="button" className="btn-sync btn-sync-device" onClick={syncDevice}>
              <svg viewBox="0 0 24 24" fill="none"><rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 18H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Sync from Device
            </button>
            <button type="button" className="btn-sync btn-sync-ai" onClick={syncAI}>
              <svg viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Sync from AI
            </button>
          </div>
          <form id="vitalsForm" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Blood Pressure (BP)
                  <VitalBadge vitalKey="bpSystolic"  value={sys} />
                  <VitalBadge vitalKey="bpDiastolic" value={dia} />
                </label>
                <div className="form-input-group">
                  <input type="number" className={`form-input${errors.bpSystolic ? ' input-error' : ''}`} placeholder="120" {...register('bpSystolic')} />
                  <span className="form-separator">/</span>
                  <input type="number" className={`form-input${errors.bpDiastolic ? ' input-error' : ''}`} placeholder="80" {...register('bpDiastolic')} />
                </div>
                {(errors.bpSystolic || errors.bpDiastolic) && <span className="error-msg">Valid BP required</span>}
              </div>
              <div className="form-group">
                <label className="form-label">
                  Heart Rate (HR)
                  <VitalBadge vitalKey="heartRate" value={hr} />
                </label>
                <div className="form-input-group">
                  <input type="number" className={`form-input${errors.heartRate ? ' input-error' : ''}`} placeholder="72" {...register('heartRate')} />
                  <span className="form-unit">bpm</span>
                </div>
                {errors.heartRate && <span className="error-msg">{errors.heartRate.message}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Temperature
                  <VitalBadge vitalKey="temperature" value={temp} />
                </label>
                <div className="form-input-group">
                  <input type="number" step="0.1" className={`form-input${errors.temperature ? ' input-error' : ''}`} placeholder="98.6" {...register('temperature')} />
                  <span className="form-unit">°F</span>
                </div>
                {errors.temperature && <span className="error-msg">{errors.temperature.message}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">
                  SpO₂ (Oxygen Saturation)
                  <VitalBadge vitalKey="spo2" value={spo2} />
                </label>
                <div className="form-input-group">
                  <input type="number" className={`form-input${errors.spo2 ? ' input-error' : ''}`} placeholder="98" {...register('spo2')} />
                  <span className="form-unit">%</span>
                </div>
                {errors.spo2 && <span className="error-msg">{errors.spo2.message}</span>}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes (Optional)</label>
              <textarea className="form-textarea" placeholder="Add any additional notes..." rows="3" {...register('notes')} />
            </div>
          </form>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" form="vitalsForm" type="submit">
            <svg viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Save Vitals
          </button>
        </div>
      </div>
    </div>
  )
}
