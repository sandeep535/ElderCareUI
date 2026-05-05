// ─── Patients ────────────────────────────────────────────────────────────────
export const MOCK_PATIENTS = [
  {
    id: 'PL-2024-001',
    firstName: 'Margaret',
    lastName: 'Lee',
    name: 'Margaret Lee',
    age: 78,
    gender: 'Female',
    dob: '1946-03-15',
    dobFormatted: 'March 15, 1946',
    bloodType: 'O+',
    status: 'stable',
    room: '204',
    bed: 'A',
    aol: 45,
    birthdayDays: 42,
    admissionDate: '2024-01-10',
    avatar: '/Margaret Lee.png',
    physician: 'Dr. Michael Chen',
    nurse: 'Sarah Johnson, RN',
    specialist: 'Dr. Emily Wong (Cardio)',
    lastAssessment: '2 hours ago',
    allergies: 'Penicillin',
    medicalAlerts: ['Penicillin Allergy', 'Fall Risk'],
    vitals: { bp: '120/80', hr: '72 bpm', temp: '98.6°F', spo2: '98%', updatedAt: '2 hours ago' },
    emergencyContact: 'David Lee',
    emergencyPhone: '(555) 234-5678',
  },
  {
    id: 'PL-2024-002',
    firstName: 'Robert',
    lastName: 'Chen',
    name: 'Robert Chen',
    age: 82,
    gender: 'Male',
    dob: '1942-07-22',
    dobFormatted: 'July 22, 1942',
    bloodType: 'A+',
    status: 'warning',
    room: '206',
    bed: 'B',
    aol: 30,
    birthdayDays: 120,
    admissionDate: '2024-02-05',
    avatar: null,
    physician: 'Dr. Sarah Kim',
    nurse: 'Sarah Johnson, RN',
    specialist: 'Dr. James Park (Pulmo)',
    lastAssessment: '1 hour ago',
    allergies: 'Sulfa drugs',
    medicalAlerts: ['Sulfa Allergy', 'Diabetes'],
    vitals: { bp: '145/95', hr: '88 bpm', temp: '99.2°F', spo2: '95%', updatedAt: '1 hour ago' },
    emergencyContact: 'Linda Chen',
    emergencyPhone: '(555) 345-6789',
  },
  {
    id: 'PL-2024-003',
    firstName: 'Alice',
    lastName: 'Wong',
    name: 'Alice Wong',
    age: 74,
    gender: 'Female',
    dob: '1950-11-08',
    dobFormatted: 'November 8, 1950',
    bloodType: 'B+',
    status: 'stable',
    room: '208',
    bed: 'A',
    aol: 20,
    birthdayDays: 200,
    admissionDate: '2024-03-01',
    avatar: null,
    physician: 'Dr. Michael Chen',
    nurse: 'Sarah Johnson, RN',
    specialist: null,
    lastAssessment: '3 hours ago',
    allergies: 'None known',
    medicalAlerts: [],
    vitals: { bp: '115/75', hr: '68 bpm', temp: '98.4°F', spo2: '99%', updatedAt: '3 hours ago' },
    emergencyContact: 'Tom Wong',
    emergencyPhone: '(555) 456-7890',
  },
  {
    id: 'PL-2024-004',
    firstName: 'James',
    lastName: 'Tan',
    name: 'James Tan',
    age: 85,
    gender: 'Male',
    dob: '1939-05-14',
    dobFormatted: 'May 14, 1939',
    bloodType: 'AB-',
    status: 'critical',
    room: '210',
    bed: 'C',
    aol: 60,
    birthdayDays: 15,
    admissionDate: '2024-01-20',
    avatar: null,
    physician: 'Dr. Emily Wong',
    nurse: 'Sarah Johnson, RN',
    specialist: 'Dr. Robert Lim (Cardio)',
    lastAssessment: '30 mins ago',
    allergies: 'Aspirin, Latex',
    medicalAlerts: ['Aspirin Allergy', 'Latex Allergy', 'High Fall Risk'],
    vitals: { bp: '160/100', hr: '105 bpm', temp: '100.5°F', spo2: '92%', updatedAt: '30 mins ago' },
    emergencyContact: 'Mary Tan',
    emergencyPhone: '(555) 567-8901',
  },
]

