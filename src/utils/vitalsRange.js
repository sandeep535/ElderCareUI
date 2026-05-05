// Vital ranges — returns 'normal' | 'low' | 'high'
export const getVitalStatus = (key, value) => {
  const v = parseFloat(value)
  if (isNaN(v)) return null
  const ranges = {
    bpSystolic:  { low: 90,  high: 140 },
    bpDiastolic: { low: 60,  high: 90  },
    heartRate:   { low: 60,  high: 100 },
    temperature: { low: 97,  high: 99  },
    spo2:        { low: 95,  high: 100 },
  }
  const r = ranges[key]
  if (!r) return null
  if (v < r.low)  return 'low'
  if (v > r.high) return 'high'
  return 'normal'
}

export const VITAL_STATUS_LABEL = { normal: 'Normal', low: 'Low', high: 'High' }
export const VITAL_STATUS_COLOR = {
  normal: { color: '#10B981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)'  },
  low:    { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.3)'  },
  high:   { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)'   },
}
