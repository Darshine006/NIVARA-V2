import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useOfflineSync } from '../context/OfflineSyncContext';
import API from '../services/api';
import { offlineStorage } from '../services/offlineStorage';
import {
  FileText,
  User,
  Stethoscope,
  Pill,
  Calendar,
  CheckCircle2,
  AlertCircle,
  WifiOff,
  ArrowRight,
} from 'lucide-react';

export default function WorkerConsultationPage() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { isOnline, refreshPendingCount } = useOfflineSync();
  const navigate = useNavigate();

  const preselectedPatientId = searchParams.get('patientId') || '';
  const preselectedPatientName = searchParams.get('patientName') || '';
  const preselectedApptId = searchParams.get('apptId') || '';

  const [patientId, setPatientId] = useState(preselectedPatientId);
  const [patientName, setPatientName] = useState(preselectedPatientName);
  const [patients, setPatients] = useState([]);
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load patients list for selection if not preselected
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const res = await API.get('/patients?limit=50');
        if (res.data?.data) {
          setPatients(res.data.data);
          if (!preselectedPatientId && res.data.data.length > 0) {
            setPatientId(res.data.data[0]._id);
            setPatientName(res.data.data[0].name);
          }
        }
      } catch (err) {
        console.log('[WorkerConsultation] Offline mode: enter patient manually or use cached');
      }
    };

    if (!preselectedPatientId) {
      loadPatients();
    }
  }, [preselectedPatientId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId || !symptoms || !diagnosis || !prescription) {
      setError('Please provide patient, observed symptoms, diagnosis, and prescription.');
      return;
    }

    setError('');
    setSubmitting(true);

    const recordPayload = {
      patientId,
      symptoms,
      diagnosis,
      prescription,
      notes,
      followUpDate: followUpDate || null,
      appointmentId: preselectedApptId || null,
      consultationDate: new Date().toISOString(),
    };

    // If offline, save directly to offline storage queue
    if (!isOnline) {
      console.log('[WorkerConsultation] Offline detected. Queuing record locally...');
      const saved = offlineStorage.saveOfflineRecord(recordPayload);
      refreshPendingCount();
      setSuccessMessage(
        'Consultation record saved locally in offline queue. It will automatically synchronize when internet returns.'
      );
      setSubmitting(false);
      setTimeout(() => navigate('/worker'), 2000);
      return;
    }

    // If online, send to API
    try {
      const res = await API.post('/records', recordPayload);
      if (res.data?.success) {
        setSuccessMessage('Medical consultation record added to central registry successfully!');
        setTimeout(() => navigate('/worker'), 1500);
      } else {
        setError(res.data?.message || 'Failed to submit medical record.');
      }
    } catch (err) {
      // If network fails during API call, fall back to offline queue
      if (err.isOffline || !window.navigator.onLine) {
        offlineStorage.saveOfflineRecord(recordPayload);
        refreshPendingCount();
        setSuccessMessage('Network unreachable. Record saved locally in offline queue.');
        setTimeout(() => navigate('/worker'), 2000);
      } else {
        setError(err.message || 'Error creating consultation record.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 4rem', maxWidth: '680px' }}>
      <div className="card" style={{ padding: '2.25rem' }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#2563eb', fontWeight: 700, fontSize: '0.85rem' }}>
            <Stethoscope size={16} />
            <span>Clinical Consultation Workflow</span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0' }}>
            {t('add_medical_record')}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Record observations, clinical diagnosis, and prescribed medications.
          </p>
        </div>

        {!isOnline && (
          <div
            style={{
              background: '#fef3c7',
              border: '1px solid #fde68a',
              color: '#92400e',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <WifiOff size={16} />
            <span>Offline mode active: Records will be securely cached locally and auto-synced.</span>
          </div>
        )}

        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div
            style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              padding: '1rem',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 600,
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Patient Selection */}
          <div className="form-group">
            <label className="form-label">{t('patient_name')} *</label>
            {preselectedPatientId ? (
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: '#0f172a',
                }}
              >
                {patientName || preselectedPatientId}
              </div>
            ) : (
              <select
                required
                className="form-select"
                value={patientId}
                onChange={(e) => {
                  setPatientId(e.target.value);
                  const p = patients.find((pat) => pat._id === e.target.value);
                  if (p) setPatientName(p.name);
                }}
              >
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} — {p.village} ({p.phone})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Symptoms */}
          <div className="form-group">
            <label className="form-label">{t('symptoms')} *</label>
            <textarea
              required
              rows="3"
              className="form-textarea"
              placeholder="e.g. High fever for 3 days (101°F), continuous dry cough, chest tightness."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
            />
          </div>

          {/* Diagnosis */}
          <div className="form-group">
            <label className="form-label">{t('diagnosis')} *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Acute Upper Respiratory Tract Infection (URTI)"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
            />
          </div>

          {/* Prescription */}
          <div className="form-group">
            <label className="form-label">{t('prescription')} *</label>
            <textarea
              required
              rows="4"
              className="form-textarea"
              placeholder="e.g. 1. Tab Paracetamol 500mg - 1 tab thrice daily after food x 3 days&#10;2. Tab Cetirizine 10mg - 1 tab at bedtime x 5 days&#10;3. Warm saline gargles and adequate hydration."
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
            />
          </div>

          {/* Additional Notes & Follow Up */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">{t('clinical_notes')}</label>
              <input
                type="text"
                className="form-input"
                placeholder="Optional clinical advice"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('follow_up_date')}</label>
              <input
                type="date"
                className="form-input"
                min={new Date().toISOString().split('T')[0]}
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={submitting || !!successMessage}
          >
            <span>{submitting ? 'Saving...' : 'Save Consultation Record'}</span>
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
