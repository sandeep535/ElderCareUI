import { useForm, useWatch } from 'react-hook-form'
import { useState, useEffect, useRef } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { fetchMedicationMaster, fetchMasterData } from '../../api/endpoints'
import '../UI/UI.css'
import '../UI/Form.css'
import './AddMedicationModal.css'

const schema = yup.object({
  medDrugName:          yup.string().required('Medication name is required'),
  medRxNorm:            yup.string(),
  medOrderPriority:     yup.string().required('Order priority is required'),
  medIndication:        yup.string(),
  medStrengthValue:     yup.string().required('Strength is required'),
  medStrengthUnit:      yup.string().required('Strength unit is required'),
  medDoseForm:          yup.string().required('Dose form is required'),
  medDoseAmount:        yup.string().required('Dose per administration is required'),
  medRoute:             yup.string().required('Route is required'),
  medFrequency:         yup.string().required('Frequency is required'),
  medPrnReason:         yup.string(),
  medPrnMax:            yup.string(),
  medIvRate:            yup.string(),
  medIvRateUnit:        yup.string(),
  medIvVolume:          yup.string(),
  medStartDateTime:     yup.string().required('Start date & time is required'),
  medStopDateTime:      yup.string(),
  medDuration:          yup.string(),
  medOrderingProvider:  yup.string().required('Ordering provider is required'),
  medSig:               yup.string().required('Patient directions are required'),
  medAdminInstructions: yup.string(),
  medPharmacyComments:  yup.string(),
  medAckAllergies:      yup.boolean().oneOf([true], 'You must acknowledge allergy review'),
  medAckDupe:           yup.boolean().oneOf([true], 'You must acknowledge interaction screening'),
})

