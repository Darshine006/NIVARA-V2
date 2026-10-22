import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useRegion } from '../context/RegionContext';
import { Activity, ShieldCheck, Heart, Globe, Wifi } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();
  const { activeRegion } = useRegion();

  return (
    <footer
      style={{
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '3rem 1rem 2rem',
        marginTop: 'auto',
      }}
    >
      <div className="container">
        <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
          {/* Brand Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#2563eb',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Activity size={18} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                {t('app_name')}
              </span>
            </div>
            <p style={{ color: '#475569', fontSize: '0.875rem', lineHeight: 1.5 }}>
              {t('tagline')}
            </p>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Active Deployment: <strong>{activeRegion?.name || 'Tamil Nadu'}</strong>
            </div>
          </div>

          {/* Core Principles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
              Core Principles
            </h4>
            <span style={{ fontSize: '0.85rem', color: '#475569' }}>1. Multilingual Access</span>
            <span style={{ fontSize: '0.85rem', color: '#475569' }}>2. Offline-First Capability</span>
            <span style={{ fontSize: '0.85rem', color: '#475569' }}>3. Low-Bandwidth Performance</span>
            <span style={{ fontSize: '0.85rem', color: '#475569' }}>4. Modular Regional Setup</span>
          </div>

          {/* Quick Access */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
              Community Services
            </h4>
            <span style={{ fontSize: '0.85rem', color: '#475569' }}>Primary Health Centers</span>
            <span style={{ fontSize: '0.85rem', color: '#475569' }}>Maternal & Child Health</span>
            <span style={{ fontSize: '0.85rem', color: '#475569' }}>Immunization Records</span>
            <span style={{ fontSize: '0.85rem', color: '#475569' }}>Field Tele-Consultation</span>
          </div>

          {/* Emergency & Disclaimer */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '0.9rem',
                fontSize: '0.8rem',
                color: '#475569',
              }}
            >
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ShieldCheck size={14} color="#2563eb" />
                Medical Disclaimer
              </div>
              NIVARA provides educational guidance and appointment coordination. In acute medical emergencies, immediately contact local emergency services (108) or your nearest hospital.
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid #f1f5f9',
            paddingTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8rem',
            color: '#64748b',
          }}
        >
          <div>
            © {new Date().getFullYear()} NIVARA Healthcare Platform. Designed for Rural Communities across India.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>Ultra Low Bandwidth (Zero Bloat)</span>
            <span>•</span>
            <span>Progressive Web App</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
