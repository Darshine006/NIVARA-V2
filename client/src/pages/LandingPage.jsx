import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useRegion } from '../context/RegionContext';
import {
  Globe,
  WifiOff,
  Gauge,
  Layers,
  Calendar,
  FileText,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Stethoscope,
  Building2,
  Sparkles,
} from 'lucide-react';

export default function LandingPage() {
  const { t } = useLanguage();
  const { regions, activeRegion, switchRegionByName } = useRegion();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem', paddingBottom: '3rem' }}>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(180deg, #ebf3f8 0%, #f4f8fb 100%)',
          padding: '4rem 1rem 3.5rem',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div className="container" style={{ textAlign: 'center', maxWidth: '820px' }}>
          {/* Tag badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.9rem',
              borderRadius: '9999px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#2563eb',
              fontSize: '0.825rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
              boxShadow: '0 2px 6px rgba(37,99,235,0.08)',
            }}
          >
            <Sparkles size={14} />
            <span>MODULAR RURAL HEALTHCARE PLATFORM</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.1rem, 5vw, 3.4rem)',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.03em',
              lineHeight: 1.18,
              marginBottom: '1.25rem',
            }}
          >
            {t('tagline')}
          </h1>

          <p
            style={{
              fontSize: '1.15rem',
              color: '#475569',
              lineHeight: 1.6,
              marginBottom: '2rem',
              maxWidth: '700px',
              margin: '0 auto 2rem',
            }}
          >
            {t('hero_sub')}
          </p>

          {/* Primary & Secondary CTAs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              marginBottom: '2rem',
            }}
          >
            <Link to="/register" className="btn btn-primary btn-lg">
              <span>{t('get_healthcare')}</span>
              <ArrowRight size={18} />
            </Link>

            <Link to="/login" className="btn btn-secondary btn-lg">
              <Stethoscope size={18} color="#2563eb" />
              <span>{t('worker_login')}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars Section */}
      <section className="container">
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2.5rem' }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            Built for India’s Rural Reality
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>
            Traditional hospital software fails in remote villages. NIVARA is built around four fundamental rural health principles.
          </p>
        </div>

        <div className="grid-4">
          {/* 1. Multilingual */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Globe size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
              {t('pillar_multilingual_title')}
            </h3>
            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.5 }}>
              {t('pillar_multilingual_desc')}
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '0.5rem', fontSize: '0.8rem', color: '#2563eb', fontWeight: 600 }}>
              Supported: English • தமிழ் • हिंदी
            </div>
          </div>

          {/* 2. Offline Ready */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <WifiOff size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
              {t('pillar_offline_title')}
            </h3>
            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.5 }}>
              {t('pillar_offline_desc')}
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '0.5rem', fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>
              Service Worker • Local Queue • Auto Sync
            </div>
          </div>

          {/* 3. Low Bandwidth */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Gauge size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
              {t('pillar_lowbandwidth_title')}
            </h3>
            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.5 }}>
              {t('pillar_lowbandwidth_desc')}
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '0.5rem', fontSize: '0.8rem', color: '#d97706', fontWeight: 600 }}>
              Zero heavy assets • Small JSON • 2G Ready
            </div>
          </div>

          {/* 4. Modular */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#f3e8ff',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Layers size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
              {t('pillar_modular_title')}
            </h3>
            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.5 }}>
              {t('pillar_modular_desc')}
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '0.5rem', fontSize: '0.8rem', color: '#7c3aed', fontWeight: 600 }}>
              Configurable regions & clinical services
            </div>
          </div>
        </div>
      </section>

      {/* One platform. Multiple communities Section */}
      <section className="container">
        <div
          className="card-soft"
          style={{
            padding: '2.5rem',
            background: 'linear-gradient(135deg, #eff6ff 0%, #ebf3f8 100%)',
            border: '1px solid #bfdbfe',
          }}
        >
          <div style={{ maxWidth: '750px', marginBottom: '2rem' }}>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#2563eb',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Modular Regional Architecture
            </span>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', margin: '0.4rem 0 0.8rem' }}>
              {t('modular_heading')}
            </h2>
            <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.6 }}>
              {t('modular_sub')}
            </p>
          </div>

          <div className="grid-3" style={{ gap: '1.25rem' }}>
            {regions.map((reg) => (
              <div
                key={reg._id || reg.name}
                style={{
                  background: activeRegion?.name === reg.name ? '#ffffff' : '#f8fafc',
                  border: activeRegion?.name === reg.name ? '2px solid #2563eb' : '1px solid #cbd5e1',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                  boxShadow: activeRegion?.name === reg.name ? '0 4px 14px rgba(37,99,235,0.1)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                    {reg.name}
                  </h4>
                  {activeRegion?.name === reg.name && (
                    <span className="badge badge-confirmed">Active</span>
                  )}
                </div>

                <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                  <strong>Languages:</strong> {reg.supportedLanguages.join(', ')} (Default: {reg.defaultLanguage})
                </div>

                <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                  <strong>Services:</strong> {reg.services.slice(0, 3).join(', ')}...
                </div>

                <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic', marginTop: '0.25rem' }}>
                  {reg.description}
                </div>

                <button
                  type="button"
                  onClick={() => switchRegionByName(reg.name)}
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: 'auto', alignSelf: 'flex-start' }}
                >
                  {activeRegion?.name === reg.name ? 'Currently Selected' : `Deploy ${reg.name}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accessible Healthcare Tools Grid */}
      <section className="container">
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            Accessible Healthcare Tools
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Community-facing guides and consultation planning for rural patients.
          </p>
        </div>

        <div className="grid-3">
          {/* Card 1: Book Appointment */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Calendar size={32} color="#2563eb" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{t('nav_book_appointment')}</h3>
            <p style={{ color: '#475569', fontSize: '0.9rem' }}>
              Schedule a visit at your nearest Primary Health Center with zero paperwork.
            </p>
            <Link to="/book-appointment" className="btn btn-subtle btn-sm" style={{ alignSelf: 'flex-start', marginTop: 'auto' }}>
              <span>{t('book_now')}</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Card 2: Symptom Guidance */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <ShieldCheck size={32} color="#16a34a" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{t('nav_symptoms')}</h3>
            <p style={{ color: '#475569', fontSize: '0.9rem' }}>
              Simple rule-based assessment to know whether to seek emergency care or monitor symptoms.
            </p>
            <Link to="/symptoms" className="btn btn-subtle btn-sm" style={{ alignSelf: 'flex-start', marginTop: 'auto' }}>
              <span>Evaluate Guidance</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Card 3: Healthcare Directory */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <MapPin size={32} color="#d97706" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{t('nav_centers')}</h3>
            <p style={{ color: '#475569', fontSize: '0.9rem' }}>
              Find working hours, emergency phone numbers, and available doctors in your taluk.
            </p>
            <Link to="/centers" className="btn btn-subtle btn-sm" style={{ alignSelf: 'flex-start', marginTop: 'auto' }}>
              <span>Search Directory</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
