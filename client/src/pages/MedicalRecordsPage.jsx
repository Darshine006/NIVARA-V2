import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import API from '../services/api';
import {
  FileText,
  Calendar,
  Stethoscope,
  Pill,
  Clock,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export default function MedicalRecordsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/records/${user?.id || user?._id}`);
        if (res.data?.data) {
          setRecords(res.data.data);
        }
      } catch (err) {
        setError(err.message || 'Unable to load medical records.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchRecords();
    }
  }, [user]);

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
          {t('records_title')}
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          Your verified health history, clinical consultation notes, and prescriptions.
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
          Loading your medical history...
        </div>
      ) : records.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
          <FileText size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
            {t('no_records')}
          </h3>
          <p style={{ fontSize: '0.95rem', maxWidth: '420px', margin: '0 auto' }}>
            When you complete a clinical consultation at a Primary Health Center, your diagnosis and treatment plan will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {records.map((rec) => (
            <div key={rec._id} className="card" style={{ padding: '1.75rem' }}>
              {/* Header with Date and Attending Doctor */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid #f1f5f9',
                  marginBottom: '1.25rem',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
                    Consultation Record
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                    <Calendar size={16} color="#64748b" />
                    <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
                      {new Date(rec.consultationDate).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: '0.875rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Stethoscope size={16} color="#16a34a" />
                  <span>
                    {t('attended_by')}: <strong>{rec.healthcareWorkerId?.name || 'Healthcare Worker'}</strong>
                  </span>
                </div>
              </div>

              {/* Clinical Details Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Symptoms */}
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    {t('symptoms')}
                  </h4>
                  <p style={{ color: '#0f172a', fontSize: '0.95rem', marginTop: '0.2rem' }}>
                    {rec.symptoms}
                  </p>
                </div>

                {/* Diagnosis */}
                <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
                    {t('diagnosis')}
                  </h4>
                  <p style={{ color: '#0f172a', fontSize: '1rem', fontWeight: 600, marginTop: '0.2rem' }}>
                    {rec.diagnosis}
                  </p>
                </div>

                {/* Prescription */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                    <Pill size={16} color="#2563eb" />
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      {t('prescription')}
                    </h4>
                  </div>
                  <div
                    style={{
                      background: '#eff6ff',
                      padding: '0.85rem 1rem',
                      borderRadius: '8px',
                      color: '#1e3a8a',
                      fontSize: '0.95rem',
                      fontWeight: 500,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {rec.prescription}
                  </div>
                </div>

                {/* Doctor Notes & Follow Up Date */}
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                  {rec.notes && (
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      <strong>Worker Notes:</strong> {rec.notes}
                    </div>
                  )}

                  {rec.followUpDate && (
                    <div style={{ fontSize: '0.875rem', color: '#d97706', fontWeight: 600 }}>
                      Follow-up recommended on:{' '}
                      {new Date(rec.followUpDate).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
