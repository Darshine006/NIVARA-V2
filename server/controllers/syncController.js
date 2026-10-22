const MedicalRecord = require('../models/MedicalRecord');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const Appointment = require('../models/Appointment');
const HealthcareCenter = require('../models/HealthcareCenter');
const Region = require('../models/Region');

// @desc    Synchronize offline records & patients created by healthcare workers
// @route   POST /api/sync
// @access  Private (healthcare_worker, admin)
exports.syncOfflineData = async (req, res, next) => {
  try {
    const { records = [], patients = [] } = req.body;

    const patientIdMap = {}; // clientTempId -> real mongo ObjectId
    const syncedPatients = [];
    const syncedRecords = [];
    const errors = [];

    // 1. Sync offline registered patients first
    for (const pat of patients) {
      try {
        const clientTempId = pat.clientTempId || pat.id;
        const phone = pat.phone || '9999999999';
        const cleanPhone = phone.replace(/\D/g, '');
        const defaultEmail =
          pat.email && pat.email.trim() !== ''
            ? pat.email.trim().toLowerCase()
            : `offline_patient_${cleanPhone}_${Date.now().toString().slice(-4)}@nivara.in`;

        // Check if patient already exists by phone
        let user = await User.findOne({ phone, role: 'patient' });

        if (!user) {
          user = await User.create({
            name: pat.name,
            email: defaultEmail,
            password: `OfflinePass@${cleanPhone.slice(-4) || '2026'}`,
            phone: pat.phone,
            role: 'patient',
            preferredLanguage: pat.preferredLanguage || 'en',
            region: pat.region || pat.state || 'Tamil Nadu',
          });

          await PatientProfile.create({
            userId: user._id,
            age: Number(pat.age) || 30,
            gender: pat.gender || 'Female',
            village: pat.village || 'Field Village',
            district: pat.district || 'Community District',
            state: pat.state || pat.region || 'Tamil Nadu',
            emergencyContact: pat.emergencyContact || pat.phone,
            bloodGroup: pat.bloodGroup || 'Unknown',
          });
        }

        patientIdMap[clientTempId] = user._id;
        syncedPatients.push({
          clientTempId,
          realId: user._id,
          name: user.name,
        });
      } catch (err) {
        console.error('[Sync Controller] Error syncing patient:', err.message);
        errors.push({ type: 'patient', tempId: pat.clientTempId, error: err.message });
      }
    }

    // 2. Sync offline medical records
    for (const rec of records) {
      try {
        const clientTempId = rec.clientTempId || rec.id;

        // Idempotency check: see if record with this clientTempId was already synced
        if (clientTempId) {
          const existing = await MedicalRecord.findOne({ clientTempId });
          if (existing) {
            syncedRecords.push({
              clientTempId,
              realId: existing._id,
              status: 'already_synced',
            });
            continue;
          }
        }

        // Resolve real patient ID if this was an offline created patient
        let resolvedPatientId = rec.patientId;
        if (patientIdMap[resolvedPatientId]) {
          resolvedPatientId = patientIdMap[resolvedPatientId];
        }

        // Verify patient exists
        const patientExists = await User.findById(resolvedPatientId);
        if (!patientExists) {
          errors.push({
            type: 'record',
            clientTempId,
            error: `Patient ID ${resolvedPatientId} not found in central registry`,
          });
          continue;
        }

        const newRecord = await MedicalRecord.create({
          patientId: resolvedPatientId,
          healthcareWorkerId: req.user._id,
          consultationDate: rec.consultationDate ? new Date(rec.consultationDate) : new Date(),
          symptoms: rec.symptoms || 'General consultation',
          diagnosis: rec.diagnosis || 'Clinical evaluation completed',
          prescription: rec.prescription || 'Standard supportive care',
          notes: rec.notes || 'Recorded in offline field consultation',
          followUpDate: rec.followUpDate ? new Date(rec.followUpDate) : null,
          clientTempId,
          isOfflineCreated: true,
          syncedAt: new Date(),
        });

        syncedRecords.push({
          clientTempId,
          realId: newRecord._id,
          status: 'created',
        });
      } catch (err) {
        console.error('[Sync Controller] Error syncing medical record:', err.message);
        errors.push({ type: 'record', clientTempId: rec.clientTempId, error: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `Sync completed: ${syncedPatients.length} patients and ${syncedRecords.length} records processed.`,
      syncedPatientsCount: syncedPatients.length,
      syncedRecordsCount: syncedRecords.length,
      syncedPatients,
      syncedRecords,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system statistics for Admin Dashboard
// @route   GET /api/stats
// @access  Private (admin)
exports.getStats = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const [
      totalPatients,
      totalWorkers,
      totalAdmins,
      totalCenters,
      totalAppointments,
      appointmentsToday,
      totalRecords,
      offlineSyncedRecords,
      totalRegions,
    ] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'healthcare_worker' }),
      User.countDocuments({ role: 'admin' }),
      HealthcareCenter.countDocuments({ isActive: true }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ date: todayStr }),
      MedicalRecord.countDocuments(),
      MedicalRecord.countDocuments({ isOfflineCreated: true }),
      Region.countDocuments({ isActive: true }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        totalHealthcareWorkers: totalWorkers,
        totalAdmins,
        totalHealthcareCenters: totalCenters,
        totalAppointments,
        appointmentsToday,
        totalMedicalRecords: totalRecords,
        offlineSyncedRecords,
        activeRegions: totalRegions,
        serverTimestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};
