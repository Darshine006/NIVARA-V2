import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import API from '../services/api';
import { offlineStorage } from '../services/offlineStorage';
import {
  Calendar,
  Clock,
  MapPin,
  Stethoscope,
  XCircle,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function MyAppointmentsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const res = await API.get('/appointments');
      if (res.data?.data) {
        setAppointments(res.data.data);
        offlineStorage.cacheAppointments(res.data.data);
      }
    } catch (err) {
      console.log('[MyAppointments] Reading appointments from local offline cache...');
      setAppointments(offlineStorage.getCachedAppointments());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    setCancellingId(appointmentId);
    setError('');
    setMessage('');

    try {
      const res = await API.delete(`/appointments/${appointmentId}`);
      if (res.data?.success) {
        setMessage('Appointment has been cancelled successfully.');
        // Update local state
        setAppointments((prev) =>
          prev.map((a) => (a._id === appointmentId ? { ...a, status: 'Cancelled' } : a))
        );
      }
    } catch (err) {
      setError(err.message || 'Unable to cancel appointment. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
            {t('nav_appointments')}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Manage and view your scheduled consultations at Primary Health Centers.
          </p>
        </div>

        <Link to="/book-appointment" className="btn btn-primary">
          <PlusCircle size={18} />
          <span>{t('nav_book_appointment')}</span>
        </Link>
      </div>

      {message && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{message}</span>
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
            fontSize: '0.9rem',
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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
          Loading your appointments...
        </div>
      ) : appointments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
          <Calendar size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
            No appointments booked yet
          </h3>
          <p style={{ fontSize: '0.95rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            Book your first consultation with your Primary Health Center with zero paperwork.
          </p>
          <Link to="/book-appointment" className="btn btn-primary">
            {t('book_now')}
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {appointments.map((appt) => (
            <div key={appt._id} className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                      {appt.service}
                    </h3>
                    <span
                      className={`badge ${
                        appt.status === 'Confirmed'
                          ? 'badge-confirmed'
                          : appt.status === 'Completed'
                          ? 'badge-completed'
                          : appt.status === 'Cancelled'
                          ? 'badge-cancelled'
                          : 'badge-pending'
                      }`}
                    >
                      {appt.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.9rem', color: '#475569' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={15} color="#2563eb" />
                      <span>{appt.center?.name || 'Primary Health Center'}</span>
                      {appt.center?.village && (
                        <span style={{ color: '#64748b' }}>
                          ({appt.center.village}, {appt.center.district})
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={15} color="#2563eb" />
                      <span>
                        Date: <strong>{appt.date}</strong> at <strong>{appt.time}</strong>
                      </span>
                    </div>

                    {appt.healthcareWorker && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Stethoscope size={15} color="#16a34a" />
                        <span>Doctor / Worker: {appt.healthcareWorker.name}</span>
                      </div>
                    )}

                    {appt.notes && (
                      <div style={{ marginTop: '0.4rem', fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
                        Notes: "{appt.notes}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Cancel Button (allowed only for Pending or Confirmed status) */}
                {(appt.status === 'Pending' || appt.status === 'Confirmed') && (
                  <button
                    type="button"
                    onClick={() => handleCancel(appt._id)}
                    disabled={cancellingId === appt._id}
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                  >
                    <XCircle size={15} />
                    <span>{cancellingId === appt._id ? 'Cancelling...' : 'Cancel Appointment'}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
