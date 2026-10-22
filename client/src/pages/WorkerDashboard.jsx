import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useOfflineSync } from '../context/OfflineSyncContext';
import API from '../services/api';
import { offlineStorage } from '../services/offlineStorage';
import {
  Stethoscope,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  PlusCircle,
  FileText,
  Search,
  WifiOff,
  RefreshCw,
  Phone,
  MapPin,
  AlertCircle,
} from 'lucide-react';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { isOnline, pendingCount, syncNow, isSyncing } = useOfflineSync();

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientSearch, setPatientSearch] = useState('');
  const [message, setMessage] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const loadWorkerData = async () => {
    setLoading(true);
    try {
      // Fetch today's appointments
      const apptRes = await API.get('/appointments');
      if (apptRes.data?.data) {
        setAppointments(apptRes.data.data);
      }

      // Fetch patients
      const patRes = await API.get('/patients?limit=20');
      if (patRes.data?.data) {
        setPatients(patRes.data.data);
      }
    } catch (err) {
      console.log('[WorkerDashboard] Loading fallback cached data...');
      setAppointments(offlineStorage.getCachedAppointments());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkerData();
  }, []);

  const handleMarkCompleted = async (appointmentId) => {
    try {
      const res = await API.put(`/appointments/${appointmentId}`, { status: 'Completed' });
      if (res.data?.success) {
        setMessage('Appointment marked as Completed.');
        setAppointments((prev) =>
          prev.map((a) => (a._id === appointmentId ? { ...a, status: 'Completed' } : a))
        );
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert(err.message || 'Unable to update appointment status.');
    }
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.name?.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.phone?.includes(patientSearch) ||
      p.village?.toLowerCase().includes(patientSearch.toLowerCase())
  );

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 4rem' }}>
      {/* Top Banner: Worker Credentials & Action CTAs */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
          borderColor: '#bfdbfe',
          padding: '2rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#16a34a', fontWeight: 700, fontSize: '0.85rem' }}>
              <Stethoscope size={16} />
              <span>Healthcare Personnel Portal</span>
            </div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0' }}>
              {user?.name}
            </h1>
            <p style={{ color: '#475569', fontSize: '0.95rem' }}>
              Deployment Region: <strong>{user?.region || 'Tamil Nadu'}</strong> • Field Clinical Console
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/worker/register-patient" className="btn btn-secondary">
              <PlusCircle size={17} />
              <span>{t('register_new_patient')}</span>
            </Link>
            <Link to="/worker/consultation" className="btn btn-primary">
              <FileText size={17} />
              <span>{t('start_consultation')}</span>
            </Link>
          </div>
        </div>

        {/* Offline notice inside dashboard if items pending */}
        {pendingCount > 0 && (
          <div
            style={{
              marginTop: '1.25rem',
              background: '#fef3c7',
              border: '1px solid #fde68a',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#92400e', fontSize: '0.875rem' }}>
              <WifiOff size={16} />
              <span>
                <strong>{pendingCount}</strong> field consultation / patient records saved locally.
              </span>
            </div>
            {isOnline && (
              <button
                type="button"
                onClick={syncNow}
                disabled={isSyncing}
                className="btn btn-primary btn-sm"
              >
                <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
                <span>{isSyncing ? 'Syncing...' : 'Sync to Central Registry'}</span>
              </button>
            )}
          </div>
        )}
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

      {/* Grid: Consultations & Appointments (Left) + Assigned Patients (Right) */}
      <div className="grid-2">
        {/* Left: Consultations & Appointments */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
              {t('today_appointments')}
            </h3>
            <span className="badge badge-outline">
              Total: {appointments.length}
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b' }}>
              Loading consultations...
            </div>
          ) : appointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
              <Calendar size={40} color="#cbd5e1" style={{ margin: '0 auto 0.75rem' }} />
              <p>No appointments scheduled for today.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {appointments.map((appt) => (
                <div
                  key={appt._id}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '1.1rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
                        {appt.patient?.name || 'Walk-in Patient'}
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: '#475569' }}>
                        Service: <strong>{appt.service}</strong> • Time: <strong>{appt.time}</strong> ({appt.date})
                      </p>
                    </div>

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

                  <div style={{ fontSize: '0.825rem', color: '#64748b', display: 'flex', gap: '1rem', margin: '0.4rem 0' }}>
                    <span>Village: {appt.patient?.village || 'Local'}</span>
                    <span>Age: {appt.patient?.age || 'N/A'}</span>
                    <span>Contact: {appt.patient?.phone || 'N/A'}</span>
                  </div>

                  {appt.notes && (
                    <div style={{ fontSize: '0.825rem', color: '#475569', fontStyle: 'italic', marginBottom: '0.6rem' }}>
                      Reason: "{appt.notes}"
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.6rem' }}>
                    <Link
                      to={`/worker/consultation?patientId=${appt.patient?._id || ''}&apptId=${appt._id}&patientName=${encodeURIComponent(appt.patient?.name || '')}`}
                      className="btn btn-primary btn-sm"
                    >
                      <span>Start Clinical Form</span>
                    </Link>

                    {appt.status !== 'Completed' && (
                      <button
                        type="button"
                        onClick={() => handleMarkCompleted(appt._id)}
                        className="btn btn-secondary btn-sm"
                      >
                        <CheckCircle2 size={14} color="#16a34a" />
                        <span>{t('mark_completed')}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Patient Directory Search */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
              Village Patient Registry
            </h3>
            <Link to="/worker/register-patient" className="btn btn-subtle btn-sm">
              <PlusCircle size={14} />
              <span>Register Patient</span>
            </Link>
          </div>

          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by patient name, phone, or village..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              style={{ paddingLeft: '2.3rem' }}
            />
            <Search
              size={16}
              color="#94a3b8"
              style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }}
            />
          </div>

          {filteredPatients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b' }}>
              <Users size={36} color="#cbd5e1" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.9rem' }}>No matching patients found.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '520px', overflowY: 'auto' }}>
              {filteredPatients.map((pat) => (
                <div
                  key={pat._id}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                      {pat.name}
                    </h4>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {pat.age} yrs • {pat.gender} • Village: <strong>{pat.village}</strong>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Ph: {pat.phone}
                    </div>
                  </div>

                  <Link
                    to={`/worker/consultation?patientId=${pat._id}&patientName=${encodeURIComponent(pat.name)}`}
                    className="btn btn-subtle btn-sm"
                  >
                    <span>Consult</span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
