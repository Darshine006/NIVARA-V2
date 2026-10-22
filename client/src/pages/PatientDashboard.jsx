import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useRegion } from '../context/RegionContext';
import API from '../services/api';
import { offlineStorage } from '../services/offlineStorage';
import {
  Calendar,
  FileText,
  MapPin,
  ShieldCheck,
  BookOpen,
  User,
  PlusCircle,
  Clock,
  Phone,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export default function PatientDashboard() {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const { activeRegion } = useRegion();

  const [recentAppointments, setRecentAppointments] = useState([]);
  const [nearbyCenters, setNearbyCenters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch patient's appointments
        const apptRes = await API.get('/appointments?limit=3');
        if (apptRes.data?.data) {
          setRecentAppointments(apptRes.data.data);
          offlineStorage.cacheAppointments(apptRes.data.data);
        }

        // Fetch nearby healthcare centers in patient's state/district
        const centerRes = await API.get(`/centers?state=${encodeURIComponent(user?.region || activeRegion?.name || 'Tamil Nadu')}`);
        if (centerRes.data?.data) {
          setNearbyCenters(centerRes.data.data.slice(0, 3));
          offlineStorage.cacheCenters(centerRes.data.data);
        }
      } catch (err) {
        console.log('[PatientDashboard] Reading from local offline cache...');
        setRecentAppointments(offlineStorage.getCachedAppointments().slice(0, 3));
        setNearbyCenters(offlineStorage.getCachedCenters().slice(0, 3));
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.region, activeRegion?.name]);

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 4rem' }}>
      {/* Greeting & Patient Profile Header */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
          borderColor: '#bfdbfe',
          marginBottom: '2rem',
          padding: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
              Patient Portal
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0 0.5rem' }}>
              {t('greeting')}, {user?.name}!
            </h1>
            <p style={{ color: '#475569', fontSize: '0.95rem' }}>
              Village: <strong>{profile?.village || 'Local Village'}</strong> • District: <strong>{profile?.district || 'Community'}</strong> • State: <strong>{user?.region || profile?.state || 'Tamil Nadu'}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/book-appointment" className="btn btn-primary">
              <PlusCircle size={18} />
              <span>{t('nav_book_appointment')}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 6 Core Quick Action Cards */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
          {t('patient_quick_actions')}
        </h2>

        <div className="grid-3">
          {/* Action 1: Book Appointment */}
          <Link to="/book-appointment" className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>{t('nav_book_appointment')}</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Schedule your visit with a Primary Health Center doctor or healthcare worker.
            </p>
            <span style={{ marginTop: 'auto', paddingTop: '0.5rem', color: '#2563eb', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>Book Appointment</span>
              <ArrowRight size={14} />
            </span>
          </Link>

          {/* Action 2: My Appointments */}
          <Link to="/my-appointments" className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>{t('nav_appointments')}</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              View upcoming visits, check confirmation status, or reschedule/cancel.
            </p>
            <span style={{ marginTop: 'auto', paddingTop: '0.5rem', color: '#059669', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>View Appointments</span>
              <ArrowRight size={14} />
            </span>
          </Link>

          {/* Action 3: Health Records */}
          <Link to="/records" className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>{t('nav_records')}</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Access your medical history, clinical diagnoses, and prescriptions.
            </p>
            <span style={{ marginTop: 'auto', paddingTop: '0.5rem', color: '#d97706', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>View My Records</span>
              <ArrowRight size={14} />
            </span>
          </Link>

          {/* Action 4: Symptom Guidance */}
          <Link to="/symptoms" className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>{t('nav_symptoms')}</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Check symptoms to know whether to visit a clinic or seek emergency care.
            </p>
            <span style={{ marginTop: 'auto', paddingTop: '0.5rem', color: '#7c3aed', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>Evaluate Symptoms</span>
              <ArrowRight size={14} />
            </span>
          </Link>

          {/* Action 5: Find Healthcare */}
          <Link to="/centers" className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>{t('nav_centers')}</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Find working hours and emergency contacts for health centers in your taluk.
            </p>
            <span style={{ marginTop: 'auto', paddingTop: '0.5rem', color: '#0284c7', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>Find Centers</span>
              <ArrowRight size={14} />
            </span>
          </Link>

          {/* Action 6: Health Information */}
          <Link to="/health-info" className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ecfeff', color: '#0891b2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>{t('nav_articles')}</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Verified maternal care, child nutrition, hygiene, and disease prevention guides.
            </p>
            <span style={{ marginTop: 'auto', paddingTop: '0.5rem', color: '#0891b2', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>Browse Guides</span>
              <ArrowRight size={14} />
            </span>
          </Link>
        </div>
      </div>

      {/* Two Column Layout: Upcoming Appointments & Nearby Health Centers */}
      <div className="grid-2">
        {/* Left Column: Recent Appointments */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
              {t('recent_appointments')}
            </h3>
            <Link to="/my-appointments" style={{ color: '#2563eb', fontSize: '0.85rem', fontWeight: 700 }}>
              {t('view_all')}
            </Link>
          </div>

          {recentAppointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b' }}>
              <Calendar size={36} color="#cbd5e1" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ fontSize: '0.9rem' }}>{t('no_appointments')}</p>
              <Link to="/book-appointment" className="btn btn-subtle btn-sm" style={{ marginTop: '1rem' }}>
                {t('book_now')}
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentAppointments.map((appt) => (
                <div
                  key={appt._id}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
                        {appt.service}
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.2rem' }}>
                        {appt.center?.name || 'Primary Health Center'}
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
                  <div style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: '1rem' }}>
                    <span>Date: {appt.date}</span>
                    <span>Time: {appt.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Nearby Health Centers */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
              {t('nearby_centers')}
            </h3>
            <Link to="/centers" style={{ color: '#2563eb', fontSize: '0.85rem', fontWeight: 700 }}>
              {t('view_all')}
            </Link>
          </div>

          {nearbyCenters.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b' }}>
              <MapPin size={36} color="#cbd5e1" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ fontSize: '0.9rem' }}>No centers listed for this region yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {nearbyCenters.map((center) => (
                <div
                  key={center._id}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '1rem',
                  }}
                >
                  <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                    {center.name}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0.2rem 0' }}>
                    {center.village}, {center.district} ({center.state})
                  </p>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Phone size={13} color="#2563eb" />
                    <span>{center.contact}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
