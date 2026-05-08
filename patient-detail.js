// Patient Detail Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Tab switching
    const tabs = document.querySelectorAll('.emr-tab');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and panels
            tabs.forEach(t => t.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding panel
            this.classList.add('active');
            const targetPanel = document.getElementById(targetTab);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
    
    // Get patient ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const patientId = urlParams.get('id');
    
    if (patientId) {
        // In a real application, you would fetch patient data based on ID
        console.log('Loading patient data for ID:', patientId);
        // loadPatientData(patientId);
    }
    
    // Birthday countdown calculation
    function calculateBirthdayCountdown() {
        const birthdayElement = document.getElementById('birthday-countdown');
        if (!birthdayElement) return;
        
        // Patient DOB: March 15, 1946
        const currentYear = new Date().getFullYear();
        const birthday = new Date(currentYear, 2, 15); // March is month 2 (0-indexed)
        const today = new Date();
        
        // Set time to midnight for accurate day calculation
        today.setHours(0, 0, 0, 0);
        birthday.setHours(0, 0, 0, 0);
        
        // If birthday has passed this year, calculate for next year
        if (birthday < today) {
            birthday.setFullYear(currentYear + 1);
        }
        
        // Calculate days difference
        const diffTime = birthday - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Update the countdown display
        if (diffDays === 0) {
            birthdayElement.textContent = 'Today! 🎉';
            birthdayElement.style.color = '#DC2626';
        } else if (diffDays === 1) {
            birthdayElement.textContent = 'Tomorrow! 🎂';
            birthdayElement.style.color = '#DC2626';
        } else {
            birthdayElement.textContent = `${diffDays} days`;
        }
    }
    
    // Calculate birthday countdown on page load
    calculateBirthdayCountdown();
    
    // ============================================
    // Record Vitals Modal
    // ============================================
    const recordVitalsModal = document.getElementById('recordVitalsModal');
    const recordVitalsBtns = document.querySelectorAll('.btn-record-vitals');
    const closeVitalsModal = document.getElementById('closeVitalsModal');
    const cancelVitals = document.getElementById('cancelVitals');
    const saveVitals = document.getElementById('saveVitals');
    const vitalsForm = document.getElementById('vitalsForm');
    
    // Open modal - handle all Record Vitals buttons
    recordVitalsBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            if (recordVitalsModal) {
                recordVitalsModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    // Close modal functions
    function closeVitalsModalFunc() {
        if (recordVitalsModal) {
            recordVitalsModal.classList.remove('active');
            document.body.style.overflow = '';
            if (vitalsForm) {
                vitalsForm.reset();
            }
        }
    }
    
    if (closeVitalsModal) {
        closeVitalsModal.addEventListener('click', closeVitalsModalFunc);
    }
    
    if (cancelVitals) {
        cancelVitals.addEventListener('click', closeVitalsModalFunc);
    }
    
    // Close modal when clicking outside
    if (recordVitalsModal) {
        recordVitalsModal.addEventListener('click', function(e) {
            if (e.target === recordVitalsModal) {
                closeVitalsModalFunc();
            }
        });
    }
    
    // Sync from Device
    const syncDeviceBtn = document.getElementById('syncDeviceBtn');
    if (syncDeviceBtn) {
        syncDeviceBtn.addEventListener('click', function() {
            console.log('Syncing from device...');
            const bpSystolic = document.getElementById('bpSystolic');
            const bpDiastolic = document.getElementById('bpDiastolic');
            const heartRate = document.getElementById('heartRate');
            const temperature = document.getElementById('temperature');
            const spo2 = document.getElementById('spo2');
            
            if (bpSystolic) bpSystolic.value = '120';
            if (bpDiastolic) bpDiastolic.value = '80';
            if (heartRate) heartRate.value = '72';
            if (temperature) temperature.value = '98.6';
            if (spo2) spo2.value = '98';
            
            // Show success feedback
            this.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)';
            this.style.borderColor = '#10B981';
            this.style.color = '#10B981';
            
            setTimeout(() => {
                this.style.background = '';
                this.style.borderColor = '';
                this.style.color = '';
            }, 2000);
        });
    }
    
    // Sync from AI
    const syncAiBtn = document.getElementById('syncAiBtn');
    if (syncAiBtn) {
        syncAiBtn.addEventListener('click', function() {
            console.log('Syncing from AI...');
            const bpSystolic = document.getElementById('bpSystolic');
            const bpDiastolic = document.getElementById('bpDiastolic');
            const heartRate = document.getElementById('heartRate');
            const temperature = document.getElementById('temperature');
            const spo2 = document.getElementById('spo2');
            
            if (bpSystolic) bpSystolic.value = '118';
            if (bpDiastolic) bpDiastolic.value = '78';
            if (heartRate) heartRate.value = '70';
            if (temperature) temperature.value = '98.4';
            if (spo2) spo2.value = '99';
            
            // Show success feedback
            this.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)';
            this.style.borderColor = '#8B5CF6';
            this.style.color = '#8B5CF6';
            
            setTimeout(() => {
                this.style.background = '';
                this.style.borderColor = '';
                this.style.color = '';
            }, 2000);
        });
    }
    
    // Save vitals
    if (saveVitals) {
        saveVitals.addEventListener('click', function(e) {
            e.preventDefault();
            
            const bpSystolic = document.getElementById('bpSystolic');
            const bpDiastolic = document.getElementById('bpDiastolic');
            const heartRate = document.getElementById('heartRate');
            const temperature = document.getElementById('temperature');
            const spo2 = document.getElementById('spo2');
            const notes = document.getElementById('vitalsNotes');
            
            // Basic validation
            if (!bpSystolic || !bpSystolic.value || !bpDiastolic || !bpDiastolic.value || 
                !heartRate || !heartRate.value || !temperature || !temperature.value || 
                !spo2 || !spo2.value) {
                alert('Please fill in all required vital signs fields.');
                return;
            }
            
            console.log('Saving vitals:', {
                bp: `${bpSystolic.value}/${bpDiastolic.value}`,
                heartRate: `${heartRate.value} bpm`,
                temperature: `${temperature.value}°F`,
                spo2: `${spo2.value}%`,
                notes: notes ? notes.value : ''
            });
            
            alert('Vital signs recorded successfully!');
            closeVitalsModalFunc();
        });
    }
    
    // ============================================
    // Add Diagnosis Modal
    // ============================================
    const addDiagnosisModal = document.getElementById('addDiagnosisModal');
    const closeDiagnosisModal = document.getElementById('closeDiagnosisModal');
    const cancelDiagnosis = document.getElementById('cancelDiagnosis');
    const saveDiagnosis = document.getElementById('saveDiagnosis');
    const diagnosisForm = document.getElementById('diagnosisForm');
    
    // Find the "Add Diagnosis" button
    const addDiagnosisButtons = document.querySelectorAll('.btn-primary');
    addDiagnosisButtons.forEach(btn => {
        const btnText = btn.textContent.trim();
        if (btnText.includes('Add Diagnosis')) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (addDiagnosisModal) {
                    addDiagnosisModal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                    
                    // Set today's date as default
                    const today = new Date().toISOString().split('T')[0];
                    const dateInput = document.getElementById('diagnosisDate');
                    if (dateInput) {
                        dateInput.value = today;
                    }
                }
            });
        }
    });
    
    // Close diagnosis modal functions
    function closeDiagnosisModalFunc() {
        if (addDiagnosisModal) {
            addDiagnosisModal.classList.remove('active');
            document.body.style.overflow = '';
            if (diagnosisForm) {
                diagnosisForm.reset();
            }
        }
    }
    
    if (closeDiagnosisModal) {
        closeDiagnosisModal.addEventListener('click', closeDiagnosisModalFunc);
    }
    
    if (cancelDiagnosis) {
        cancelDiagnosis.addEventListener('click', closeDiagnosisModalFunc);
    }
    
    // Close diagnosis modal when clicking outside
    if (addDiagnosisModal) {
        addDiagnosisModal.addEventListener('click', function(e) {
            if (e.target === addDiagnosisModal) {
                closeDiagnosisModalFunc();
            }
        });
    }
    
    // Save diagnosis
    if (saveDiagnosis) {
        saveDiagnosis.addEventListener('click', function(e) {
            e.preventDefault();
            
            const diagnosisName = document.getElementById('diagnosisName');
            const diagnosisDate = document.getElementById('diagnosisDate');
            const diagnosisStatus = document.getElementById('diagnosisStatus');
            const icdCode = document.getElementById('icdCode');
            const diagnosedBy = document.getElementById('diagnosedBy');
            const notes = document.getElementById('diagnosisNotes');
            
            // Basic validation
            if (!diagnosisName || !diagnosisName.value || !diagnosisDate || !diagnosisDate.value) {
                alert('Please fill in all required fields (Diagnosis Name and Date).');
                return;
            }
            
            // Format date for display
            const dateObj = new Date(diagnosisDate.value);
            const formattedDate = dateObj.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
            
            console.log('Saving diagnosis:', {
                name: diagnosisName.value,
                date: formattedDate,
                status: diagnosisStatus ? diagnosisStatus.value : '',
                icdCode: icdCode ? icdCode.value : '',
                diagnosedBy: diagnosedBy ? diagnosedBy.value : '',
                notes: notes ? notes.value : ''
            });
            
            alert('Diagnosis added successfully!');
            closeDiagnosisModalFunc();
        });
    }
    
    // ============================================
    // Add Clinical Note Modal
    // ============================================
    const addNoteModal = document.getElementById('addNoteModal');
    const closeNoteModal = document.getElementById('closeNoteModal');
    const cancelNote = document.getElementById('cancelNote');
    const saveNote = document.getElementById('saveNote');
    const noteForm = document.getElementById('noteForm');
    
    // Find the "Add Note" button
    const addNoteButtons = document.querySelectorAll('.btn-add-note');
    addNoteButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (addNoteModal) {
                addNoteModal.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                // Set current date/time as default
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const dateTimeValue = `${year}-${month}-${day}T${hours}:${minutes}`;
                
                const dateTimeInput = document.getElementById('noteDateTime');
                if (dateTimeInput) {
                    dateTimeInput.value = dateTimeValue;
                }
            }
        });
    });
    
    // Close note modal functions
    function closeNoteModalFunc() {
        if (addNoteModal) {
            addNoteModal.classList.remove('active');
            document.body.style.overflow = '';
            if (noteForm) {
                noteForm.reset();
            }
        }
    }
    
    if (closeNoteModal) {
        closeNoteModal.addEventListener('click', closeNoteModalFunc);
    }
    
    if (cancelNote) {
        cancelNote.addEventListener('click', closeNoteModalFunc);
    }
    
    // Close note modal when clicking outside
    if (addNoteModal) {
        addNoteModal.addEventListener('click', function(e) {
            if (e.target === addNoteModal) {
                closeNoteModalFunc();
            }
        });
    }
    
    // Save note
    if (saveNote) {
        saveNote.addEventListener('click', function(e) {
            e.preventDefault();
            
            const noteType = document.getElementById('noteType');
            const noteDateTime = document.getElementById('noteDateTime');
            const noteTitle = document.getElementById('noteTitle');
            const noteContent = document.getElementById('noteContent');
            const noteAuthor = document.getElementById('noteAuthor');
            const notePriority = document.getElementById('notePriority');
            
            // Basic validation
            if (!noteType || !noteType.value || !noteDateTime || !noteDateTime.value || 
                !noteContent || !noteContent.value.trim()) {
                alert('Please fill in all required fields (Note Type, Date & Time, and Clinical Note).');
                return;
            }
            
            // Format date for display
            const dateObj = new Date(noteDateTime.value);
            const formattedDate = dateObj.toLocaleString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            console.log('Saving clinical note:', {
                type: noteType.value,
                dateTime: formattedDate,
                title: noteTitle ? noteTitle.value : '',
                content: noteContent.value,
                author: noteAuthor ? noteAuthor.value : '',
                priority: notePriority ? notePriority.value : ''
            });
            
            alert('Clinical note saved successfully!');
            closeNoteModalFunc();
        });
    }
    
    // ============================================
    // Add Surgery Modal
    // ============================================
    const addSurgeryModal = document.getElementById('addSurgeryModal');
    const closeSurgeryModal = document.getElementById('closeSurgeryModal');
    const cancelSurgery = document.getElementById('cancelSurgery');
    const saveSurgery = document.getElementById('saveSurgery');
    const surgeryForm = document.getElementById('surgeryForm');
    
    // Find the "Add Surgery" button
    const addSurgeryButtons = document.querySelectorAll('.btn-add-surgery');
    addSurgeryButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (addSurgeryModal) {
                addSurgeryModal.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                // Set today's date as default
                const today = new Date().toISOString().split('T')[0];
                const dateInput = document.getElementById('surgeryDate');
                if (dateInput) {
                    dateInput.value = today;
                }
            }
        });
    });
    
    // Close surgery modal functions
    function closeSurgeryModalFunc() {
        if (addSurgeryModal) {
            addSurgeryModal.classList.remove('active');
            document.body.style.overflow = '';
            if (surgeryForm) {
                surgeryForm.reset();
            }
        }
    }
    
    if (closeSurgeryModal) {
        closeSurgeryModal.addEventListener('click', closeSurgeryModalFunc);
    }
    
    if (cancelSurgery) {
        cancelSurgery.addEventListener('click', closeSurgeryModalFunc);
    }
    
    // Close surgery modal when clicking outside
    if (addSurgeryModal) {
        addSurgeryModal.addEventListener('click', function(e) {
            if (e.target === addSurgeryModal) {
                closeSurgeryModalFunc();
            }
        });
    }
    
    // Save surgery
    if (saveSurgery) {
        saveSurgery.addEventListener('click', function(e) {
            e.preventDefault();
            
            const surgeryName = document.getElementById('surgeryName');
            const surgeryDate = document.getElementById('surgeryDate');
            const surgeryType = document.getElementById('surgeryType');
            const surgeonName = document.getElementById('surgeonName');
            const surgeryFacility = document.getElementById('surgeryFacility');
            const procedureCode = document.getElementById('procedureCode');
            const notes = document.getElementById('surgeryNotes');
            
            // Basic validation
            if (!surgeryName || !surgeryName.value || !surgeryDate || !surgeryDate.value) {
                alert('Please fill in all required fields (Surgery Name and Date).');
                return;
            }
            
            // Format date for display
            const dateObj = new Date(surgeryDate.value);
            const formattedDate = dateObj.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
            
            console.log('Saving surgery:', {
                name: surgeryName.value,
                date: formattedDate,
                type: surgeryType ? surgeryType.value : '',
                surgeon: surgeonName ? surgeonName.value : '',
                facility: surgeryFacility ? surgeryFacility.value : '',
                procedureCode: procedureCode ? procedureCode.value : '',
                notes: notes ? notes.value : ''
            });
            
            alert('Surgery added successfully!');
            closeSurgeryModalFunc();
        });
    }
    
    // ============================================
    // Add Medication (CPOE-style) Modal
    // ============================================
    const addMedicationModal = document.getElementById('addMedicationModal');
    const openAddMedicationBtn = document.getElementById('openAddMedicationModal');
    const closeMedicationModal = document.getElementById('closeMedicationModal');
    const cancelMedication = document.getElementById('cancelMedication');
    const saveMedication = document.getElementById('saveMedication');
    const medicationOrderForm = document.getElementById('medicationOrderForm');
    const medFrequencyEl = document.getElementById('medFrequency');
    const medRouteEl = document.getElementById('medRoute');

    function escMed(s) {
        const d = document.createElement('div');
        d.textContent = s == null ? '' : String(s);
        return d.innerHTML;
    }

    function updateMedCpoeVisibility() {
        const freq = medFrequencyEl ? medFrequencyEl.value : '';
        const route = medRouteEl ? medRouteEl.value : '';
        const prnGroup = document.getElementById('medPrnGroup');
        const prnReason = document.getElementById('medPrnReason');
        const ivGroup = document.getElementById('medIvGroup');
        const ivRate = document.getElementById('medIvRate');

        if (prnGroup) {
            prnGroup.classList.toggle('cpoe-hidden', freq !== 'PRN');
        }
        if (prnReason) {
            prnReason.required = freq === 'PRN';
        }

        const showIv = route === 'IV' || route === 'IVPB';
        if (ivGroup) {
            ivGroup.classList.toggle('cpoe-hidden', !showIv);
        }
        if (ivRate) {
            ivRate.required = showIv;
        }
    }

    function openMedicationModalFunc() {
        if (!addMedicationModal) return;
        addMedicationModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const h = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        const startEl = document.getElementById('medStartDateTime');
        if (startEl) {
            startEl.value = `${y}-${m}-${day}T${h}:${min}`;
        }
        updateMedCpoeVisibility();
    }

    function closeMedicationModalFunc() {
        if (addMedicationModal) {
            addMedicationModal.classList.remove('active');
            document.body.style.overflow = '';
            if (medicationOrderForm) {
                medicationOrderForm.reset();
            }
            const prnReason = document.getElementById('medPrnReason');
            if (prnReason) prnReason.required = false;
            const ivRate = document.getElementById('medIvRate');
            if (ivRate) ivRate.required = false;
            updateMedCpoeVisibility();
        }
    }

    if (openAddMedicationBtn) {
        openAddMedicationBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openMedicationModalFunc();
        });
    }

    if (closeMedicationModal) {
        closeMedicationModal.addEventListener('click', closeMedicationModalFunc);
    }
    if (cancelMedication) {
        cancelMedication.addEventListener('click', closeMedicationModalFunc);
    }
    if (addMedicationModal) {
        addMedicationModal.addEventListener('click', function(e) {
            if (e.target === addMedicationModal) {
                closeMedicationModalFunc();
            }
        });
    }
    if (medFrequencyEl) {
        medFrequencyEl.addEventListener('change', updateMedCpoeVisibility);
    }
    if (medRouteEl) {
        medRouteEl.addEventListener('change', updateMedCpoeVisibility);
    }

    if (saveMedication) {
        saveMedication.addEventListener('click', function(e) {
            e.preventDefault();

            const drugName = document.getElementById('medDrugName');
            const strengthVal = document.getElementById('medStrengthValue');
            const strengthUnit = document.getElementById('medStrengthUnit');
            const doseForm = document.getElementById('medDoseForm');
            const doseAmount = document.getElementById('medDoseAmount');
            const route = document.getElementById('medRoute');
            const frequency = document.getElementById('medFrequency');
            const prnReason = document.getElementById('medPrnReason');
            const startDt = document.getElementById('medStartDateTime');
            const orderingProvider = document.getElementById('medOrderingProvider');
            const sig = document.getElementById('medSig');
            const ackAllergies = document.getElementById('medAckAllergies');
            const ackDupe = document.getElementById('medAckDupe');
            const ivRate = document.getElementById('medIvRate');

            if (!drugName || !drugName.value.trim()) {
                alert('Medication name is required.');
                return;
            }
            if (!strengthVal || !strengthVal.value.trim() || !strengthUnit || !strengthUnit.value) {
                alert('Strength and unit are required.');
                return;
            }
            if (!doseForm || !doseForm.value || !doseAmount || !doseAmount.value.trim()) {
                alert('Dose form and dose per administration are required.');
                return;
            }
            if (!route || !route.value || !frequency || !frequency.value) {
                alert('Route and frequency are required.');
                return;
            }
            if (frequency.value === 'PRN' && (!prnReason || !prnReason.value.trim())) {
                alert('PRN reason / indication is required when frequency is PRN.');
                return;
            }
            if ((route.value === 'IV' || route.value === 'IVPB') && (!ivRate || !ivRate.value.trim())) {
                alert('Infusion rate is required for IV / IVPB orders.');
                return;
            }
            if (!startDt || !startDt.value) {
                alert('Start date and time are required.');
                return;
            }
            if (!orderingProvider || !orderingProvider.value.trim()) {
                alert('Ordering provider is required.');
                return;
            }
            if (!sig || !sig.value.trim()) {
                alert('Patient directions (SIG) are required.');
                return;
            }
            if (!ackAllergies || !ackAllergies.checked || !ackDupe || !ackDupe.checked) {
                alert('Please complete safety attestations (allergy list and duplicate / interaction review).');
                return;
            }

            const strengthText = `${strengthVal.value.trim()} ${strengthUnit.value}`;
            const doseFormLabel = doseForm.options[doseForm.selectedIndex].text;
            const routeLabel = route.options[route.selectedIndex].text;
            const freqLabel = frequency.options[frequency.selectedIndex].text;
            let detailParts = [
                `${escMed(strengthText)} ${escMed(doseFormLabel)} — ${escMed(doseAmount.value.trim())} per dose`,
                `${escMed(routeLabel)} · ${escMed(freqLabel)}`
            ];
            if (frequency.value === 'PRN' && prnReason && prnReason.value.trim()) {
                detailParts.push(`PRN: ${escMed(prnReason.value.trim())}`);
            }
            if ((route.value === 'IV' || route.value === 'IVPB') && ivRate && ivRate.value.trim()) {
                const unitEl = document.getElementById('medIvRateUnit');
                const unit = unitEl ? unitEl.value : '';
                detailParts.push(`Rate ${escMed(ivRate.value.trim())} ${escMed(unit)}`);
            }
            detailParts.push(`SIG: ${escMed(sig.value.trim())}`);
            detailParts.push(`Provider: ${escMed(orderingProvider.value.trim())}`);

            const list = document.querySelector('#medications .medications-list');
            if (list) {
                const item = document.createElement('div');
                item.className = 'medication-item';
                item.innerHTML = `
                    <div class="medication-info">
                        <h4 class="medication-name">${escMed(drugName.value.trim())}</h4>
                        <p class="medication-details">${detailParts.join('<br>')}</p>
                    </div>
                    <div class="medication-status">
                        <span class="medication-status-badge active">Pending verify</span>
                        <span class="medication-next-dose">Start: ${escMed(startDt.value.replace('T', ' '))}</span>
                    </div>
                `;
                list.insertBefore(item, list.firstChild);
            }

            console.log('CPOE medication order (demo):', Object.fromEntries(new FormData(medicationOrderForm)));

            alert('Order captured (demo). In production this would route to pharmacy verification and MAR build.');
            closeMedicationModalFunc();
        });
    }

    // Close modals with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (recordVitalsModal && recordVitalsModal.classList.contains('active')) {
                closeVitalsModalFunc();
            }
            if (addDiagnosisModal && addDiagnosisModal.classList.contains('active')) {
                closeDiagnosisModalFunc();
            }
            if (addNoteModal && addNoteModal.classList.contains('active')) {
                closeNoteModalFunc();
            }
            if (addSurgeryModal && addSurgeryModal.classList.contains('active')) {
                closeSurgeryModalFunc();
            }
            if (addMedicationModal && addMedicationModal.classList.contains('active')) {
                closeMedicationModalFunc();
            }
        }
    });
});