// ─── Vitals History ───────────────────────────────────────────────────────────
export const MOCK_VITALS = {
  'PL-2024-001': [
    { id: 'v1', datetime: 'Today, 10:30 AM', bp: '120/80', hr: '72 bpm', temp: '98.6°F', spo2: '98%', by: 'Sarah Johnson', notes: '' },
    { id: 'v2', datetime: 'Today, 6:30 AM', bp: '118/78', hr: '70 bpm', temp: '98.4°F', spo2: '99%', by: 'Sarah Johnson', notes: '' },
    { id: 'v3', datetime: 'Yesterday, 10:30 AM', bp: '122/82', hr: '74 bpm', temp: '98.8°F', spo2: '97%', by: 'Sarah Johnson', notes: '' },
    { id: 'v4', datetime: 'Yesterday, 6:30 AM', bp: '119/79', hr: '71 bpm', temp: '98.5°F', spo2: '98%', by: 'Sarah Johnson', notes: '' },
  ],
}

// ─── Diagnoses ────────────────────────────────────────────────────────────────
export const MOCK_DIAGNOSES = {
  'PL-2024-001': [
    { id: 'd1', name: 'Hypertension', date: 'Jan 15, 2024', status: 'active', icdCode: 'I10', diagnosedBy: 'Dr. Michael Chen' },
    { id: 'd2', name: 'Type 2 Diabetes', date: 'Jan 15, 2024', status: 'chronic', icdCode: 'E11.9', diagnosedBy: 'Dr. Michael Chen' },
    { id: 'd3', name: 'Mild Cognitive Impairment', date: 'Feb 1, 2024', status: 'monitoring', icdCode: 'G31.84', diagnosedBy: 'Dr. Emily Wong' },
  ],
}

// ─── Medications ──────────────────────────────────────────────────────────────
export const MOCK_MEDICATIONS = {
  'PL-2024-001': [
    { id: 'm1', name: 'Metformin', details: '500mg tablet - Take 1 tablet twice daily with meals', nextDose: 'Next dose: 6:00 PM', status: 'active' },
    { id: 'm2', name: 'Lisinopril', details: '10mg tablet - Take 1 tablet once daily in the morning', nextDose: 'Next dose: Tomorrow 8:00 AM', status: 'active' },
    { id: 'm3', name: 'Aspirin', details: '81mg tablet - Take 1 tablet once daily', nextDose: 'Next dose: Tomorrow 8:00 AM', status: 'active' },
  ],
}

// ─── Clinical Notes ───────────────────────────────────────────────────────────
export const MOCK_NOTES = {
  'PL-2024-001': [
    { id: 'n1', author: 'Sarah Johnson, RN', date: 'Today, 2:30 PM', content: 'Patient reported feeling well. No complaints. Vital signs stable. Patient engaged in light activities. Appetite good.', type: 'progress', priority: 'normal' },
    { id: 'n2', author: 'Sarah Johnson, RN', date: 'Yesterday, 10:15 AM', content: 'Morning assessment completed. Patient alert and oriented. Blood pressure slightly elevated but within acceptable range. Medication administered as scheduled.', type: 'assessment', priority: 'normal' },
    { id: 'n3', author: 'Dr. Michael Chen', date: '2 days ago, 3:00 PM', content: "Follow-up visit. Patient's condition stable. Continue current medication regimen. Monitor blood glucose levels. Next review in 2 weeks.", type: 'progress', priority: 'normal' },
  ],
}

// ─── Surgical History ─────────────────────────────────────────────────────────
export const MOCK_SURGERIES = {
  'PL-2024-001': [
    { id: 's1', condition: 'Cataract Surgery (Right Eye)', year: '2015', surgeon: 'Dr. Alan Tan', facility: 'City Eye Hospital', type: 'elective' },
    { id: 's2', condition: 'Hip Replacement', year: '2017', surgeon: 'Dr. John Smith', facility: 'General Hospital', type: 'elective' },
  ],
}

// ─── Alerts ───────────────────────────────────────────────────────────────────
export const MOCK_ALERTS = [
  { id: 'a1', type: 'critical', title: 'Critical: James Tan', desc: 'Blood pressure elevated - 160/100', time: '5 minutes ago', patientId: 'PL-2024-004' },
  { id: 'a2', type: 'warning', title: 'Warning: Robert Chen', desc: 'SpO₂ level below normal - 95%', time: '15 minutes ago', patientId: 'PL-2024-002' },
  { id: 'a3', type: 'info', title: 'Medication Due', desc: 'Margaret Lee - Morning medication', time: '1 hour ago', patientId: 'PL-2024-001' },
  { id: 'a4', type: 'info', title: 'Vital Check Reminder', desc: 'Alice Wong - Next check in 30 mins', time: '2 hours ago', patientId: 'PL-2024-003' },
]

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export const MOCK_STATS = {
  totalPatients: 24,
  activeAlerts: 5,
  completedToday: 18,
  pendingTasks: 6,
}

// ─── Current User ─────────────────────────────────────────────────────────────
export const MOCK_USER = {
  id: 'u1',
  name: 'Sarah Johnson',
  role: 'Nurse',
  email: 'sarah.johnson@veohome.com',
}
