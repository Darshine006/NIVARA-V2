import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useRegion } from '../context/RegionContext';
import { useOfflineSync } from '../context/OfflineSyncContext';
import API from '../services/api';
import { offlineStorage } from '../services/offlineStorage';
import {
  UserPlus,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  WifiOff,
  ArrowRight,
} from 'lucide-react';

export default function WorkerRegisterPatientPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { activeRegion } = useRegion();
  const { isOnline, refreshPendingCount } = useOfflineSync();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    gender: 'Female',
    village: '',
    district: '',
    state: activeRegion?.name || 'Tamil Nadu',
    emergencyContact: '',
    bloodGroup: 'Unknown',
    preferredLanguage: activeRegion?.defaultLanguage || 'en',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.village) {
      setError('Please provide at least full name, phone number, and village');
      return;
    }

    setError('');
    setSubmitting(true);

    const patientPayload = {
      ...formData,
      age: Number(formData.age) || 30,
      emergencyContact: formData.emergencyContact || formData.phone,
    };

    // If offline, save directly to offline storage queue
    if (!isOnline) {
      console.log('[WorkerRegisterPatient] Offline detected. Queuing patient locally...');
      const saved = offlineStorage.saveOfflinePatient(patientPayload);
      refreshPendingCount();
      setSuccessMessage(
        `Patient "${saved.name}" registered in offline field registry! Will sync automatically when connected.`
      );
      setSubmitting(false);
      setTimeout(() => navigate('/worker'), 2000);
      return;
    }

    // If online, post to backend API
    try {
      const res = await API.post('/patients', patientPayload);
      if (res.data?.success) {
        setSuccessMessage('Patient registered successfully in central registry!');
        setTimeout(() => navigate('/worker'), 1500);
      } else {
        setError(res.data?.message || 'Failed to register patient.');
      }
    } catch (err) {
      if (err.isOffline || !window.navigator.onLine) {
        offlineStorage.saveOfflinePatient(patientPayload);
        refreshPendingCount();
        setSuccessMessage('Network unreachable. Patient saved locally in offline registry.');
        setTimeout(() => navigate('/worker'), 2000);
      } else {
        setError(err.message || 'Error registering patient.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 4rem', maxWidth: '640px' }}>
      <div className="card" style={{ padding: '2.25rem' }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#2563eb', fontWeight: 700, fontSize: '0.85rem' }}>
            <UserPlus size={16} />
            <span>Field Patient Intake</span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0' }}>
            {t('register_new_patient')}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Onboard village walk-in patients during clinic hours or remote field visits.
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
            <span>Offline mode active: New patient record will be saved locally and auto-synced.</span>
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
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">{t('patient_name')} *</label>
              <input
                type="text"
                name="name"
                required
                className="form-input"
                placeholder="e.g. Meenakshi Ammal"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('patient_contact')} *</label>
              <input
                type="tel"
                name="phone"
                required
                className="form-input"
                placeholder="10-digit phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('patient_age')} *</label>
              <input
                type="number"
                name="age"
                required
                className="form-input"
                placeholder="e.g. 42"
                value={formData.age}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('gender_label')} *</label>
              <select
                name="gender"
                className="form-select"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t('patient_village')} *</label>
              <input
                type="text"
                name="village"
                required
                className="form-input"
                placeholder="e.g. Alanganallur"
                value={formData.village}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('district_label')} *</label>
              <input
                type="text"
                name="district"
                required
                className="form-input"
                placeholder="e.g. Madurai"
                value={formData.district}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('state_label')} *</label>
              <input
                type="text"
                name="state"
                required
                className="form-input"
                value={formData.state}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('preferred_lang')}</label>
              <select
                name="preferredLanguage"
                className="form-select"
                value={formData.preferredLanguage}
                onChange={handleChange}
              >
                <option value="en">English</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="hi">हिंदी (Hindi)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={submitting || !!successMessage}
          >
            <span>{submitting ? 'Registering...' : 'Register Patient in Clinic'}</span>
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
