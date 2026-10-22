import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useRegion } from '../context/RegionContext';
import API from '../services/api';
import { offlineStorage } from '../services/offlineStorage';
import {
  Calendar,
  Building2,
  Stethoscope,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  MapPin,
} from 'lucide-react';

const TIME_SLOTS = [
  '08:30 AM',
  '09:15 AM',
  '10:00 AM',
  '10:45 AM',
  '11:30 AM',
  '01:30 PM',
  '02:15 PM',
  '03:00 PM',
];

export default function BookAppointmentPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { activeRegion } = useRegion();
  const navigate = useNavigate();

  const [centers, setCenters] = useState([]);
  const [selectedCenterId, setSelectedCenterId] = useState('');
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [workers, setWorkers] = useState([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [time, setTime] = useState(TIME_SLOTS[0]);
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Load Healthcare Centers for active region
  useEffect(() => {
    const fetchCenters = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/centers?state=${encodeURIComponent(activeRegion?.name || 'Tamil Nadu')}`);
        if (res.data?.data && res.data.data.length > 0) {
          setCenters(res.data.data);
          offlineStorage.cacheCenters(res.data.data);

          // Default select first center
          const first = res.data.data[0];
          setSelectedCenterId(first._id);
          setServices(first.services || activeRegion?.services || []);
          setSelectedService(first.services?.[0] || 'General Consultation');
          setWorkers(first.healthcareWorkers || []);
        } else {
          // Fallback to active region services
          setServices(activeRegion?.services || ['General Consultation', 'Maternal & Child Health']);
          setSelectedService('General Consultation');
        }
      } catch (err) {
        console.log('[BookAppointment] Loading centers from offline cache...');
        const cached = offlineStorage.getCachedCenters();
        if (cached && cached.length > 0) {
          setCenters(cached);
          setSelectedCenterId(cached[0]._id);
          setServices(cached[0].services || []);
          setSelectedService(cached[0].services?.[0] || 'General Consultation');
          setWorkers(cached[0].healthcareWorkers || []);
        } else {
          setServices(activeRegion?.services || ['General Consultation', 'Maternal & Child Health']);
          setSelectedService('General Consultation');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCenters();
  }, [activeRegion?.name]);

  // When selected center changes, update available services and assigned workers
  const handleCenterChange = (centerId) => {
    setSelectedCenterId(centerId);
    const chosen = centers.find((c) => c._id === centerId);
    if (chosen) {
      setServices(chosen.services || []);
      setSelectedService(chosen.services?.[0] || 'General Consultation');
      setWorkers(chosen.healthcareWorkers || []);
      setSelectedWorkerId('');
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedCenterId || !selectedService || !date || !time) {
      setError('Please fill in all required appointment fields');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const payload = {
        healthcareCenterId: selectedCenterId,
        service: selectedService,
        healthcareWorkerId: selectedWorkerId || null,
        date,
        time,
        notes,
      };

      const res = await API.post('/appointments', payload);
      if (res.data?.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/my-appointments');
        }, 1500);
      } else {
        setError(res.data?.message || 'Unable to schedule appointment.');
      }
    } catch (err) {
      setError(err.message || 'Appointment booking failed. Please verify server connectivity.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1rem 5rem', maxWidth: '640px' }}>
      <div className="card" style={{ padding: '2.25rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <Calendar size={24} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            {t('nav_book_appointment')}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Schedule an in-person or tele-consultation visit at your Primary Health Center.
          </p>
        </div>

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
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
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
            <CheckCircle2 size={20} />
            <span>{t('booking_success')} Redirecting to your appointments...</span>
          </div>
        )}

        <form onSubmit={handleBooking}>
          {/* Step 1: Select Healthcare Center */}
          <div className="form-group">
            <label className="form-label">{t('appointment_center')} *</label>
            <select
              required
              className="form-select"
              value={selectedCenterId}
              onChange={(e) => handleCenterChange(e.target.value)}
            >
              {centers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} — {c.village}, {c.district}
                </option>
              ))}
              {centers.length === 0 && (
                <option value="">No centers available in this region</option>
              )}
            </select>
          </div>

          {/* Step 2: Select Service */}
          <div className="form-group">
            <label className="form-label">{t('appointment_service')} *</label>
            <select
              required
              className="form-select"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
            >
              {services.map((srv) => (
                <option key={srv} value={srv}>
                  {srv}
                </option>
              ))}
            </select>
          </div>

          {/* Step 3: Select Healthcare Worker (if assigned) */}
          {workers.length > 0 && (
            <div className="form-group">
              <label className="form-label">{t('appointment_worker')} (Optional)</label>
              <select
                className="form-select"
                value={selectedWorkerId}
                onChange={(e) => setSelectedWorkerId(e.target.value)}
              >
                <option value="">Any Available Duty Worker / Doctor</option>
                {workers.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name} ({w.role === 'healthcare_worker' ? 'Clinical Worker' : w.role})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Step 4: Date and Available Time Slots */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">{t('appointment_date')} *</label>
              <input
                type="date"
                required
                className="form-input"
                min={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('appointment_time')} *</label>
              <select
                required
                className="form-select"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Consultation Notes */}
          <div className="form-group">
            <label className="form-label">{t('appointment_notes')}</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="e.g. Follow-up for blood pressure check, child vaccination dose 2, or persistent cough."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.75rem' }}
            disabled={submitting || success}
          >
            <span>{submitting ? 'Confirming...' : t('confirm_booking')}</span>
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