export default function AddMedicationModal({ onClose, onSave, viewData = null }) {
  const { register, handleSubmit, setValue, control, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { medOrderPriority: 'routine', medStrengthUnit: 'mg', medIvRateUnit: 'mL/hr' },
  })

  const [saving,          setSaving]          = useState(false)
  const [saveStatus,      setSaveStatus]      = useState(null)
  const [errorMsg,        setErrorMsg]        = useState('')
  const [drugList,        setDrugList]        = useState([])
  const [suggestions,     setSuggestions]     = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [masterId,        setMasterId]        = useState(null)
  const [priorities,      setPriorities]      = useState([])
  const [strengthUnits,   setStrengthUnits]   = useState([])
  const [doseForms,       setDoseForms]       = useState([])
  const [routes,          setRoutes]          = useState([])
  const [frequencies,     setFrequencies]     = useState([])
  const wrapperRef = useRef(null)

  useEffect(() => {
    fetchMedicationMaster()
      .then(res => setDrugList(Array.isArray(res) ? res : (res?.data || [])))
      .catch(() => {})
    const load = (key, setter) =>
      fetchMasterData(key)
        .then(res => setter(Array.isArray(res) ? res : (res?.data || [])))
        .catch(() => {})
    load('MED_ORDER_PRIORITY', setPriorities)
    load('STRENGTH_UNIT',      setStrengthUnits)
    load('DOSE_FORM',          setDoseForms)
    load('MED_ROUTE',          setRoutes)
    load('MED_FREQUENCY',      setFrequencies)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target))
        setShowSuggestions(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (viewData) return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">Medication Details</h2>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
        <div className="modal-body">
          <div className="view-detail-grid">
            {[
              ['Drug Name',          viewData.drugName],
              ['Strength',           viewData.strengthValue && viewData.strengthUnit ? `${viewData.strengthValue} ${viewData.strengthUnit}` : '--'],
              ['Dose Form',          viewData.doseForm       || '--'],
              ['Dose Amount',        viewData.doseAmount     || '--'],
              ['Route',              viewData.route          || '--'],
              ['Frequency',          viewData.frequency      || '--'],
              ['Order Priority',     viewData.orderPriority  || '--'],
              ['Indication',         viewData.indication     || '--'],
              ['Start Date',         viewData.startDateTime  ? new Date(viewData.startDateTime).toLocaleString() : '--'],
              ['Stop Date',          viewData.stopDateTime   ? new Date(viewData.stopDateTime).toLocaleString()  : '--'],
              ['Duration',           viewData.duration       || '--'],
              ['Ordering Provider',  viewData.orderingProvider || '--'],
              ['RxNorm',             viewData.rxNorm         || '--'],
              ['SIG',                viewData.sig            || '--'],
              ['Admin Instructions', viewData.adminInstructions  || '--'],
              ['Pharmacy Comments',  viewData.pharmacyComments   || '--'],
              ['Status',             viewData.active ? 'Active' : 'Inactive'],
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

  const handleDrugInput = (e) => {
    const val = e.target.value
    setMasterId(null)
    if (val.length > 0) {
      setSuggestions(drugList.filter(d =>
        d.active && d.drugName.toLowerCase().includes(val.toLowerCase())
      ))
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  const selectDrug = (drug) => {
    setValue('medDrugName',      drug.drugName,            { shouldValidate: true })
    setValue('medStrengthValue', drug.defaultStrength      || '')
    setValue('medStrengthUnit',  drug.defaultStrengthUnit  || 'mg')
    setValue('medDoseForm',      drug.defaultDoseForm?.toLowerCase().replace(' ', '_') || '')
    setMasterId(drug.id)
    setShowSuggestions(false)
  }

  const frequency = useWatch({ control, name: 'medFrequency' })
  const route     = useWatch({ control, name: 'medRoute' })
  const isPrn     = frequency === 'PRN'
  const isIv      = route === 'IV' || route === 'IVPB'

  const onSubmit = async (data) => {
    setSaving(true)
    setSaveStatus(null)
    try {
      await onSave({
        medicationMasterId:   masterId,
        rxNorm:               data.medRxNorm            || null,
        orderPriority:        data.medOrderPriority,
        indication:           data.medIndication        || null,
        strengthValue:        data.medStrengthValue,
        strengthUnit:         data.medStrengthUnit,
        doseForm:             data.medDoseForm,
        doseAmount:           data.medDoseAmount,
        route:                data.medRoute,
        frequency:            data.medFrequency,
        prnReason:            data.medPrnReason         || null,
        prnMaxDose:           data.medPrnMax            || null,
        ivRate:               data.medIvRate            || null,
        ivRateUnit:           data.medIvRateUnit        || null,
        ivVolume:             data.medIvVolume          || null,
        startDateTime:        data.medStartDateTime,
        stopDateTime:         data.medStopDateTime      || null,
        duration:             data.medDuration          || null,
        orderingProvider:     data.medOrderingProvider,
        sig:                  data.medSig,
        adminInstructions:    data.medAdminInstructions || null,
        pharmacyComments:     data.medPharmacyComments  || null,
        ackAllergiesReviewed: data.medAckAllergies,
        ackDupeReviewed:      data.medAckDupe,
      })
      setSaveStatus('success')
      setTimeout(onClose, 1500)
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to save medication. Please try again.')
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-container modal-large">
        <div className="modal-header">
          <h2 className="modal-title">New Medication Order (CPOE)</h2>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        <div className="modal-body">
          {saveStatus === 'success' && (
            <div className="save-status save-status--success">
              <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#10B981" strokeWidth="2"/><path d="M7 13L10 16L17 9" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Medication order saved successfully!
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="save-status save-status--error">
              <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="2"/><path d="M12 8V12M12 16H12.01" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/></svg>
              {errorMsg}
            </div>
          )}

          <p className="cpoe-hint">
            Fields follow common inpatient CPOE expectations: drug identification, dose/route/frequency, schedule, prescriber, patient instructions, and safety attestations.
          </p>

          <form id="medicationOrderForm" onSubmit={handleSubmit(onSubmit)}>

            <div className="form-row">
              <div className="form-group" ref={wrapperRef} style={{ position: 'relative' }}>
                <label className="form-label">Medication Name *</label>
                <input
                  type="text"
                  className={`form-input${errors.medDrugName ? ' input-error' : ''}`}
                  placeholder="Search drug name..."
                  {...register('medDrugName')}
                  onChange={(e) => { register('medDrugName').onChange(e); handleDrugInput(e) }}
                  autoComplete="off"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <ul className="autocomplete-list">
                    {suggestions.map(drug => (
                      <li key={drug.id} className="autocomplete-item" onMouseDown={() => selectDrug(drug)}>
                        <span>{drug.drugName}</span>
                        <span className="autocomplete-icd">{drug.defaultStrength}{drug.defaultStrengthUnit} · {drug.defaultDoseForm}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {errors.medDrugName && <span className="error-msg">{errors.medDrugName.message}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">RxNorm / Product Code (Optional)</label>
                <input type="text" className="form-input" placeholder="e.g. 860975" {...register('medRxNorm')} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Order Priority *</label>
                <select className="form-input" {...register('medOrderPriority')}>
                  <option value="">Select priority</option>
                  {priorities.map(p => <option key={p.id} value={p.lookupCode}>{p.lookupItem}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Clinical Indication</label>
                <input type="text" className="form-input" placeholder="e.g. Type 2 diabetes mellitus" {...register('medIndication')} />
              </div>
            </div>

            <p className="cpoe-legend">Drug Product</p>
            <div className="form-row form-row-3">
              <div className="form-group">
                <label className="form-label">Strength (per unit) *</label>
                <input type="text" className={`form-input${errors.medStrengthValue ? ' input-error' : ''}`} placeholder="e.g. 500" {...register('medStrengthValue')} />
                {errors.medStrengthValue && <span className="error-msg">{errors.medStrengthValue.message}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Strength Unit *</label>
                <select className="form-input" {...register('medStrengthUnit')}>
                  <option value="">Select unit</option>
                  {strengthUnits.map(s => <option key={s.id} value={s.lookupCode}>{s.lookupItem}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Dose Form *</label>
                <select className={`form-input${errors.medDoseForm ? ' input-error' : ''}`} {...register('medDoseForm')}>
                  <option value="">Select form</option>
                  {doseForms.map(d => <option key={d.id} value={d.lookupCode}>{d.lookupItem}</option>)}
                </select>
                {errors.medDoseForm && <span className="error-msg">{errors.medDoseForm.message}</span>}
              </div>
            </div>

            <p className="cpoe-legend">Dose & Route</p>
            <div className="form-row form-row-3">
              <div className="form-group">
                <label className="form-label">Dose per Administration *</label>
                <input type="text" className={`form-input${errors.medDoseAmount ? ' input-error' : ''}`} placeholder="e.g. 1 tablet, 10 mL" {...register('medDoseAmount')} />
                {errors.medDoseAmount && <span className="error-msg">{errors.medDoseAmount.message}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Route *</label>
                <select className={`form-input${errors.medRoute ? ' input-error' : ''}`} {...register('medRoute')}>
                  <option value="">Select route</option>
                  {routes.map(r => <option key={r.id} value={r.lookupCode}>{r.lookupItem}</option>)}
                </select>
                {errors.medRoute && <span className="error-msg">{errors.medRoute.message}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Frequency *</label>
                <select className={`form-input${errors.medFrequency ? ' input-error' : ''}`} {...register('medFrequency')}>
                  <option value="">Select frequency</option>
                  {frequencies.map(f => <option key={f.id} value={f.lookupCode}>{f.lookupItem}</option>)}
                </select>
                {errors.medFrequency && <span className="error-msg">{errors.medFrequency.message}</span>}
              </div>
            </div>

            {isPrn && (
              <div className="form-row cpoe-conditional">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">PRN Reason / Indication *</label>
                  <textarea className="form-textarea" rows="2" placeholder="e.g. Mild pain 4–6/10, fever per unit protocol" {...register('medPrnReason')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Dose / 24h (Optional)</label>
                  <input type="text" className="form-input" placeholder="e.g. 4 doses / 24h" {...register('medPrnMax')} />
                </div>
              </div>
            )}

            {isIv && (
              <div className="form-row cpoe-conditional form-row-3">
                <div className="form-group">
                  <label className="form-label">Infusion Rate *</label>
                  <input type="text" className="form-input" placeholder="e.g. 100" {...register('medIvRate')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Rate Unit *</label>
                  <select className="form-input" {...register('medIvRateUnit')}>
                    <option value="mL/hr">mL/hr</option>
                    <option value="gtt/min">gtt/min</option>
                    <option value="mg/min">mg/min</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Total Volume (mL)</label>
                  <input type="text" className="form-input" placeholder="e.g. 500" {...register('medIvVolume')} />
                </div>
              </div>
            )}

            <p className="cpoe-legend">Schedule & Prescriber</p>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Date & Time *</label>
                <input type="datetime-local" className={`form-input${errors.medStartDateTime ? ' input-error' : ''}`} {...register('medStartDateTime')} />
                {errors.medStartDateTime && <span className="error-msg">{errors.medStartDateTime.message}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Stop Date & Time (Optional)</label>
                <input type="datetime-local" className="form-input" {...register('medStopDateTime')} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Duration (Optional)</label>
                <input type="text" className="form-input" placeholder="e.g. 7 days, 5 doses" {...register('medDuration')} />
              </div>
              <div className="form-group">
                <label className="form-label">Ordering Provider *</label>
                <input type="text" className={`form-input${errors.medOrderingProvider ? ' input-error' : ''}`} placeholder="e.g. Dr. Michael Chen" {...register('medOrderingProvider')} />
                {errors.medOrderingProvider && <span className="error-msg">{errors.medOrderingProvider.message}</span>}
              </div>
            </div>

            <p className="cpoe-legend">Instructions</p>
            <div className="form-group">
              <label className="form-label">Patient Directions (SIG) *</label>
              <textarea className={`form-textarea${errors.medSig ? ' input-error' : ''}`} rows="3" placeholder="Plain-language directions the patient sees on the label" {...register('medSig')} />
              {errors.medSig && <span className="error-msg">{errors.medSig.message}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Administration Instructions (Optional)</label>
              <textarea className="form-textarea" rows="2" placeholder="e.g. Give with food, hold if hypotensive per protocol" {...register('medAdminInstructions')} />
            </div>
            <div className="form-group">
              <label className="form-label">Comments to Pharmacy (Optional)</label>
              <textarea className="form-textarea" rows="2" placeholder="Brand preference, renal dosing note, diluent, etc." {...register('medPharmacyComments')} />
            </div>

            <p className="cpoe-legend">Safety Attestations</p>
            <div className="form-group cpoe-checkbox-row">
              <label className="form-checkbox-label">
                <input type="checkbox" className="form-checkbox" {...register('medAckAllergies')} />
                <span>I have reviewed the documented allergy / intolerance list for this patient *</span>
              </label>
              {errors.medAckAllergies && <span className="error-msg">{errors.medAckAllergies.message}</span>}
            </div>
            <div className="form-group cpoe-checkbox-row">
              <label className="form-checkbox-label">
                <input type="checkbox" className="form-checkbox" {...register('medAckDupe')} />
                <span>I have reviewed duplicate therapy / interaction screening *</span>
              </label>
              {errors.medAckDupe && <span className="error-msg">{errors.medAckDupe.message}</span>}
            </div>

          </form>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" form="medicationOrderForm" type="submit" disabled={saving}>
            {saving
              ? <span className="btn-spinner" />
              : <><svg viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Sign & Send Order</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}
