import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useRegion } from '../context/RegionContext';
import { useOfflineSync } from '../context/OfflineSyncContext';
import {
  Activity,
  Globe,
  Wifi,
  WifiOff,
  User,
  LogOut,
  Calendar,
  FileText,
  BookOpen,
  MapPin,
  ShieldAlert,
  Layers,
  Menu,
  X,
  RefreshCw,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isWorker, isAdmin, isPatient, logout } = useAuth();
  const { lang, setLanguage, t, availableLanguages } = useLanguage();
  const { regions, activeRegion, switchRegionByName } = useRegion();
  const {
    isOnline,
    status,
    pendingCount,
    syncNow,
    isSyncing,
    isSimulatedOffline,
    toggleSimulateOffline,
  } = useOfflineSync();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [regionMenuOpen, setRegionMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActivePath = (path) => location.pathname === path;

  return (
    <header
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Top Utility Bar: Modular Regional Deployment & Connectivity Controls */}
      <div
        style={{
          background: '#ebf3f8',
          borderBottom: '1px solid #dbeafe',
          padding: '0.35rem 1rem',
          fontSize: '0.8rem',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          {/* Active Regional Deployment Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <MapPin size={13} color="#2563eb" />
              <strong>{t('active_region')}:</strong>
            </span>
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setRegionMenuOpen(!regionMenuOpen)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '0.15rem 0.6rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#1e3a8a',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <span>{activeRegion?.name || 'Tamil Nadu'}</span>
                <span style={{ fontSize: '0.7rem' }}>▼</span>
              </button>

              {regionMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '4px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 100,
                    minWidth: '180px',
                    padding: '0.4rem 0',
                  }}
                >
                  <div
                    style={{
                      padding: '0.3rem 0.8rem',
                      fontSize: '0.7rem',
                      color: '#64748b',
                      borderBottom: '1px solid #f1f5f9',
                    }}
                  >
                    Select Regional Deployment
                  </div>
                  {regions.map((reg) => (
                    <button
                      key={reg.name}
                      type="button"
                      onClick={() => {
                        switchRegionByName(reg.name);
                        setRegionMenuOpen(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.45rem 0.8rem',
                        background:
                          activeRegion?.name === reg.name ? '#eff6ff' : 'transparent',
                        color:
                          activeRegion?.name === reg.name ? '#2563eb' : '#1e293b',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: activeRegion?.name === reg.name ? 700 : 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>{reg.name}</span>
                      {activeRegion?.name === reg.name && (
                        <span style={{ fontSize: '0.7rem', color: '#2563eb' }}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Status Bar Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Offline Simulation Button */}
            <button
              type="button"
              onClick={toggleSimulateOffline}
              title="Toggle simulated offline state for field testing"
              style={{
                background: isSimulatedOffline ? '#fee2e2' : '#ffffff',
                border: isSimulatedOffline ? '1px solid #f87171' : '1px solid #cbd5e1',
                color: isSimulatedOffline ? '#991b1b' : '#475569',
                borderRadius: '6px',
                padding: '0.15rem 0.5rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {isSimulatedOffline ? 'Simulating Offline' : 'Test Offline Mode'}
            </button>

            {/* Connection Status Pill */}
            <div className={`status-pill ${status}`}>
              {status === 'online' && <Wifi size={13} color="#059669" />}
              {status === 'poor' && <Wifi size={13} color="#d97706" />}
              {status === 'offline' && <WifiOff size={13} color="#dc2626" />}
              <span>
                {status === 'online' && t('status_online')}
                {status === 'poor' && t('status_poor')}
                {status === 'offline' && t('status_offline')}
              </span>
            </div>

            {/* Sync trigger if pending */}
            {pendingCount > 0 && isOnline && (
              <button
                type="button"
                onClick={syncNow}
                disabled={isSyncing}
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.15rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: isSyncing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <RefreshCw size={11} className={isSyncing ? 'animate-spin' : ''} />
                <span>{isSyncing ? t('syncing') : `Sync (${pendingCount})`}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="container" style={{ padding: '0.75rem 1.25rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo & Brand Tagline */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 6px rgba(37,99,235,0.3)',
              }}
            >
              <Activity size={22} />
            </div>
            <div>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}
              >
                {t('app_name')}
              </div>
              <div
                style={{
                  fontSize: '0.7rem',
                  color: '#64748b',
                  fontWeight: 500,
                }}
              >
                Rural Health Platform
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
            }}
            className="desktop-nav"
          >
            {/* Public or Role-Specific Links */}
            {!isAuthenticated && (
              <>
                <Link
                  to="/book-appointment"
                  style={{
                    color: isActivePath('/book-appointment') ? '#2563eb' : '#334155',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  {t('nav_book_appointment')}
                </Link>
                <Link
                  to="/symptoms"
                  style={{
                    color: isActivePath('/symptoms') ? '#2563eb' : '#334155',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  {t('nav_symptoms')}
                </Link>
                <Link
                  to="/centers"
                  style={{
                    color: isActivePath('/centers') ? '#2563eb' : '#334155',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  {t('nav_centers')}
                </Link>
                <Link
                  to="/health-info"
                  style={{
                    color: isActivePath('/health-info') ? '#2563eb' : '#334155',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  {t('nav_articles')}
                </Link>
              </>
            )}

            {/* Patient Links */}
            {isPatient && (
              <>
                <Link
                  to="/patient"
                  style={{
                    color: isActivePath('/patient') ? '#2563eb' : '#334155',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  {t('nav_dashboard')}
                </Link>
                <Link
                  to="/book-appointment"
                  style={{
                    color: isActivePath('/book-appointment') ? '#2563eb' : '#334155',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  {t('nav_book_appointment')}
                </Link>
                <Link
                  to="/my-appointments"
                  style={{
                    color: isActivePath('/my-appointments') ? '#2563eb' : '#334155',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  {t('nav_appointments')}
                </Link>
                <Link
                  to="/records"
                  style={{
                    color: isActivePath('/records') ? '#2563eb' : '#334155',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  {t('nav_records')}
                </Link>
                <Link
                  to="/symptoms"
                  style={{
                    color: isActivePath('/symptoms') ? '#2563eb' : '#334155',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  {t('nav_symptoms')}
                </Link>
                <Link
                  to="/centers"
                  style={{
                    color: isActivePath('/centers') ? '#2563eb' : '#334155',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  {t('nav_centers')}
                </Link>
              </>
            )}

            {/* Healthcare Worker Links */}
            {isWorker && (
              <>
                <Link
                  to="/worker"
                  style={{
                    color: isActivePath('/worker') ? '#2563eb' : '#334155',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  {t('nav_dashboard')}
                </Link>
                <Link
                  to="/worker/consultation"
                  style={{
                    color: isActivePath('/worker/consultation') ? '#2563eb' : '#334155',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  {t('start_consultation')}
                </Link>
                <Link
                  to="/worker/register-patient"
                  style={{
                    color: isActivePath('/worker/register-patient') ? '#2563eb' : '#334155',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  {t('register_new_patient')}
                </Link>
                <Link
                  to="/centers"
                  style={{
                    color: isActivePath('/centers') ? '#2563eb' : '#334155',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  {t('nav_centers')}
                </Link>
              </>
            )}

            {/* Administrator Links */}
            {isAdmin && (
              <>
                <Link
                  to="/admin"
                  style={{
                    color: isActivePath('/admin') ? '#2563eb' : '#334155',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  {t('admin_login')}
                </Link>
                <Link
                  to="/centers"
                  style={{
                    color: isActivePath('/centers') ? '#2563eb' : '#334155',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  {t('nav_centers')}
                </Link>
                <Link
                  to="/health-info"
                  style={{
                    color: isActivePath('/health-info') ? '#2563eb' : '#334155',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  {t('nav_articles')}
                </Link>
              </>
            )}

            {/* Language Switcher Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.75rem',
                  borderRadius: '8px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#1e293b',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Globe size={15} color="#2563eb" />
                <span>
                  {availableLanguages.find((l) => l.code === lang)?.native || 'English'}
                </span>
                <span style={{ fontSize: '0.65rem' }}>▼</span>
              </button>

              {langMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '6px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    zIndex: 100,
                    minWidth: '140px',
                    padding: '0.4rem 0',
                  }}
                >
                  {availableLanguages.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => {
                        setLanguage(l.code);
                        setLangMenuOpen(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.5rem 0.9rem',
                        background: lang === l.code ? '#eff6ff' : 'transparent',
                        color: lang === l.code ? '#2563eb' : '#0f172a',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: lang === l.code ? 700 : 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>{l.native}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {l.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth Buttons */}
            {!isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Link to="/login" className="btn btn-secondary btn-sm">
                  {t('nav_login')}
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  {t('nav_register')}
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: '#f8fafc',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <User size={15} color="#2563eb" />
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#0f172a',
                      maxWidth: '120px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {user?.name || 'User'}
                  </span>
                  <span
                    className={`badge ${
                      isAdmin
                        ? 'badge-cancelled'
                        : isWorker
                        ? 'badge-confirmed'
                        : 'badge-completed'
                    }`}
                    style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem' }}
                  >
                    {user?.role === 'healthcare_worker'
                      ? 'Worker'
                      : user?.role === 'admin'
                      ? 'Admin'
                      : 'Patient'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                  title="Logout"
                  style={{ padding: '0.45rem 0.65rem' }}
                >
                  <LogOut size={15} color="#ef4444" />
                </button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#0f172a',
              padding: '0.4rem',
            }}
            className="mobile-toggle"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown Drawer */}
        {mobileMenuOpen && (
          <div
            style={{
              paddingTop: '1rem',
              marginTop: '0.75rem',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            {!isAuthenticated ? (
              <>
                <Link
                  to="/book-appointment"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ padding: '0.4rem 0', fontWeight: 600 }}
                >
                  {t('nav_book_appointment')}
                </Link>
                <Link
                  to="/symptoms"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ padding: '0.4rem 0', fontWeight: 600 }}
                >
                  {t('nav_symptoms')}
                </Link>
                <Link
                  to="/centers"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ padding: '0.4rem 0', fontWeight: 600 }}
                >
                  {t('nav_centers')}
                </Link>
                <Link
                  to="/health-info"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ padding: '0.4rem 0', fontWeight: 600 }}
                >
                  {t('nav_articles')}
                </Link>
                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid #f1f5f9',
                  }}
                >
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                  >
                    {t('nav_login')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                  >
                    {t('nav_register')}
                  </Link>
                </div>
              </>
            ) : (
              <>
                {isPatient && (
                  <>
                    <Link
                      to="/patient"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{ padding: '0.4rem 0', fontWeight: 600 }}
                    >
                      {t('nav_dashboard')}
                    </Link>
                    <Link
                      to="/book-appointment"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{ padding: '0.4rem 0', fontWeight: 600 }}
                    >
                      {t('nav_book_appointment')}
                    </Link>
                    <Link
                      to="/my-appointments"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{ padding: '0.4rem 0', fontWeight: 600 }}
                    >
                      {t('nav_appointments')}
                    </Link>
                    <Link
                      to="/records"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{ padding: '0.4rem 0', fontWeight: 600 }}
                    >
                      {t('nav_records')}
                    </Link>
                  </>
                )}
                {isWorker && (
                  <>
                    <Link
                      to="/worker"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{ padding: '0.4rem 0', fontWeight: 600 }}
                    >
                      {t('nav_dashboard')}
                    </Link>
                    <Link
                      to="/worker/consultation"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{ padding: '0.4rem 0', fontWeight: 600 }}
                    >
                      {t('start_consultation')}
                    </Link>
                    <Link
                      to="/worker/register-patient"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{ padding: '0.4rem 0', fontWeight: 600 }}
                    >
                      {t('register_new_patient')}
                    </Link>
                  </>
                )}
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ padding: '0.4rem 0', fontWeight: 600 }}
                  >
                    {t('admin_login')}
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-danger btn-sm"
                  style={{ marginTop: '0.5rem' }}
                >
                  {t('nav_logout')}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-toggle {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
}
